import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { ContributionCalendar } from '@/types';

interface ContributionsSceneProps {
  contributions: ContributionCalendar;
  year: number;
}

const CONTRIBUTION_COLORS: Record<string, string> = {
  NONE: '#161b22',
  FIRST_QUARTILE: '#0e4429',
  SECOND_QUARTILE: '#006d32',
  THIRD_QUARTILE: '#26a641',
  FOURTH_QUARTILE: '#39d353',
};

export const ContributionsScene: React.FC<ContributionsSceneProps> = ({ contributions, year }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const countSpring = spring({
    frame: frame - 20,
    fps,
    config: {
      damping: 50,
      stiffness: 100,
    },
  });

  const displayCount = Math.round(contributions.totalContributions * Math.min(countSpring, 1));

  const gridOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate which cells should be visible based on frame
  const visibleCells = Math.floor(interpolate(frame, [30, 120], [0, 365], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }));

  // Camera movement: pan from left to right with zoom effect
  // For portrait mode, use more aggressive zoom to fit the grid
  const baseScale = isPortrait ? 1.2 : 1.8;
  const maxScale = isPortrait ? 1.6 : 2.2;
  const endScale = isPortrait ? 1.0 : 1.5;

  const cameraScale = interpolate(frame, [40, 80, 140], [baseScale, maxScale, endScale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cameraX = interpolate(frame, [40, 140], [30, -30], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const cameraY = interpolate(frame, [40, 90, 140], [0, -5, 5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Responsive sizes
  const titleSize = isPortrait ? 36 : 48;
  const countSize = isPortrait ? 80 : 120;
  const cellSize = isPortrait ? 10 : 14;
  const cellGap = isPortrait ? 2 : 4;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isPortrait ? 30 : 60,
        overflow: 'hidden',
      }}
    >
      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          marginBottom: isPortrait ? 15 : 20,
          zIndex: 10,
        }}
      >
        <h2
          style={{
            fontSize: titleSize,
            fontWeight: 600,
            color: '#8b949e',
            margin: 0,
          }}
        >
          {year} Contributions
        </h2>
      </div>

      {/* Total Count */}
      <div
        style={{
          marginBottom: isPortrait ? 30 : 50,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: countSize,
            fontWeight: 800,
            background: 'linear-gradient(90deg, #39d353, #26a641)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {displayCount.toLocaleString()}
        </span>
      </div>

      {/* Contribution Grid with Camera Movement */}
      <div
        style={{
          opacity: gridOpacity,
          transform: `scale(${cameraScale}) translate(${cameraX}%, ${cameraY}%)`,
          transformOrigin: 'center center',
          display: 'flex',
          gap: cellGap,
          padding: isPortrait ? 12 : 20,
          backgroundColor: '#0d1117',
          borderRadius: isPortrait ? 8 : 12,
          border: '1px solid #30363d',
          boxShadow: '0 0 60px rgba(57, 211, 83, 0.15)',
        }}
      >
        {contributions.weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: cellGap,
            }}
          >
            {week.contributionDays.map((day, dayIndex) => {
              const cellIndex = weekIndex * 7 + dayIndex;
              const isVisible = cellIndex < visibleCells;
              const cellScale = isVisible
                ? spring({
                    frame: frame - 30 - cellIndex * 0.3,
                    fps,
                    config: {
                      damping: 100,
                      stiffness: 300,
                    },
                  })
                : 0;

              // Highlight effect during camera pan
              const isInFocus = Math.abs(weekIndex - (frame - 40) * 0.8) < 8;
              const focusGlow = isInFocus && day.contributionLevel !== 'NONE' ? 0.8 : 0;

              return (
                <div
                  key={dayIndex}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: isPortrait ? 2 : 3,
                    backgroundColor: CONTRIBUTION_COLORS[day.contributionLevel],
                    transform: `scale(${cellScale})`,
                    boxShadow:
                      day.contributionLevel === 'FOURTH_QUARTILE'
                        ? `0 0 ${10 + focusGlow * 10}px rgba(57, 211, 83, ${0.5 + focusGlow * 0.3})`
                        : focusGlow > 0 && day.contributionLevel !== 'NONE'
                          ? `0 0 8px rgba(57, 211, 83, ${focusGlow * 0.4})`
                          : 'none',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: isPortrait ? 20 : 30,
          display: 'flex',
          alignItems: 'center',
          gap: isPortrait ? 4 : 8,
          opacity: gridOpacity,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: isPortrait ? 12 : 14, color: '#8b949e', marginRight: isPortrait ? 6 : 10 }}>Less</span>
        {Object.values(CONTRIBUTION_COLORS).map((color, index) => (
          <div
            key={index}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: isPortrait ? 2 : 3,
              backgroundColor: color,
            }}
          />
        ))}
        <span style={{ fontSize: isPortrait ? 12 : 14, color: '#8b949e', marginLeft: isPortrait ? 6 : 10 }}>More</span>
      </div>
    </AbsoluteFill>
  );
};
