import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface OutroSceneProps {
  year: number;
  username: string;
}

export const OutroScene: React.FC<OutroSceneProps> = ({ year, username }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const isPortrait = height > width;

  const textOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const yearScale = spring({
    frame: frame - 10,
    fps,
    config: {
      damping: 100,
      stiffness: 150,
    },
  });

  const subtitleOpacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [70, 90], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Confetti particles
  const confettiColors = ['#58a6ff', '#a371f7', '#39d353', '#f0883e', '#f0c14b', '#ec6547'];

  // Responsive sizes
  const wrapTextSize = isPortrait ? 28 : 36;
  const yearSize = isPortrait ? 100 : 140;
  const nameSize = isPortrait ? 24 : 32;
  const nextYearSize = isPortrait ? 18 : 24;
  const brandSize = isPortrait ? 16 : 20;

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeOut,
      }}
    >
      {/* Confetti */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 37) % 100;
          const delay = (i * 13) % 30;
          const yProgress = interpolate(frame - delay, [0, 90], [0, 150], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const rotation = frame * 5 + i * 45;
          const color = confettiColors[i % confettiColors.length];

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${-10 + yProgress}%`,
                width: 12,
                height: 12,
                backgroundColor: color,
                borderRadius: i % 3 === 0 ? '50%' : 2,
                transform: `rotate(${rotation}deg)`,
                opacity: interpolate(yProgress, [0, 50, 100, 150], [0, 1, 1, 0]),
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div
        style={{
          opacity: textOpacity,
          textAlign: 'center',
          padding: isPortrait ? '0 30px' : 0,
        }}
      >
        <div style={{ fontSize: wrapTextSize, color: '#8b949e', marginBottom: isPortrait ? 15 : 20 }}>
          That's a wrap for
        </div>

        <div
          style={{
            transform: `scale(${yearScale})`,
          }}
        >
          <span
            style={{
              fontSize: yearSize,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #58a6ff, #a371f7, #39d353)',
              backgroundSize: '200% 100%',
              backgroundPosition: `${frame * 3}% 0`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {year}
          </span>
        </div>

        <div
          style={{
            opacity: subtitleOpacity,
            marginTop: isPortrait ? 20 : 30,
          }}
        >
          <div style={{ fontSize: nameSize, color: '#ffffff', marginBottom: isPortrait ? 10 : 15 }}>
            Great work, @{username}! 🎉
          </div>
          <div style={{ fontSize: nextYearSize, color: '#8b949e' }}>
            Here's to an even better {year + 1}!
          </div>
        </div>
      </div>

      {/* Branding */}
      <div
        style={{
          position: 'absolute',
          bottom: isPortrait ? 80 : 50,
          opacity: subtitleOpacity,
        }}
      >
        <div style={{ fontSize: brandSize, color: '#6e7681' }}>
          Generated with Dev Flashback
        </div>
      </div>
    </AbsoluteFill>
  );
};
