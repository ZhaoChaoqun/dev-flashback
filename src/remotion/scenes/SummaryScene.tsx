import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { YearlyStats } from '@/types';

interface SummarySceneProps {
  stats: YearlyStats;
}

export const SummaryScene: React.FC<SummarySceneProps> = ({ stats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: 60,
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
          {stats.year} Summary
        </h2>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          maxWidth: 1200,
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
                borderRadius: 20,
                padding: '35px 40px',
                display: 'flex',
                alignItems: 'center',
                gap: 25,
                border: '1px solid #30363d',
                transform: `scale(${cardScale})`,
                boxShadow: `0 0 30px ${item.color}15`,
              }}
            >
              <div
                style={{
                  fontSize: 50,
                  width: 70,
                  height: 70,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${item.color}20`,
                  borderRadius: 16,
                }}
              >
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: item.color,
                    marginBottom: 5,
                  }}
                >
                  {displayValue.toLocaleString()}
                </div>
                <div style={{ fontSize: 18, color: '#8b949e' }}>{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total contributions highlight */}
      <div
        style={{
          marginTop: 50,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: 28, color: '#8b949e' }}>Total Contributions: </span>
        <span
          style={{
            fontSize: 36,
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
