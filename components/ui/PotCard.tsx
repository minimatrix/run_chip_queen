import { Alert, StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import type { Player } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

type PotType = 'run' | 'chip' | 'queen';

const POT_META: Record<
  PotType,
  { emoji: string; label: string; accent: string }
> = {
  run: { emoji: '🏃', label: 'RUN', accent: theme.gold },
  chip: { emoji: '🟠', label: 'CHIP', accent: '#E8A04C' },
  queen: { emoji: '👑', label: 'QUEEN', accent: theme.goldLight },
};

type PotCardProps = {
  type: PotType;
  players: Player[];
  potValuePence: number;
  basePotValuePence?: number;
  selectedId?: string | null;
  disabledPlayerIds?: Set<string>;
  onSelect: (playerId: string | null) => void;
  index?: number;
};

export function PotCard({
  type,
  players,
  potValuePence,
  basePotValuePence,
  selectedId,
  disabledPlayerIds = new Set(),
  onSelect,
  index = 0,
}: PotCardProps) {
  const meta = POT_META[type];
  const hasCarryover =
    basePotValuePence !== undefined && potValuePence > basePotValuePence;

  const handleSelect = (playerId: string) => {
    if (disabledPlayerIds.has(playerId)) {
      Alert.alert('Out of funds', 'This player cannot afford another round.');
      return;
    }
    onSelect(selectedId === playerId ? null : playerId);
  };

  return (
    <View>
      <GlassPanel style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: meta.accent }]}>
              {meta.label}
            </Text>
            <View style={[styles.potBadge, hasCarryover && styles.carryover]}>
              <Text style={styles.potValue}>{formatStake(potValuePence)}</Text>
              {hasCarryover ? (
                <Text style={styles.carryoverHint}>inc. carryover</Text>
              ) : null}
            </View>
          </View>
        </View>
        <View style={styles.chips}>
          {players.map((player) => (
            <PokerChip
              key={player.id}
              player={player}
              selected={selectedId === player.id}
              disabled={disabledPlayerIds.has(player.id)}
              onPress={() => handleSelect(player.id)}
              isQueenPot={type === 'queen'}
            />
          ))}
        </View>
      </GlassPanel>
    </View>
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
    gap: 12,
    marginBottom: 14,
  },
  emoji: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    letterSpacing: 2,
  },
  potBadge: {
    backgroundColor: 'rgba(8, 65, 45, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.3)',
    alignItems: 'flex-end',
  },
  carryover: {
    backgroundColor: 'rgba(217, 183, 93, 0.2)',
    borderColor: theme.gold,
  },
  potValue: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.primary,
  },
  carryoverHint: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: theme.goldDark,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
});
