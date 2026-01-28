import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';
import type { GitHubUser } from '@/types';

interface ProfileSceneProps {
  user: GitHubUser;
}

export const ProfileScene: React.FC<ProfileSceneProps> = ({ user }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

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

  const infoTranslateY = interpolate(frame, [20, 45], [isPortrait ? 30 : 0, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const infoTranslateX = interpolate(frame, [20, 45], [isPortrait ? 0 : 50, 0], {
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

  // Responsive sizes
  const avatarSize = isPortrait ? 200 : 300;
  const nameSize = isPortrait ? 48 : 72;
  const loginSize = isPortrait ? 24 : 36;
  const bioSize = isPortrait ? 20 : 28;
  const detailSize = isPortrait ? 18 : 24;
  const statNumberSize = isPortrait ? 36 : 48;
  const statLabelSize = isPortrait ? 16 : 20;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? 40 : 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          alignItems: 'center',
          gap: isPortrait ? 40 : 80,
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
              width: avatarSize,
              height: avatarSize,
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
            transform: isPortrait
              ? `translateY(${infoTranslateY}px)`
              : `translateX(${infoTranslateX}px)`,
            textAlign: isPortrait ? 'center' : 'left',
          }}
        >
          <h2
            style={{
              fontSize: nameSize,
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
              fontSize: loginSize,
              color: '#8b949e',
              margin: 0,
              marginBottom: isPortrait ? 15 : 20,
            }}
          >
            @{user.login}
          </p>
          {user.bio && (
            <p
              style={{
                fontSize: bioSize,
                color: '#c9d1d9',
                margin: 0,
                marginBottom: isPortrait ? 20 : 30,
                maxWidth: isPortrait ? 400 : 600,
              }}
            >
              {user.bio}
            </p>
          )}

          {/* Location & Company */}
          <div style={{
            display: 'flex',
            flexDirection: isPortrait ? 'column' : 'row',
            gap: isPortrait ? 15 : 40,
            marginBottom: isPortrait ? 25 : 30,
            justifyContent: isPortrait ? 'center' : 'flex-start',
            alignItems: isPortrait ? 'center' : 'flex-start',
          }}>
            {user.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: detailSize }}>📍</span>
                <span style={{ fontSize: detailSize, color: '#8b949e' }}>{user.location}</span>
              </div>
            )}
            {user.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: detailSize }}>🏢</span>
                <span style={{ fontSize: detailSize, color: '#8b949e' }}>{user.company}</span>
              </div>
            )}
          </div>

          {/* Followers/Following Stats */}
          <div
            style={{
              opacity: statsOpacity,
              transform: `translateY(${statsTranslateY}px)`,
              display: 'flex',
              gap: isPortrait ? 20 : 40,
              justifyContent: isPortrait ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                backgroundColor: '#21262d',
                padding: isPortrait ? '15px 30px' : '20px 40px',
                borderRadius: isPortrait ? 12 : 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: statNumberSize, fontWeight: 700, color: '#58a6ff' }}>
                {user.followers.toLocaleString()}
              </div>
              <div style={{ fontSize: statLabelSize, color: '#8b949e' }}>Followers</div>
            </div>
            <div
              style={{
                backgroundColor: '#21262d',
                padding: isPortrait ? '15px 30px' : '20px 40px',
                borderRadius: isPortrait ? 12 : 16,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: statNumberSize, fontWeight: 700, color: '#a371f7' }}>
                {user.following.toLocaleString()}
              </div>
              <div style={{ fontSize: statLabelSize, color: '#8b949e' }}>Following</div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
