import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { getInitials } from '@/lib/format';
import type { PlayerTotal } from '@/lib/types';

type TotalsTableProps = {
  totals: PlayerTotal[];
  showNet?: boolean;
  showRemaining?: boolean;
};

export function TotalsTable({
  totals,
  showNet = false,
  showRemaining = false,
}: TotalsTableProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.playerCol]}>Player</Text>
        <Text style={styles.headerCell}>Run</Text>
        <Text style={styles.headerCell}>Chip</Text>
        <Text style={styles.headerCell}>Queen</Text>
        <Text style={[styles.headerCell, styles.totalCol]}>Total</Text>
        {showRemaining ? (
          <Text style={styles.headerCell}>Left</Text>
        ) : null}
        {showNet ? <Text style={styles.headerCell}>Net</Text> : null}
      </View>
      {totals.map((row, index) => (
        <View
          key={row.playerId}
          style={[
            styles.row,
            index % 2 === 0 && styles.rowAlt,
            !row.canPlay && showRemaining && styles.rowOut,
          ]}
        >
          <View style={[styles.playerCol, styles.playerCell]}>
            <View
              style={[styles.avatar, { backgroundColor: row.color }]}
            >
              <Text style={styles.avatarText}>{getInitials(row.name)}</Text>
            </View>
            <Text style={styles.playerName} numberOfLines={1}>
              {row.name}
            </Text>
          </View>
          <Text style={styles.cell}>{formatMoney(row.run)}</Text>
          <Text style={styles.cell}>{formatMoney(row.chip)}</Text>
          <Text style={styles.cell}>{formatMoney(row.queen)}</Text>
          <Text style={[styles.cell, styles.totalCol, styles.totalValue]}>
            {formatMoney(row.total)}
          </Text>
          {showRemaining ? (
            <Text
              style={[
                styles.cell,
                !row.canPlay && styles.negative,
                row.canPlay && styles.positive,
              ]}
            >
              {formatMoney(row.remaining)}
            </Text>
          ) : null}
          {showNet ? (
            <Text
              style={[
                styles.cell,
                row.net > 0 && styles.positive,
                row.net < 0 && styles.negative,
              ]}
            >
              {formatMoney(row.net)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
    ...theme.shadow,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: theme.mint,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: theme.emerald,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowAlt: {
    backgroundColor: '#FAFAFA',
  },
  rowOut: {
    opacity: 0.6,
  },
  playerCol: {
    flex: 2,
    textAlign: 'left',
  },
  totalCol: {
    fontWeight: '700',
  },
  playerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.white,
    fontSize: 10,
    fontWeight: '700',
  },
  playerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  cell: {
    flex: 1,
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  totalValue: {
    color: theme.emerald,
    fontWeight: '700',
  },
  positive: {
    color: theme.success,
    fontWeight: '600',
  },
  negative: {
    color: theme.danger,
    fontWeight: '600',
  },
});
