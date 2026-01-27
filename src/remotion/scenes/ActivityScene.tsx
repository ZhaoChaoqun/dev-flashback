import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { ActiveDay, ActiveHour } from '@/types';

interface ActivitySceneProps {
  activeDays: ActiveDay[];
  activeHours: ActiveHour[];
}

export const ActivityScene: React.FC<ActivitySceneProps> = ({ activeDays, activeHours }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const maxDayCount = Math.max(...activeDays.map((d) => d.count));
  const maxHourCount = Math.max(...activeHours.map((h) => h.count));

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
          Activity Patterns
        </h2>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 100,
          alignItems: 'flex-start',
        }}
      >
        {/* Days of week chart */}
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: 28,
              color: '#8b949e',
              marginBottom: 30,
            }}
          >
            Most Active Days
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 16,
              height: 300,
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

              const normalizedHeight = maxDayCount > 0 ? (day.count / maxDayCount) * 250 : 0;
              const isWeekend = index === 0 || index === 6;
              const barColor = isWeekend ? '#a371f7' : '#58a6ff';

              return (
                <div
                  key={day.day}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: Math.max(normalizedHeight * barHeight, 4),
                      backgroundColor: barColor,
                      borderRadius: 8,
                      boxShadow: `0 0 20px ${barColor}40`,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 14,
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
              fontSize: 28,
              color: '#8b949e',
              marginBottom: 30,
            }}
          >
            Active Hours
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 6,
              height: 300,
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

              const normalizedHeight = maxHourCount > 0 ? (hour.count / maxHourCount) * 250 : 0;

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
                    gap: 5,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: Math.max(normalizedHeight * barHeight, 2),
                      backgroundColor: barColor,
                      borderRadius: 4,
                      boxShadow: `0 0 10px ${barColor}30`,
                    }}
                  />
                  {hour.hour % 6 === 0 && (
                    <span style={{ fontSize: 12, color: '#8b949e' }}>
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
          marginTop: 40,
          display: 'flex',
          gap: 30,
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
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: item.color,
              }}
            />
            <span style={{ fontSize: 16, color: '#8b949e' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
