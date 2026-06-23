import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { fonts } from '@/constants/theme';

type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
  style?: object;
  duration?: number;
};

export function AnimatedNumber({
  value,
  format,
  style,
  duration = 700,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(format(value));
  const frameRef = useRef<number | null>(null);
  const startRef = useRef({ from: value, startTime: 0 });

  useEffect(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    const from = startRef.current.from;
    const to = value;
    if (from === to) {
      setDisplay(format(to));
      return;
    }

    startRef.current = { from, startTime: Date.now() };

    const tick = () => {
      const elapsed = Date.now() - startRef.current.startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(from + (to - from) * eased);
      setDisplay(format(current));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        startRef.current.from = to;
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, format, duration]);

  return <Text style={[styles.text, style]}>{display}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.sansBold,
    fontVariant: ['tabular-nums'],
  },
});
