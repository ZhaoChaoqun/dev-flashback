import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Store render job status
const renderJobs = new Map();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'https://brave-wave-05556bb00.6.azurestaticapps.net',
  process.env.ALLOWED_ORIGIN,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Serve rendered videos
app.use('/output', express.static(path.join(__dirname, 'output')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start render job
app.post('/api/render', async (req, res) => {
  const { stats, backgroundMusic, orientation, width, height } = req.body;

  if (!stats) {
    return res.status(400).json({ error: 'Missing stats in request body' });
  }

  // Default to landscape dimensions if not specified
  const videoWidth = width || 1920;
  const videoHeight = height || 1080;
  const videoOrientation = orientation || 'landscape';

  const jobId = uuidv4();
  const outputPath = path.join(__dirname, 'output', `${jobId}.mp4`);

  // Initialize job status
  renderJobs.set(jobId, {
    status: 'pending',
    progress: 0,
    outputPath: null,
    error: null,
  });

  res.json({ jobId, status: 'pending' });

  // Start rendering in background
  (async () => {
    try {
      renderJobs.set(jobId, { ...renderJobs.get(jobId), status: 'bundling', progress: 5 });

      // Bundle the Remotion project
      const bundleLocation = await bundle({
        entryPoint: path.join(__dirname, 'src/remotion/index.ts'),
        onProgress: (progress) => {
          const currentJob = renderJobs.get(jobId);
          renderJobs.set(jobId, {
            ...currentJob,
            progress: 5 + progress * 15 // 5-20%
          });
        },
      });

      renderJobs.set(jobId, { ...renderJobs.get(jobId), status: 'preparing', progress: 20 });

      // Select composition with custom dimensions
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: 'YearlyReview',
        inputProps: { stats, backgroundMusic, orientation: videoOrientation },
      });

      // Override composition dimensions based on request
      const compositionWithDimensions = {
        ...composition,
        width: videoWidth,
        height: videoHeight,
      };

      renderJobs.set(jobId, { ...renderJobs.get(jobId), status: 'rendering', progress: 25 });

      // Render the video
      await renderMedia({
        composition: compositionWithDimensions,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputPath,
        inputProps: { stats, backgroundMusic, orientation: videoOrientation },
        onProgress: ({ progress }) => {
          const currentJob = renderJobs.get(jobId);
          renderJobs.set(jobId, {
            ...currentJob,
            progress: 25 + progress * 75 // 25-100%
          });
        },
      });

      renderJobs.set(jobId, {
        status: 'completed',
        progress: 100,
        outputPath: `/output/${jobId}.mp4`,
        error: null,
      });

      // Clean up bundle
      fs.rmSync(bundleLocation, { recursive: true, force: true });

      // Schedule file cleanup after 1 hour
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        renderJobs.delete(jobId);
      }, 60 * 60 * 1000);

    } catch (error) {
      console.error('Render error:', error);
      renderJobs.set(jobId, {
        status: 'failed',
        progress: 0,
        outputPath: null,
        error: error.message,
      });
    }
  })();
});

// Check render job status
app.get('/api/render/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId,
    ...job,
  });
});

// Download rendered video
app.get('/api/render/:jobId/download', (req, res) => {
  const { jobId } = req.params;
  const job = renderJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Video not ready yet', status: job.status });
  }

  const filePath = path.join(__dirname, 'output', `${jobId}.mp4`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Video file not found' });
  }

  res.download(filePath, `dev-flashback-${jobId}.mp4`);
});

app.listen(PORT, () => {
  console.log(`Render server running on http://localhost:${PORT}`);
});
