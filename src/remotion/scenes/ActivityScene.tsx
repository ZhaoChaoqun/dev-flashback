import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { ActiveDay, ActiveHour } from '@/types';

interface ActivitySceneProps {
  activeDays: ActiveDay[];
  activeHours: ActiveHour[];
}

export const ActivityScene: React.FC<ActivitySceneProps> = ({ activeDays, activeHours }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const maxDayCount = Math.max(...activeDays.map((d) => d.count));
  const maxHourCount = Math.max(...activeHours.map((h) => h.count));

  // Responsive sizes
  const titleSize = isPortrait ? 40 : 56;
  const subtitleSize = isPortrait ? 22 : 28;
  const dayBarWidth = isPortrait ? 36 : 50;
  const dayBarMaxHeight = isPortrait ? 180 : 250;
  const dayGap = isPortrait ? 10 : 16;
  const hourBarWidth = isPortrait ? 14 : 20;
  const hourBarMaxHeight = isPortrait ? 150 : 250;
  const hourGap = isPortrait ? 3 : 6;
  const chartHeight = isPortrait ? 200 : 300;
  const legendSize = isPortrait ? 12 : 16;
  const labelSize = isPortrait ? 10 : 14;

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
          Activity Patterns
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          gap: isPortrait ? 40 : 100,
          alignItems: isPortrait ? 'center' : 'flex-start',
        }}
      >
        {/* Days of week chart */}
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: subtitleSize,
              color: '#8b949e',
              marginBottom: isPortrait ? 20 : 30,
            }}
          >
            Most Active Days
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: dayGap,
              height: chartHeight,
            }}
          >
            {activeDays.map((day, index) => {
              const barDelay = index * 5;
              const barHeight = spring({
                frame: frame - 30 - barDelay,
                fps,
                config: {
                  damping: 50,
                  stiffness: 100,
                },
              });

              const normalizedHeight = maxDayCount > 0 ? (day.count / maxDayCount) * dayBarMaxHeight : 0;
              const isWeekend = index === 0 || index === 6;
              const barColor = isWeekend ? '#a371f7' : '#58a6ff';

              return (
                <div
                  key={day.day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isPortrait ? 6 : 10,
                  }}
                >
                  <div
                    style={{
                      width: dayBarWidth,
                      height: Math.max(normalizedHeight * barHeight, 4),
                      backgroundColor: barColor,
                      borderRadius: isPortrait ? 6 : 8,
                      boxShadow: `0 0 20px ${barColor}40`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: labelSize,
                      color: '#8b949e',
                      transform: 'rotate(-45deg)',
                      transformOrigin: 'center',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {day.day.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hours chart */}
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: subtitleSize,
              color: '#8b949e',
              marginBottom: isPortrait ? 20 : 30,
            }}
          >
            Active Hours
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: hourGap,
              height: chartHeight,
            }}
          >
            {activeHours.map((hour, index) => {
              const barDelay = index * 2;
              const barHeight = spring({
                frame: frame - 30 - barDelay,
                fps,
                config: {
                  damping: 50,
                  stiffness: 100,
                },
              });

              const normalizedHeight = maxHourCount > 0 ? (hour.count / maxHourCount) * hourBarMaxHeight : 0;

              // Color based on time of day
              let barColor = '#58a6ff';
              if (hour.hour >= 6 && hour.hour < 12) barColor = '#f0c14b'; // Morning
              else if (hour.hour >= 12 && hour.hour < 18) barColor = '#39d353'; // Afternoon
              else if (hour.hour >= 18 && hour.hour < 22) barColor = '#a371f7'; // Evening

              return (
                <div
                  key={hour.hour}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isPortrait ? 3 : 5,
                  }}
                >
                  <div
                    style={{
                      width: hourBarWidth,
                      height: Math.max(normalizedHeight * barHeight, 2),
                      backgroundColor: barColor,
                      borderRadius: isPortrait ? 3 : 4,
                      boxShadow: `0 0 10px ${barColor}30`,
                    }}
                  />
                  {hour.hour % 6 === 0 && (
                    <span style={{ fontSize: isPortrait ? 10 : 12, color: '#8b949e' }}>
                      {hour.hour === 0 ? '12a' : hour.hour === 12 ? '12p' : hour.hour < 12 ? `${hour.hour}a` : `${hour.hour - 12}p`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: isPortrait ? 30 : 40,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: isPortrait ? 15 : 30,
          opacity: interpolate(frame, [80, 100], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        {[
          { color: '#f0c14b', label: 'Morning' },
          { color: '#39d353', label: 'Afternoon' },
          { color: '#a371f7', label: 'Evening' },
          { color: '#58a6ff', label: 'Night' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: isPortrait ? 5 : 8 }}>
            <div
              style={{
                width: isPortrait ? 12 : 16,
                height: isPortrait ? 12 : 16,
                borderRadius: 4,
                backgroundColor: item.color,
              }}
            />
            <span style={{ fontSize: legendSize, color: '#8b949e' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
