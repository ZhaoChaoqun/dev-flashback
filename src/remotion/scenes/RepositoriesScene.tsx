import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { Repository } from '@/types';

interface RepositoriesSceneProps {
  repositories: Repository[];
}

export const RepositoriesScene: React.FC<RepositoriesSceneProps> = ({ repositories }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Responsive sizes
  const titleSize = isPortrait ? 36 : 56;
  const cardWidth = isPortrait ? 380 : 450;
  const cardPadding = isPortrait ? 20 : 30;
  const repoNameSize = isPortrait ? 22 : 28;
  const descSize = isPortrait ? 14 : 18;
  const langSize = isPortrait ? 14 : 16;
  const statSize = isPortrait ? 16 : 20;
  const medalSize = isPortrait ? 40 : 60;
  const iconSize = isPortrait ? 22 : 28;
  const cardsGap = isPortrait ? 20 : 40;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? '50px 20px' : 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: isPortrait ? 30 : 50,
        }}
      >
        <h2
          style={{
            fontSize: titleSize,
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
          flexDirection: isPortrait ? 'column' : 'row',
          gap: cardsGap,
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: isPortrait ? 450 : 1600,
          width: '100%',
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
                flexDirection: isPortrait ? 'row' : 'column',
                alignItems: 'center',
                gap: isPortrait ? 15 : 0,
              }}
            >
              {/* Medal on left in portrait mode */}
              {isPortrait && (
                <div
                  style={{
                    opacity: badgeOpacity,
                    transform: `scale(${badgeScale})`,
                    fontSize: medalSize,
                    flexShrink: 0,
                  }}
                >
                  {medals[index]}
                </div>
              )}

              {/* Repo card */}
              <div
                style={{
                  width: cardWidth,
                  minHeight: isPortrait ? 160 : 220,
                  backgroundColor: '#21262d',
                  borderRadius: isPortrait ? 12 : 16,
                  padding: cardPadding,
                  border: '1px solid #30363d',
                  transform: `scale(${cardScale}) translateY(${isPortrait ? 0 : hoverEffect}px)`,
                  opacity: cardOpacity,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Repo header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: isPortrait ? 8 : 12, marginBottom: isPortrait ? 10 : 16 }}>
                  <span style={{ fontSize: iconSize }}>📦</span>
                  <h3
                    style={{
                      fontSize: repoNameSize,
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
                    fontSize: descSize,
                    color: '#8b949e',
                    margin: 0,
                    marginBottom: isPortrait ? 12 : 20,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: isPortrait ? 42 : 54,
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
                    marginBottom: isPortrait ? 12 : 20,
                    minHeight: isPortrait ? 16 : 20,
                  }}
                >
                  {repo.primaryLanguage ? (
                    <>
                      <div
                        style={{
                          width: isPortrait ? 10 : 14,
                          height: isPortrait ? 10 : 14,
                          borderRadius: '50%',
                          backgroundColor: repo.primaryLanguage.color,
                        }}
                      />
                      <span style={{ fontSize: langSize, color: '#8b949e' }}>{repo.primaryLanguage.name}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: langSize, color: '#8b949e' }}>-</span>
                  )}
                </div>

                {/* Stats - pushed to bottom with flex grow */}
                <div style={{ display: 'flex', gap: isPortrait ? 16 : 24, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: statSize }}>⭐</span>
                    <span style={{ fontSize: statSize, color: '#f0c14b', fontWeight: 600 }}>
                      {repo.stargazerCount.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: statSize }}>🍴</span>
                    <span style={{ fontSize: statSize, color: '#8b949e', fontWeight: 500 }}>
                      {repo.forkCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medal below card in landscape mode */}
              {!isPortrait && (
                <div
                  style={{
                    opacity: badgeOpacity,
                    transform: `scale(${badgeScale})`,
                    fontSize: medalSize,
                    marginTop: 20,
                  }}
                >
                  {medals[index]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
