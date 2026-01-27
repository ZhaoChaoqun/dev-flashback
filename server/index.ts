import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';

// Get GitHub OAuth URL
app.get('/api/auth/github', (_req, res) => {
  const redirectUri = `${process.env.REDIRECT_URI || 'http://localhost:3000'}`;
  const scope = 'read:user repo read:org';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  res.json({ url: authUrl, clientId: GITHUB_CLIENT_ID });
});

// Exchange code for access token
app.post('/api/auth/github/callback', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description || data.error });
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const user = await userResponse.json();

    res.json({
      access_token: data.access_token,
      token_type: data.token_type,
      scope: data.scope,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with GitHub' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
});

// Store render progress
const renderProgress: Record<string, { progress: number; status: string; outputPath?: string; error?: string }> = {};

// Start video render
app.post('/api/render', async (req, res) => {
  const { stats, backgroundMusic } = req.body;
  const renderId = `render_${Date.now()}`;

  if (!stats) {
    return res.status(400).json({ error: 'Stats are required' });
  }

  renderProgress[renderId] = { progress: 0, status: 'starting' };

  // Start rendering in background
  (async () => {
    try {
      renderProgress[renderId] = { progress: 5, status: 'bundling' };

      // Bundle the video
      const bundleLocation = await bundle({
        entryPoint: path.resolve(__dirname, '../src/remotion/index.ts'),
        webpackOverride: (config) => config,
      });

      renderProgress[renderId] = { progress: 20, status: 'preparing' };

      // Select composition
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'YearlyReview',
        inputProps: { stats, backgroundMusic },
      });

      renderProgress[renderId] = { progress: 30, status: 'rendering' };

      // Ensure output directory exists
      const outDir = path.resolve(__dirname, '../out');
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const outputPath = path.resolve(outDir, `${renderId}.mp4`);

      // Render the video
      await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: { stats, backgroundMusic },
        onProgress: ({ progress }) => {
          renderProgress[renderId] = {
            progress: 30 + Math.round(progress * 70),
            status: 'rendering',
          };
        },
      });

      renderProgress[renderId] = {
        progress: 100,
        status: 'completed',
        outputPath,
      };
    } catch (error) {
      console.error('Render error:', error);
      renderProgress[renderId] = {
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Render failed',
      };
    }
  })();

  res.json({ renderId });
});

// Get render progress
app.get('/api/render/:renderId', (req, res) => {
  const { renderId } = req.params;
  const progress = renderProgress[renderId];

  if (!progress) {
    return res.status(404).json({ error: 'Render not found' });
  }

  res.json(progress);
});

// Download rendered video
app.get('/api/render/:renderId/download', (req, res) => {
  const { renderId } = req.params;
  const progress = renderProgress[renderId];

  if (!progress || progress.status !== 'completed' || !progress.outputPath) {
    return res.status(404).json({ error: 'Video not ready' });
  }

  res.download(progress.outputPath, `github-flashback-${Date.now()}.mp4`, (err) => {
    if (err) {
      console.error('Download error:', err);
    }
    // Clean up after download
    setTimeout(() => {
      if (fs.existsSync(progress.outputPath!)) {
        fs.unlinkSync(progress.outputPath!);
      }
      delete renderProgress[renderId];
    }, 60000); // Clean up after 1 minute
  });
});
