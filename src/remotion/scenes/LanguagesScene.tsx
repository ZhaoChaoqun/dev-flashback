import type { ReactElement } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { LanguageStats } from '@/types';

interface LanguagesSceneProps {
  languages: LanguageStats[];
}

export const LanguagesScene: React.FC<LanguagesSceneProps> = ({ languages }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Responsive sizes
  const titleSize = isPortrait ? 40 : 56;
  const labelSize = isPortrait ? 20 : 28;
  const percentSize = isPortrait ? 20 : 28;
  const barHeight = isPortrait ? 18 : 24;
  const dotSize = isPortrait ? 12 : 16;
  const pieSize = isPortrait ? 180 : 250;
  const barMargin = isPortrait ? 18 : 25;

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
          Top Languages
        </h2>
      </div>

      {/* Content container - different layout for portrait */}
      <div
        style={{
          display: 'flex',
          flexDirection: isPortrait ? 'column' : 'row',
          alignItems: 'center',
          gap: isPortrait ? 40 : 60,
          width: '100%',
          maxWidth: isPortrait ? 500 : 1200,
        }}
      >
        {/* Language bars */}
        <div
          style={{
            width: isPortrait ? '100%' : '60%',
            maxWidth: isPortrait ? 500 : 700,
          }}
        >
          {languages.slice(0, isPortrait ? 5 : 6).map((lang, index) => {
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
                  marginBottom: barMargin,
                }}
              >
                {/* Label row */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: isPortrait ? 6 : 10,
                    opacity: labelOpacity,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: isPortrait ? 8 : 12 }}>
                    <div
                      style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: '50%',
                        backgroundColor: lang.color,
                        boxShadow: `0 0 10px ${lang.color}50`,
                      }}
                    />
                    <span style={{ fontSize: labelSize, fontWeight: 600, color: '#ffffff' }}>{lang.name}</span>
                  </div>
                  <span style={{ fontSize: percentSize, fontWeight: 500, color: '#8b949e' }}>
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  style={{
                    width: '100%',
                    height: barHeight,
                    backgroundColor: '#21262d',
                    borderRadius: barHeight / 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${lang.color}, ${lang.color}cc)`,
                      borderRadius: barHeight / 2,
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
            width: pieSize,
            height: pieSize,
            opacity: interpolate(frame, [60, 90], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            flexShrink: 0,
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
      </div>
    </AbsoluteFill>
  );
};
