import { useRef } from 'react';
import {
  Animated as RNAnimated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import Reanimated, { FadeInDown } from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { twoHandsLabel } from '@/lib/format';
import { GlassPanel } from './GlassPanel';
import { WinnerBadge } from './WinnerBadge';
import { AnimatedPressable } from './AnimatedPressable';

type HistoryRoundCardProps = {
  roundNumber: number;
  twoHandsName?: string;
  runWinner: string;
  chipWinner: string;
  queenWinner: string;
  runPayout?: number;
  chipPayout?: number;
  queenPayout?: number;
  onPress: () => void;
  onDelete: () => void;
  index?: number;
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
}: HistoryRoundCardProps) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const deleteOpacity = translateX.interpolate({
    inputRange: [-100, -40, 0],
    outputRange: [1, 0.5, 0],
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) translateX.setValue(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -80) {
          RNAnimated.timing(translateX, {
            toValue: -100,
            duration: 200,
            useNativeDriver: true,
          }).start();
        } else {
          RNAnimated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Reanimated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={styles.wrapper}>
        <View style={styles.deleteBg}>
          <Trash2 size={22} color={theme.ivory} />
          <Text style={styles.deleteText}>Delete</Text>
        </View>
        <RNAnimated.View
          style={{ transform: [{ translateX }] }}
          {...panResponder.panHandlers}
        >
          <AnimatedPressable onPress={onPress} scaleTo={0.98}>
            <GlassPanel style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.suit}>♣</Text>
                <Text style={styles.round}>Round {roundNumber}</Text>
              </View>
              {twoHandsName ? (
                <Text style={styles.twoHands}>
                  {twoHandsLabel(twoHandsName)}
                </Text>
              ) : null}
              <View style={styles.winners}>
                <WinnerBadge pot="Run" name={runWinner} payout={runPayout} />
                <WinnerBadge pot="Chip" name={chipWinner} payout={chipPayout} />
                <WinnerBadge
                  pot="Queen"
                  name={queenWinner}
                  payout={queenPayout}
                />
              </View>
            </GlassPanel>
          </AnimatedPressable>
        </RNAnimated.View>
        <RNAnimated.View
          style={[styles.deleteAction, { opacity: deleteOpacity }]}
          pointerEvents="box-none"
        >
          <AnimatedPressable onPress={onDelete} style={styles.deleteBtn}>
            <Trash2 size={20} color={theme.ivory} />
          </AnimatedPressable>
        </RNAnimated.View>
      </View>
    </Reanimated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
    position: 'relative',
  },
  deleteBg: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: theme.danger,
    borderRadius: theme.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  deleteText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.ivory,
  },
  deleteAction: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 16,
    ...theme.shadow,
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
