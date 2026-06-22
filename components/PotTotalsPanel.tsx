import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { getInitials } from '@/lib/format';
import type { PlayerTotal } from '@/lib/types';

type PotTotalsPanelProps = {
  totals: PlayerTotal[];
  roundCost: number;
  compact?: boolean;
};

export function PotTotalsPanel({
  totals,
  roundCost,
  compact = false,
}: PotTotalsPanelProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current totals</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.playerCol]}>Player</Text>
            <Text style={styles.headerCell}>Run</Text>
            <Text style={styles.headerCell}>Chip</Text>
            <Text style={styles.headerCell}>Queen</Text>
            <Text style={[styles.headerCell, styles.remainingCol]}>Left</Text>
          </View>
          {totals.map((row) => (
            <View
              key={row.playerId}
              style={[
                styles.row,
                !row.canPlay && styles.rowOut,
              ]}
            >
              <View style={[styles.playerCol, styles.playerCell]}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: row.color },
                    !row.canPlay && styles.avatarOut,
                  ]}
                >
                  <Text style={styles.avatarText}>{getInitials(row.name)}</Text>
                </View>
                <Text
                  style={[styles.playerName, !row.canPlay && styles.outText]}
                  numberOfLines={1}
                >
                  {row.name}
                </Text>
              </View>
              <Text style={styles.cell}>{formatMoney(row.run)}</Text>
              <Text style={styles.cell}>{formatMoney(row.chip)}</Text>
              <Text style={styles.cell}>{formatMoney(row.queen)}</Text>
              <Text
                style={[
                  styles.cell,
                  styles.remainingCol,
                  row.remaining <= 0 && styles.negative,
                  row.remaining > 0 && row.remaining < roundCost && styles.warning,
                  row.canPlay && styles.positive,
                ]}
              >
                {formatMoney(row.remaining)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {totals.some((row) => !row.canPlay) ? (
        <Text style={styles.hint}>
          Players marked out cannot afford the next round ({formatStake(roundCost)} each).
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.emerald,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerCell: {
    width: 56,
    fontSize: 10,
    fontWeight: '700',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowOut: {
    opacity: 0.55,
  },
  playerCol: {
    width: 96,
  },
  remainingCol: {
    width: 64,
    fontWeight: '700',
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOut: {
    opacity: 0.6,
  },
  avatarText: {
    color: theme.white,
    fontSize: 9,
    fontWeight: '700',
  },
  playerName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: theme.text,
  },
  outText: {
    color: theme.textMuted,
  },
  cell: {
    width: 56,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  positive: {
    color: theme.emerald,
  },
  warning: {
    color: '#CA8A04',
  },
  negative: {
    color: theme.danger,
    fontWeight: '700',
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
