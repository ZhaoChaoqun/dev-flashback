import { useState, useCallback, useEffect } from 'react';
import { Player } from '@remotion/player';
import { YearlyReview } from './remotion/YearlyReview';
import { VIDEO_WIDTH, VIDEO_HEIGHT, VIDEO_FPS, TOTAL_DURATION, defaultStats } from './remotion/Root';
import { createGitHubClient, fetchYearlyStats } from './api/github';
import type { YearlyStats } from './types';
import './App.css';

// Use relative path for Azure Static Web Apps (API is at /api/*)
// Use localhost for local development
const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : '';

interface AuthUser {
  login: string;
  name: string | null;
  avatar_url: string;
}

function App() {
  const [token, setToken] = useState('');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<YearlyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDemo, setUseDemo] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('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');
  const [manualUsername, setManualUsername] = useState('chaoqunzhao_microsoft');
  const [backgroundMusic, setBackgroundMusic] = useState<string | undefined>(undefined);

  // Check for OAuth callback on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      handleOAuthCallback(code);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for stored token
    const storedToken = localStorage.getItem('github_token');
    const storedUser = localStorage.getItem('github_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAuthUser(JSON.parse(storedUser));
    }
  }, []);

  const handleOAuthCallback = async (code: string) => {
    setAuthLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/github/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setToken(data.access_token);
      setAuthUser(data.user);

      // Store in localStorage
      localStorage.setItem('github_token', data.access_token);
      localStorage.setItem('github_user', JSON.stringify(data.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/github`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate login');
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setAuthUser(null);
    setStats(null);
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  };

  const handleFetchStats = useCallback(async () => {
    const username = authUser?.login || manualUsername;
    const accessToken = token || manualToken;

    if (!accessToken || !username) {
      setError('Please login or enter credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = createGitHubClient(accessToken);
      const fetchedStats = await fetchYearlyStats(client, username, year);
      setStats(fetchedStats);
      setUseDemo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
    } finally {
      setLoading(false);
    }
  }, [token, manualToken, authUser, manualUsername, year]);

  const handleManualSubmit = useCallback(async () => {
    if (!manualToken || !manualUsername) {
      setError('Please enter both GitHub token and username');
      return;
    }
    setToken(manualToken);
    setAuthUser({ login: manualUsername, name: null, avatar_url: '' });
    setShowManualInput(false);

    setLoading(true);
    setError(null);

    try {
      const client = createGitHubClient(manualToken);
      const fetchedStats = await fetchYearlyStats(client, manualUsername, year);
      setStats(fetchedStats);
      setUseDemo(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub stats');
    } finally {
      setLoading(false);
    }
  }, [manualToken, manualUsername, year]);

  const handleDemoMode = () => {
    setStats(defaultStats);
    setUseDemo(true);
    setError(null);
  };

  const currentStats = stats || (useDemo ? defaultStats : null);

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">
          <span className="title-icon">🎬</span>
          Dev Flashback
        </h1>
        <p className="subtitle">Generate your GitHub year in review video</p>
      </header>

      <main className="main">
        {!currentStats ? (
          <div className="form-container">
            <div className="form-card">
              <h2>Get Started</h2>

              {authUser ? (
                // Logged in state
                <div className="auth-user">
                  <div className="user-info">
                    {authUser.avatar_url && (
                      <img src={authUser.avatar_url} alt={authUser.login} className="user-avatar" />
                    )}
                    <div>
                      <div className="user-name">{authUser.name || authUser.login}</div>
                      <div className="user-login">@{authUser.login}</div>
                    </div>
                  </div>
                  <button className="btn btn-text" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                // Not logged in
                <>
                  {!showManualInput ? (
                    <div className="auth-options">
                      <button
                        className="btn btn-github"
                        onClick={handleGitHubLogin}
                        disabled={authLoading}
                      >
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        {authLoading ? 'Connecting...' : 'Continue with GitHub'}
                      </button>

                      <div className="divider">
                        <span>or</span>
                      </div>

                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowManualInput(true)}
                      >
                        Enter Token Manually
                      </button>
                    </div>
                  ) : (
                    <div className="manual-input">
                      <button
                        className="btn btn-text back-btn"
                        onClick={() => setShowManualInput(false)}
                      >
                        ← Back
                      </button>

                      <div className="form-group">
                        <label htmlFor="token">GitHub Personal Access Token</label>
                        <input
                          id="token"
                          type="password"
                          value={manualToken}
                          onChange={(e) => setManualToken(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxx"
                        />
                        <small>
                          Need a token?{' '}
                          <a
                            href="https://github.com/settings/tokens/new?scopes=read:user,repo"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Create one here
                          </a>
                        </small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="username">GitHub Username</label>
                        <input
                          id="username"
                          type="text"
                          value={manualUsername}
                          onChange={(e) => setManualUsername(e.target.value)}
                          placeholder="octocat"
                        />
                      </div>

                      <button
                        className="btn btn-primary"
                        onClick={handleManualSubmit}
                        disabled={loading}
                      >
                        {loading ? 'Loading...' : 'Generate Video'}
                      </button>
                    </div>
                  )}
                </>
              )}

              {authUser && (
                <>
                  <div className="form-group">
                    <label htmlFor="year">Select Year</label>
                    <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button className="btn btn-primary" onClick={handleFetchStats} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate My Video'}
                  </button>
                </>
              )}

              {error && <div className="error">{error}</div>}

              {!authUser && !showManualInput && (
                <div className="demo-section">
                  <div className="divider">
                    <span>or try a demo</span>
                  </div>
                  <button className="btn btn-outline" onClick={handleDemoMode}>
                    🎬 View Demo Video
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="video-container">
            <div className="video-header">
              <h2>
                {currentStats.user.name || currentStats.user.login}'s {currentStats.year} Flashback
                {useDemo && <span className="demo-badge">Demo</span>}
              </h2>
              <button className="btn btn-secondary" onClick={() => setStats(null)}>
                Create New
              </button>
            </div>

            <div className="player-wrapper">
              <Player
                component={YearlyReview}
                inputProps={{ stats: currentStats, backgroundMusic }}
                durationInFrames={TOTAL_DURATION}
                fps={VIDEO_FPS}
                compositionWidth={VIDEO_WIDTH}
                compositionHeight={VIDEO_HEIGHT}
                style={{
                  width: '100%',
                  aspectRatio: `${VIDEO_WIDTH} / ${VIDEO_HEIGHT}`,
                }}
                controls
                autoPlay
                loop
              />
            </div>

            <div className="audio-control">
              <label htmlFor="bgm">Background Music: </label>
              <select
                id="bgm"
                value={backgroundMusic || ''}
                onChange={(e) => setBackgroundMusic(e.target.value || undefined)}
              >
                <option value="">No music</option>
                <option value="bgm.mp3">Default (bgm.mp3)</option>
              </select>
              <small className="audio-hint">
                Place your audio file (e.g., bgm.mp3) in the <code>public</code> folder first
              </small>
            </div>

            <div className="stats-summary">
              <div className="stat-card">
                <span className="stat-value">{currentStats.contributions.totalContributions.toLocaleString()}</span>
                <span className="stat-label">Contributions</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{currentStats.commitStats.totalCommits.toLocaleString()}</span>
                <span className="stat-label">Commits</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{currentStats.pullRequestStats.totalPRs}</span>
                <span className="stat-label">Pull Requests</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{currentStats.longestStreak}</span>
                <span className="stat-label">Day Streak</span>
              </div>
            </div>

            <div className="export-info">
              <p>
                To export this video, run:{' '}
                <code>npx remotion render src/remotion/index.ts YearlyReview out/video.mp4</code>
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          Made with ❤️ using{' '}
          <a href="https://www.remotion.dev" target="_blank" rel="noopener noreferrer">
            Remotion
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
