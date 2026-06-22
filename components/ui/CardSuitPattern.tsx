import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';

const SUITS = ['♠', '♥', '♣', '♦'] as const;

type CardSuitPatternProps = {
  opacity?: number;
};

export function CardSuitPattern({ opacity = 0.08 }: CardSuitPatternProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: 24 }).map((_, index) => (
        <Text
          key={index}
          style={[
            styles.suit,
            {
              opacity,
              left: `${(index % 6) * 18}%` as unknown as number,
              top: `${Math.floor(index / 6) * 22}%` as unknown as number,
              color:
                SUITS[index % 4] === '♥' || SUITS[index % 4] === '♦'
                  ? '#E8A0A0'
                  : theme.ivory,
            },
          ]}
        >
          {SUITS[index % 4]}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  suit: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: '700',
  },
});
