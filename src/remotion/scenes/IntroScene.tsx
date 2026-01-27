import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface IntroSceneProps {
  year: number;
  username: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ year, username }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 200,
      stiffness: 100,
      mass: 0.5,
    },
  });

  const yearOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const yearTranslateY = interpolate(frame, [20, 40], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const usernameOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const glowIntensity = interpolate(frame, [0, 30, 60, 90], [0, 0.5, 1, 0.8]);

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Animated background particles */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 4,
              height: 4,
              backgroundColor: '#58a6ff',
              borderRadius: '50%',
              left: `${(i * 17 + frame * 0.5) % 100}%`,
              top: `${(i * 23 + frame * 0.3) % 100}%`,
              opacity: 0.3 + Math.sin(frame * 0.1 + i) * 0.2,
              transform: `scale(${0.5 + Math.sin(frame * 0.05 + i) * 0.5})`,
            }}
          />
        ))}
      </div>

      {/* Main title */}
      <div
        style={{
          transform: `scale(${titleScale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            textShadow: `0 0 ${glowIntensity * 60}px rgba(88, 166, 255, ${glowIntensity * 0.8})`,
          }}
        >
          Dev Flashback
        </h1>
      </div>

      {/* Year */}
      <div
        style={{
          opacity: yearOpacity,
          transform: `translateY(${yearTranslateY}px)`,
          marginTop: 20,
        }}
      >
        <span
          style={{
            fontSize: 80,
            fontWeight: 700,
            background: 'linear-gradient(90deg, #58a6ff, #a371f7, #58a6ff)',
            backgroundSize: '200% 100%',
            backgroundPosition: `${frame * 2}% 0`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {year}
        </span>
      </div>

      {/* Username */}
      <div
        style={{
          opacity: usernameOpacity,
          marginTop: 30,
        }}
      >
        <span
          style={{
            fontSize: 36,
            color: '#8b949e',
            fontWeight: 500,
          }}
        >
          @{username}
        </span>
      </div>
    </AbsoluteFill>
  );
};
