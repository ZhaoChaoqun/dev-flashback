import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { ContributionDay } from '@/types';

interface StreaksSceneProps {
  longestStreak: number;
  currentStreak: number;
  mostProductiveDay: ContributionDay | null;
}

export const StreaksScene: React.FC<StreaksSceneProps> = ({
  longestStreak,
  currentStreak,
  mostProductiveDay,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const longestStreakCount = spring({
    frame: frame - 20,
    fps,
    config: {
      damping: 50,
      stiffness: 80,
    },
  });

  const currentStreakCount = spring({
    frame: frame - 35,
    fps,
    config: {
      damping: 50,
      stiffness: 80,
    },
  });

  const productiveDayOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  // Responsive sizes
  const titleSize = isPortrait ? 40 : 56;
  const iconSize = isPortrait ? 45 : 60;
  const numberSize = isPortrait ? 60 : 80;
  const labelSize = isPortrait ? 20 : 24;
  const subLabelSize = isPortrait ? 14 : 18;
  const cardPadding = isPortrait ? '30px 40px' : '40px 60px';
  const cardGap = isPortrait ? 30 : 60;
  const productiveIconSize = isPortrait ? 36 : 50;
  const productiveLabelSize = isPortrait ? 18 : 22;
  const productiveValueSize = isPortrait ? 24 : 32;
  const productiveCountSize = isPortrait ? 16 : 20;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? '60px 30px' : 60,
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: isPortrait ? 40 : 60,
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
          Streaks & Records 🔥
        </h2>
      </div>

      {/* Streak cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          gap: cardGap,
          marginBottom: isPortrait ? 40 : 60,
        }}
      >
        {/* Longest Streak */}
        <div
          style={{
            backgroundColor: '#21262d',
            borderRadius: isPortrait ? 20 : 24,
            padding: cardPadding,
            textAlign: 'center',
            border: '2px solid #f0883e',
            boxShadow: '0 0 40px rgba(240, 136, 62, 0.2)',
            transform: `scale(${spring({
              frame: frame - 15,
              fps,
              config: { damping: 100, stiffness: 200 },
            })})`,
          }}
        >
          <div style={{ fontSize: iconSize, marginBottom: isPortrait ? 8 : 10 }}>🔥</div>
          <div
            style={{
              fontSize: numberSize,
              fontWeight: 800,
              color: '#f0883e',
              marginBottom: isPortrait ? 8 : 10,
            }}
          >
            {Math.round(longestStreak * Math.min(longestStreakCount, 1))}
          </div>
          <div style={{ fontSize: labelSize, color: '#8b949e' }}>Longest Streak</div>
          <div style={{ fontSize: subLabelSize, color: '#6e7681', marginTop: 5 }}>days in a row</div>
        </div>

        {/* Current Streak */}
        <div
          style={{
            backgroundColor: '#21262d',
            borderRadius: isPortrait ? 20 : 24,
            padding: cardPadding,
            textAlign: 'center',
            border: '2px solid #39d353',
            boxShadow: '0 0 40px rgba(57, 211, 83, 0.2)',
            transform: `scale(${spring({
              frame: frame - 25,
              fps,
              config: { damping: 100, stiffness: 200 },
            })})`,
          }}
        >
          <div style={{ fontSize: iconSize, marginBottom: isPortrait ? 8 : 10 }}>⚡</div>
          <div
            style={{
              fontSize: numberSize,
              fontWeight: 800,
              color: '#39d353',
              marginBottom: isPortrait ? 8 : 10,
            }}
          >
            {Math.round(currentStreak * Math.min(currentStreakCount, 1))}
          </div>
          <div style={{ fontSize: labelSize, color: '#8b949e' }}>Current Streak</div>
          <div style={{ fontSize: subLabelSize, color: '#6e7681', marginTop: 5 }}>keep going!</div>
        </div>
      </div>

      {/* Most Productive Day */}
      {mostProductiveDay && (
        <div
          style={{
            opacity: productiveDayOpacity,
            backgroundColor: '#21262d',
            borderRadius: isPortrait ? 16 : 20,
            padding: isPortrait ? '20px 30px' : '30px 50px',
            display: 'flex',
            alignItems: 'center',
            gap: isPortrait ? 20 : 30,
            border: '1px solid #30363d',
          }}
        >
          <div style={{ fontSize: productiveIconSize }}>🏆</div>
          <div>
            <div style={{ fontSize: productiveLabelSize, color: '#8b949e', marginBottom: 5 }}>Most Productive Day</div>
            <div style={{ fontSize: productiveValueSize, fontWeight: 700, color: '#ffffff' }}>
              {formatDate(mostProductiveDay.date)}
            </div>
            <div style={{ fontSize: productiveCountSize, color: '#58a6ff', marginTop: 5 }}>
              {mostProductiveDay.contributionCount} contributions
            </div>
          </div>
        </div>
      )}

      {/* Animated fire particles */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: isPortrait ? 15 : 20 }).map((_, i) => {
          const baseX = 30 + (i * 40) % 60;
          const yOffset = ((frame * 2 + i * 30) % 200);
          const opacity = interpolate(yOffset, [0, 100, 200], [0, 0.6, 0]);

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${baseX}%`,
                bottom: yOffset,
                fontSize: isPortrait ? 18 : 24,
                opacity,
                transform: `scale(${0.5 + Math.sin(frame * 0.1 + i) * 0.3})`,
              }}
            >
              🔥
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
