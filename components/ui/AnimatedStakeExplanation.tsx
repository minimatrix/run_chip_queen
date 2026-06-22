import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';

type AnimatedStakeExplanationProps = {
  playerCount: number;
  stakePence: number;
};

export function AnimatedStakeExplanation({
  playerCount,
  stakePence,
}: AnimatedStakeExplanationProps) {
  const potValue = stakePence * playerCount;
  const roundTotal = potValue * 3;

  return (
    <View style={styles.container}>
      <AnimatedLine
        key={`line1-${playerCount}-${stakePence}`}
        text={`${playerCount} players × ${formatStake(stakePence)}`}
      />
      <Text style={styles.arrow}>↓</Text>
      <AnimatedLine
        key={`line2-${playerCount}-${stakePence}`}
        text={`${formatStake(potValue)} per pot`}
      />
      <Text style={styles.arrow}>↓</Text>
      <AnimatedLine
        key={`line3-${playerCount}-${stakePence}`}
        text={`${formatMoney(roundTotal)} total each round`}
        highlight
      />
    </View>
  );
}

function AnimatedLine({
  text,
  highlight = false,
}: {
  text: string;
  highlight?: boolean;
}) {
  return (
    <Animated.Text
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(150)}
      style={[styles.line, highlight && styles.highlight]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(217, 183, 93, 0.1)',
    borderRadius: theme.cardRadius,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.3)',
    marginTop: 16,
  },
  line: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: theme.ivory,
    textAlign: 'center',
  },
  highlight: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: theme.gold,
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: theme.gold,
    marginVertical: 6,
    opacity: 0.7,
  },
});
