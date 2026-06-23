import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { formatDate, formatStake } from '@/lib/format';
import type { GameWithMeta } from '@/lib/types';
import { AnimatedPressable } from './AnimatedPressable';
import { SwipeToDelete } from './SwipeToDelete';

type PastGameCardProps = {
  game: GameWithMeta;
  onPress: () => void;
  onDelete: () => void;
  index?: number;
};

export function PastGameCard({
  game,
  onPress,
  onDelete,
  index = 0,
}: PastGameCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.outer}
    >
      <SwipeToDelete onDelete={onDelete}>
        <AnimatedPressable onPress={onPress} scaleTo={0.99} style={styles.pressable}>
          <View style={styles.card}>
            <Text style={styles.suit}>♦</Text>
            <Text style={styles.name}>{game.name}</Text>
            <Text style={styles.meta}>
              {game.playerCount} players · {formatStake(game.stakePerPotPence)} in
            </Text>
            <Text style={styles.date}>
              {game.status === 'active'
                ? `Started ${formatDate(game.createdAt)}`
                : `Ended ${formatDate(game.finishedAt ?? game.createdAt)}`}
            </Text>
          </View>
        </AnimatedPressable>
      </SwipeToDelete>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 10,
    borderRadius: theme.cardRadius,
    ...theme.shadowSoft,
  },
  pressable: {
    backgroundColor: theme.ivory,
  },
  card: {
    backgroundColor: theme.ivory,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.3)',
  },
  suit: {
    fontSize: 14,
    color: theme.gold,
    marginBottom: 6,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: theme.text,
    marginBottom: 4,
  },
  meta: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  date: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: theme.muted,
    marginTop: 6,
  },
});
