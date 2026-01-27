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
  const { fps } = useVideoConfig();

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
          Streaks & Records 🔥
        </h2>
      </div>

      {/* Streak cards */}
      <div
        style={{
          display: 'flex',
          gap: 60,
          marginBottom: 60,
        }}
      >
        {/* Longest Streak */}
        <div
          style={{
            backgroundColor: '#21262d',
            borderRadius: 24,
            padding: '40px 60px',
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
          <div style={{ fontSize: 60, marginBottom: 10 }}>🔥</div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#f0883e',
              marginBottom: 10,
            }}
          >
            {Math.round(longestStreak * Math.min(longestStreakCount, 1))}
          </div>
          <div style={{ fontSize: 24, color: '#8b949e' }}>Longest Streak</div>
          <div style={{ fontSize: 18, color: '#6e7681', marginTop: 5 }}>days in a row</div>
        </div>

        {/* Current Streak */}
        <div
          style={{
            backgroundColor: '#21262d',
            borderRadius: 24,
            padding: '40px 60px',
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
          <div style={{ fontSize: 60, marginBottom: 10 }}>⚡</div>
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: '#39d353',
              marginBottom: 10,
            }}
          >
            {Math.round(currentStreak * Math.min(currentStreakCount, 1))}
          </div>
          <div style={{ fontSize: 24, color: '#8b949e' }}>Current Streak</div>
          <div style={{ fontSize: 18, color: '#6e7681', marginTop: 5 }}>keep going!</div>
        </div>
      </div>

      {/* Most Productive Day */}
      {mostProductiveDay && (
        <div
          style={{
            opacity: productiveDayOpacity,
            backgroundColor: '#21262d',
            borderRadius: 20,
            padding: '30px 50px',
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            border: '1px solid #30363d',
          }}
        >
          <div style={{ fontSize: 50 }}>🏆</div>
          <div>
            <div style={{ fontSize: 22, color: '#8b949e', marginBottom: 5 }}>Most Productive Day</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#ffffff' }}>
              {formatDate(mostProductiveDay.date)}
            </div>
            <div style={{ fontSize: 20, color: '#58a6ff', marginTop: 5 }}>
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
        {Array.from({ length: 20 }).map((_, i) => {
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
                fontSize: 24,
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
