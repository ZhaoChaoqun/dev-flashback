module.exports = async function (context, req) {
  const { code } = req.body || {};

  if (!code) {
    context.res = {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Code is required' }
    };
    return;
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      context.res = {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
        body: { error: data.error_description || data.error }
      };
      return;
    }

    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    });

    const user = await userResponse.json();

    context.res = {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: {
        access_token: data.access_token,
        token_type: data.token_type,
        scope: data.scope,
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      }
    };
  } catch (error) {
    context.log.error('OAuth error:', error);
    context.res = {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Failed to authenticate with GitHub' }
    };
  }
};
