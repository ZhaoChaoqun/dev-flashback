import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { YearlyStats } from '@/types';

interface SummarySceneProps {
  stats: YearlyStats;
}

export const SummaryScene: React.FC<SummarySceneProps> = ({ stats }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const summaryItems = [
    {
      icon: '📝',
      label: 'Total Commits',
      value: stats.commitStats.totalCommits,
      color: '#58a6ff',
    },
    {
      icon: '🔀',
      label: 'Pull Requests',
      value: stats.pullRequestStats.totalPRs,
      color: '#a371f7',
    },
    {
      icon: '🐛',
      label: 'Issues',
      value: stats.issueStats.totalIssues,
      color: '#f0883e',
    },
    {
      icon: '⭐',
      label: 'Total Stars',
      value: stats.topRepositories.reduce((sum, repo) => sum + repo.stargazerCount, 0),
      color: '#f0c14b',
    },
    {
      icon: '📦',
      label: 'Repositories',
      value: stats.topRepositories.length,
      color: '#39d353',
    },
    {
      icon: '💻',
      label: 'Languages Used',
      value: stats.languageStats.length,
      color: '#ec6547',
    },
  ];

  // Responsive sizes
  const titleSize = isPortrait ? 40 : 56;
  const titleMargin = isPortrait ? 30 : 60;
  const gridColumns = isPortrait ? 2 : 3;
  const gridGap = isPortrait ? 20 : 40;
  const cardPadding = isPortrait ? '20px 24px' : '35px 40px';
  const iconSize = isPortrait ? 36 : 50;
  const iconContainerSize = isPortrait ? 50 : 70;
  const valueSize = isPortrait ? 28 : 42;
  const labelSize = isPortrait ? 14 : 18;
  const totalLabelSize = isPortrait ? 20 : 28;
  const totalValueSize = isPortrait ? 28 : 36;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? 30 : 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: titleMargin,
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
          {stats.year} Summary
        </h2>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          gap: gridGap,
          maxWidth: isPortrait ? '100%' : 1200,
          width: '100%',
        }}
      >
        {summaryItems.map((item, index) => {
          const cardDelay = index * 8;
          const cardScale = spring({
            frame: frame - 20 - cardDelay,
            fps,
            config: {
              damping: 100,
              stiffness: 200,
            },
          });

          const countProgress = spring({
            frame: frame - 30 - cardDelay,
            fps,
            config: {
              damping: 50,
              stiffness: 100,
            },
          });

          const displayValue = Math.round(item.value * Math.min(countProgress, 1));

          return (
            <div
              key={item.label}
              style={{
                backgroundColor: '#21262d',
                borderRadius: isPortrait ? 14 : 20,
                padding: cardPadding,
                display: 'flex',
                alignItems: 'center',
                gap: isPortrait ? 16 : 25,
                border: '1px solid #30363d',
                transform: `scale(${cardScale})`,
                boxShadow: `0 0 30px ${item.color}15`,
              }}
            >
              <div
                style={{
                  fontSize: iconSize,
                  width: iconContainerSize,
                  height: iconContainerSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${item.color}20`,
                  borderRadius: isPortrait ? 12 : 16,
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: valueSize,
                    fontWeight: 800,
                    color: item.color,
                    marginBottom: isPortrait ? 2 : 5,
                  }}
                >
                  {displayValue.toLocaleString()}
                </div>
                <div style={{ fontSize: labelSize, color: '#8b949e' }}>{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total contributions highlight */}
      <div
        style={{
          marginTop: isPortrait ? 30 : 50,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: totalLabelSize, color: '#8b949e' }}>Total Contributions: </span>
        <span
          style={{
            fontSize: totalValueSize,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #39d353, #26a641)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {stats.contributions.totalContributions.toLocaleString()}
        </span>
      </div>
    </AbsoluteFill>
  );
};
