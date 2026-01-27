import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface SlideTransitionProps {
  children: React.ReactNode;
  durationInFrames: number;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  durationInFrames,
  direction = 'left',
}) => {
  const frame = useCurrentFrame();

  const getTransform = () => {
    const slideIn = interpolate(frame, [0, 20], [100, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const slideOut = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, -100], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    const value = frame < durationInFrames / 2 ? slideIn : slideOut;

    switch (direction) {
      case 'left':
        return `translateX(${value}%)`;
      case 'right':
        return `translateX(${-value}%)`;
      case 'up':
        return `translateY(${value}%)`;
      case 'down':
        return `translateY(${-value}%)`;
      default:
        return `translateX(${value}%)`;
    }
  };

  return <AbsoluteFill style={{ transform: getTransform() }}>{children}</AbsoluteFill>;
};
