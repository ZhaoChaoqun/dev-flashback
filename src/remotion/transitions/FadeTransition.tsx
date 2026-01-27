import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface FadeTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const fadeOut = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = Math.min(fadeIn, fadeOut);

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
