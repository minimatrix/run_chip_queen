import { Alert, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import { PlayerChip } from './PlayerChip';
import type { Player } from '@/lib/types';

type PotSelectorProps = {
  title: string;
  potValuePence: number;
  basePotValuePence?: number;
  players: Player[];
  selectedId?: string | null;
  disabledPlayerIds?: Set<string>;
  onSelect: (playerId: string | null) => void;
};

export function PotSelector({
  title,
  potValuePence,
  basePotValuePence,
  players,
  selectedId,
  disabledPlayerIds = new Set(),
  onSelect,
}: PotSelectorProps) {
  const handleSelect = (playerId: string) => {
    if (disabledPlayerIds.has(playerId)) {
      Alert.alert(
        'Out of funds',
        'This player cannot afford another round.',
      );
      return;
    }

    onSelect(selectedId === playerId ? null : playerId);
  };

  const hasCarryover =
    basePotValuePence !== undefined && potValuePence > basePotValuePence;

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.potBadge, hasCarryover && styles.potBadgeCarryover]}>
          <Text style={styles.potBadgeText}>
            {formatStake(potValuePence)} to win
          </Text>
          {hasCarryover ? (
            <Text style={styles.carryoverHint}>inc. carryover</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.players}>
        {players.map((player) => (
          <PlayerChip
            key={player.id}
            player={player}
            selected={selectedId === player.id}
            disabled={disabledPlayerIds.has(player.id)}
            onPress={() => handleSelect(player.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.emerald,
    flex: 1,
  },
  potBadge: {
    backgroundColor: theme.mint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C6E8CC',
    alignItems: 'flex-end',
  },
  potBadgeCarryover: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  potBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.emeraldDark,
  },
  carryoverHint: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
    marginTop: 2,
  },
  players: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
