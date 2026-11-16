import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { SkeletonPulse } from './styles';

interface SkeletonTileProps {
  readonly size: number;
  readonly delayMs?: number;
}

export function SkeletonTile({
  size,
  delayMs = 0,
}: SkeletonTileProps): React.JSX.Element {
  const pulse = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.78,
          duration: 700,
          delay: delayMs,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.42,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [delayMs, pulse]);

  return (
    <SkeletonPulse
      $size={size}
      style={{ opacity: pulse }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
