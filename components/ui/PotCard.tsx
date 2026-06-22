import { useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import type { Player } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

type PotType = 'run' | 'chip' | 'queen';

const POT_LABELS: Record<PotType, string> = {
  run: 'RUN',
  chip: 'CHIP',
  queen: 'QUEEN',
};

type PotCardProps = {
  type: PotType;
  players: Player[];
  potValuePence: number;
  basePotValuePence?: number;
  selectedId?: string | null;
  disabledPlayerIds?: Set<string>;
  onSelect: (playerId: string | null) => void;
};

function getCarryoverRounds(
  potValuePence: number,
  basePotValuePence?: number,
): number {
  if (!basePotValuePence || basePotValuePence <= 0) return 0;
  if (potValuePence <= basePotValuePence) return 0;
  return Math.max(0, Math.floor(potValuePence / basePotValuePence) - 1);
}

export function PotCard({
  type,
  players,
  potValuePence,
  basePotValuePence,
  selectedId,
  disabledPlayerIds = new Set(),
  onSelect,
}: PotCardProps) {
  const carryoverRounds = getCarryoverRounds(potValuePence, basePotValuePence);
  const hasCarryover = carryoverRounds >= 1;
  const isHeavyCarryover = carryoverRounds >= 2;

  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!hasCarryover) {
      pulse.value = 1;
      return;
    }

    const duration = isHeavyCarryover ? 320 : 650;
    const peak = isHeavyCarryover ? 1.07 : 1.04;

    pulse.value = withRepeat(
      withSequence(
        withTiming(peak, { duration }),
        withTiming(1, { duration }),
      ),
      -1,
      true,
    );
  }, [hasCarryover, isHeavyCarryover, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleSelect = (playerId: string) => {
    if (disabledPlayerIds.has(playerId)) {
      Alert.alert(
        'Not in this round',
        'This player did not buy into the current round.',
      );
      return;
    }
    onSelect(selectedId === playerId ? null : playerId);
  };

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{POT_LABELS[type]}</Text>
        <Animated.View
          style={[
            styles.potValueRow,
            hasCarryover && styles.carryoverRow,
            isHeavyCarryover && styles.heavyCarryoverRow,
            hasCarryover && pulseStyle,
          ]}
        >
          <Text
            style={[
              styles.potValue,
              hasCarryover && styles.carryoverValue,
              isHeavyCarryover && styles.heavyCarryoverValue,
            ]}
          >
            {formatStake(potValuePence)}
          </Text>
          {hasCarryover ? (
            <Text
              style={[
                styles.carryoverHint,
                isHeavyCarryover && styles.heavyCarryoverHint,
              ]}
            >
              {isHeavyCarryover
                ? `rolled ${carryoverRounds}×`
                : 'inc. carryover'}
            </Text>
          ) : null}
        </Animated.View>
      </View>

      <View style={styles.chips}>
        {players.map((player) => (
          <PokerChip
            key={player.id}
            player={player}
            selected={selectedId === player.id}
            disabled={disabledPlayerIds.has(player.id)}
            onPress={() => handleSelect(player.id)}
          />
        ))}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    letterSpacing: 2,
    color: theme.primary,
    flex: 1,
  },
  potValueRow: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(8, 65, 45, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.3)',
    minWidth: 72,
  },
  carryoverRow: {
    backgroundColor: theme.ivory,
    borderColor: theme.gold,
  },
  heavyCarryoverRow: {
    backgroundColor: '#FDECEC',
    borderColor: theme.danger,
  },
  potValue: {
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: theme.primary,
  },
  carryoverValue: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: theme.primary,
  },
  heavyCarryoverValue: {
    color: '#9B2C2C',
  },
  carryoverHint: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: theme.primary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.75,
  },
  heavyCarryoverHint: {
    color: theme.danger,
    opacity: 1,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
});
