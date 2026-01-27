import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { Repository } from '@/types';

interface RepositoriesSceneProps {
  repositories: Repository[];
}

export const RepositoriesScene: React.FC<RepositoriesSceneProps> = ({ repositories }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: 50,
        }}
      >
        <h2
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Top Repositories ⭐
        </h2>
      </div>

      {/* Repository cards with medals */}
      <div
        style={{
          display: 'flex',
          gap: 40,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 1600,
        }}
      >
        {repositories.slice(0, 3).map((repo, index) => {
          const cardDelay = index * 15;
          const cardScale = spring({
            frame: frame - 20 - cardDelay,
            fps,
            config: {
              damping: 100,
              stiffness: 200,
            },
          });

          const cardOpacity = interpolate(frame, [20 + cardDelay, 40 + cardDelay], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const hoverEffect = Math.sin((frame + index * 30) * 0.05) * 5;

          const medals = ['🥇', '🥈', '🥉'];
          const badgeOpacity = interpolate(frame, [80 + index * 10, 100 + index * 10], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const badgeScale = spring({
            frame: frame - 80 - index * 10,
            fps,
            config: {
              damping: 50,
              stiffness: 300,
            },
          });

          return (
            <div
              key={repo.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Repo card */}
              <div
                style={{
                  width: 450,
                  minHeight: 220,
                  backgroundColor: '#21262d',
                  borderRadius: 16,
                  padding: 30,
                  border: '1px solid #30363d',
                  transform: `scale(${cardScale}) translateY(${hoverEffect}px)`,
                  opacity: cardOpacity,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Repo header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }}>📦</span>
                  <h3
                    style={{
                      fontSize: 28,
                      fontWeight: 600,
                      color: '#58a6ff',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {repo.name}
                  </h3>
                </div>

                {/* Description */}
                <p
                  style={{
                    fontSize: 18,
                    color: '#8b949e',
                    margin: 0,
                    marginBottom: 20,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: 54,
                  }}
                >
                  {repo.description || 'No description'}
                </p>

                {/* Language */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 20,
                    minHeight: 20,
                  }}
                >
                  {repo.primaryLanguage ? (
                    <>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: repo.primaryLanguage.color,
                        }}
                      />
                      <span style={{ fontSize: 16, color: '#8b949e' }}>{repo.primaryLanguage.name}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 16, color: '#8b949e' }}>-</span>
                  )}
                </div>

                {/* Stats - pushed to bottom with flex grow */}
                <div style={{ display: 'flex', gap: 24, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>⭐</span>
                    <span style={{ fontSize: 20, color: '#f0c14b', fontWeight: 600 }}>
                      {repo.stargazerCount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 20 }}>🍴</span>
                    <span style={{ fontSize: 20, color: '#8b949e', fontWeight: 500 }}>
                      {repo.forkCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medal directly below this card */}
              <div
                style={{
                  opacity: badgeOpacity,
                  transform: `scale(${badgeScale})`,
                  fontSize: 60,
                  marginTop: 20,
                }}
              >
                {medals[index]}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
