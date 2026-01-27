import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';
import type { GitHubUser } from '@/types';

interface ProfileSceneProps {
  user: GitHubUser;
}

export const ProfileScene: React.FC<ProfileSceneProps> = ({ user }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const avatarScale = spring({
    frame,
    fps,
    config: {
      damping: 100,
      stiffness: 200,
    },
  });

  const avatarRotation = interpolate(frame, [0, 30], [180, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const infoOpacity = interpolate(frame, [20, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const infoTranslateX = interpolate(frame, [20, 45], [50, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const statsOpacity = interpolate(frame, [50, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const statsTranslateY = interpolate(frame, [50, 75], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 80,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            transform: `scale(${avatarScale}) rotateY(${avatarRotation}deg)`,
            perspective: 1000,
          }}
        >
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: '50%',
              border: '4px solid #30363d',
              overflow: 'hidden',
              boxShadow: '0 0 60px rgba(88, 166, 255, 0.3)',
            }}
          >
            <Img
              src={user.avatarUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* User Info */}
        <div
          style={{
            opacity: infoOpacity,
            transform: `translateX(${infoTranslateX}px)`,
          }}
        >
          <h2
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              marginBottom: 10,
            }}
          >
            {user.name || user.login}
          </h2>
          <p
            style={{
              fontSize: 36,
              color: '#8b949e',
              margin: 0,
              marginBottom: 20,
            }}
          >
            @{user.login}
          </p>
          {user.bio && (
            <p
              style={{
                fontSize: 28,
                color: '#c9d1d9',
                margin: 0,
                marginBottom: 30,
                maxWidth: 600,
              }}
            >
              {user.bio}
            </p>
          )}

          {/* Location & Company */}
          <div style={{ display: 'flex', gap: 40, marginBottom: 30 }}>
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>📍</span>
                <span style={{ fontSize: 24, color: '#8b949e' }}>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🏢</span>
                <span style={{ fontSize: 24, color: '#8b949e' }}>{user.company}</span>
              </div>
            )}
          </div>

          {/* Followers/Following Stats */}
          <div
            style={{
              opacity: statsOpacity,
              transform: `translateY(${statsTranslateY}px)`,
              display: 'flex',
              gap: 40,
            }}
          >
            <div
              style={{
                backgroundColor: '#21262d',
                padding: '20px 40px',
                borderRadius: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 700, color: '#58a6ff' }}>
                {user.followers.toLocaleString()}
              </div>
              <div style={{ fontSize: 20, color: '#8b949e' }}>Followers</div>
            </div>
            <div
              style={{
                backgroundColor: '#21262d',
                padding: '20px 40px',
                borderRadius: 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 700, color: '#a371f7' }}>
                {user.following.toLocaleString()}
              </div>
              <div style={{ fontSize: 20, color: '#8b949e' }}>Following</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
