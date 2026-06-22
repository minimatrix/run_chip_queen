import { StyleSheet, Text, View } from 'react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { twoHandsLabel } from '@/lib/format';
import { GlassPanel } from './GlassPanel';
import { WinnerBadge } from './WinnerBadge';
import { AnimatedPressable } from './AnimatedPressable';
import { SwipeToDelete } from './SwipeToDelete';

type HistoryRoundCardProps = {
  roundNumber: number;
  twoHandsName?: string;
  runWinner: string;
  chipWinner: string;
  queenWinner: string;
  runPayout?: number;
  chipPayout?: number;
  queenPayout?: number;
  onPress?: () => void;
  onDelete?: () => void;
  index?: number;
  readOnly?: boolean;
};

export function HistoryRoundCard({
  roundNumber,
  twoHandsName,
  runWinner,
  chipWinner,
  queenWinner,
  runPayout,
  chipPayout,
  queenPayout,
  onPress,
  onDelete,
  index = 0,
  readOnly = false,
}: HistoryRoundCardProps) {
  const card = (
    <GlassPanel style={[styles.card, readOnly && styles.cardStandalone]}>
      <View style={styles.header}>
        <Text style={styles.suit}>♣</Text>
        <Text style={styles.round}>Round {roundNumber}</Text>
      </View>
      {twoHandsName ? (
        <Text style={styles.twoHands}>{twoHandsLabel(twoHandsName)}</Text>
      ) : null}
      <View style={styles.winners}>
        <WinnerBadge pot="Run" name={runWinner} payout={runPayout} />
        <WinnerBadge pot="Chip" name={chipWinner} payout={chipPayout} />
        <WinnerBadge pot="Queen" name={queenWinner} payout={queenPayout} />
      </View>
    </GlassPanel>
  );

  return (
    <Reanimated.View
      entering={FadeInDown.delay(index * 40).springify()}
      style={styles.outer}
    >
      {readOnly ? (
        card
      ) : (
        <SwipeToDelete onDelete={onDelete ?? (() => undefined)}>
          <AnimatedPressable onPress={onPress ?? (() => undefined)} scaleTo={0.99}>
            {card}
          </AnimatedPressable>
        </SwipeToDelete>
      )}
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 12,
    borderRadius: theme.cardRadius,
    ...theme.shadowSoft,
  },
  card: {
    padding: 16,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  cardStandalone: {
    borderRadius: theme.cardRadius,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  suit: {
    fontSize: 16,
    color: theme.gold,
  },
  round: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: theme.text,
  },
  twoHands: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.goldDark,
    marginBottom: 8,
  },
  winners: {
    gap: 6,
  },
});
