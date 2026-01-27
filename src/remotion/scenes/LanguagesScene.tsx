import type { ReactElement } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { LanguageStats } from '@/types';

interface LanguagesSceneProps {
  languages: LanguageStats[];
}

export const LanguagesScene: React.FC<LanguagesSceneProps> = ({ languages }) => {
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
          Top Languages
        </h2>
      </div>

      {/* Language bars */}
      <div
        style={{
          width: '80%',
          maxWidth: 1000,
        }}
      >
        {languages.slice(0, 6).map((lang, index) => {
          const barDelay = index * 10;
          const barProgress = spring({
            frame: frame - 20 - barDelay,
            fps,
            config: {
              damping: 50,
              stiffness: 100,
            },
          });

          const barWidth = Math.min(barProgress, 1) * lang.percentage;

          const labelOpacity = interpolate(frame, [30 + barDelay, 50 + barDelay], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div
              key={lang.name}
              style={{
                marginBottom: 25,
              }}
            >
              {/* Label row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                  opacity: labelOpacity,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: lang.color,
                      boxShadow: `0 0 10px ${lang.color}50`,
                    }}
                  />
                  <span style={{ fontSize: 28, fontWeight: 600, color: '#ffffff' }}>{lang.name}</span>
                </div>
                <span style={{ fontSize: 28, fontWeight: 500, color: '#8b949e' }}>
                  {lang.percentage.toFixed(1)}%
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: 24,
                  backgroundColor: '#21262d',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${lang.color}, ${lang.color}cc)`,
                    borderRadius: 12,
                    boxShadow: `0 0 20px ${lang.color}50`,
                    transition: 'width 0.3s ease-out',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie chart visualization */}
      <div
        style={{
          position: 'absolute',
          right: 100,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 250,
          height: 250,
          opacity: interpolate(frame, [60, 90], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {languages.slice(0, 6).reduce(
            (acc, lang, index) => {
              const startAngle = acc.offset;
              const angle = (lang.percentage / 100) * 360;
              const endAngle = startAngle + angle;

              const animatedAngle = interpolate(
                frame,
                [60 + index * 5, 100 + index * 5],
                [0, angle],
                { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
              );

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos(((startAngle + animatedAngle) * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin(((startAngle + animatedAngle) * Math.PI) / 180);
              const largeArc = animatedAngle > 180 ? 1 : 0;

              if (animatedAngle > 0) {
                acc.paths.push(
                  <path
                    key={lang.name}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={lang.color}
                    stroke="#0d1117"
                    strokeWidth="1"
                  />
                );
              }

              acc.offset = endAngle;
              return acc;
            },
            { paths: [] as ReactElement[], offset: 0 }
          ).paths}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
