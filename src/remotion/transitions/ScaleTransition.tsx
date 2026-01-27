import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface ScaleTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
}

export const ScaleTransition: React.FC<ScaleTransitionProps> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();

  const scaleIn = interpolate(frame, [0, 20], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scaleOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 1.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacityIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacityOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = frame < durationInFrames / 2 ? scaleIn : scaleOut;
  const opacity = Math.min(opacityIn, opacityOut);

  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>
      {children}
    </AbsoluteFill>
  );
};
