import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());

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
