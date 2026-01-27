module.exports = async function (context, req) {
  const clientId = process.env.GITHUB_CLIENT_ID || '';
  const redirectUri = process.env.REDIRECT_URI || 'https://your-app.azurestaticapps.net';
  const scope = 'read:user repo read:org';

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  context.res = {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { url: authUrl, clientId }
  };
};
