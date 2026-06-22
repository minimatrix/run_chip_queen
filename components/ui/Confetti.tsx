import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const COLORS = ['#D9B75D', '#08412D', '#F7F4EC', '#E8A04C', '#3D8B6E'];

type ConfettiProps = {
  active: boolean;
  onComplete?: () => void;
};

export function Confetti({ active, onComplete }: ConfettiProps) {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    x: Math.random() * width,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * 400,
    size: 6 + Math.random() * 8,
  }));

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <ConfettiPiece key={p.id} {...p} onComplete={onComplete} />
      ))}
    </View>
  );
}

function ConfettiPiece({
  x,
  color,
  delay,
  size,
  onComplete,
}: {
  x: number;
  color: string;
  delay: number;
  size: number;
  onComplete?: () => void;
}) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(height + 50, { duration: 2500 }),
    );
    rotate.value = withDelay(delay, withTiming(720, { duration: 2500 }));
    opacity.value = withDelay(
      delay + 1800,
      withTiming(0, { duration: 700 }, (finished) => {
        if (finished && onComplete) runOnJS(onComplete)();
      }),
    );
  }, [delay, translateY, rotate, opacity, onComplete]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        { left: x, width: size, height: size * 1.4, backgroundColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  piece: {
    position: 'absolute',
    top: 0,
    borderRadius: 2,
  },
});
