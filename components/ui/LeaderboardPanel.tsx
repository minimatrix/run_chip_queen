import { StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { PlayerTotal } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

const MEDALS = ['🥇', '🥈', '🥉'];

type LeaderboardPanelProps = {
  totals: PlayerTotal[];
  showRemaining?: boolean;
  compact?: boolean;
  balanceLabel?: string;
  /** When true, only players not in the current round show as Out. */
  useInCurrentRoundForOut?: boolean;
};

function isPlayerOut(
  row: PlayerTotal,
  showRemaining: boolean,
  useInCurrentRoundForOut: boolean,
): boolean {
  if (!showRemaining) return false;
  if (useInCurrentRoundForOut && row.inCurrentRound !== undefined) {
    return !row.inCurrentRound;
  }
  return !row.canPlay;
}

export function LeaderboardPanel({
  totals,
  showRemaining = false,
  compact = false,
  balanceLabel = 'Left',
  useInCurrentRoundForOut = false,
}: LeaderboardPanelProps) {
  const sorted = [...totals].sort((a, b) =>
    showRemaining ? b.remaining - a.remaining : b.total - a.total,
  );

  return (
    <GlassPanel style={styles.panel}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.nameCol]}>Player</Text>
        {!compact ? (
          <>
            <Text style={styles.headerCell}>Run</Text>
            <Text style={styles.headerCell}>Chip</Text>
            <Text style={styles.headerCell}>Queen</Text>
          </>
        ) : null}
        <Text style={[styles.headerCell, styles.totalCol]}>
          {showRemaining ? balanceLabel : 'Won'}
        </Text>
      </View>
      {sorted.map((row, index) => (
        <View
          key={row.playerId}
          style={[
            styles.row,
            index % 2 === 1 && styles.rowAlt,
            isPlayerOut(row, showRemaining, useInCurrentRoundForOut) &&
              styles.rowOut,
          ]}
        >
          <View style={[styles.nameCol, styles.nameCell]}>
            <Text style={styles.medal}>{MEDALS[index] ?? `${index + 1}`}</Text>
            <PokerChip
              player={{
                id: row.playerId,
                name: row.name,
                color: row.color,
              }}
              showName={false}
              size="small"
              inline
            />
            <Text style={styles.playerName} numberOfLines={1}>
              {row.name}
            </Text>
          </View>
          {!compact ? (
            <>
              <Text style={styles.cell}>{formatMoney(row.run)}</Text>
              <Text style={styles.cell}>{formatMoney(row.chip)}</Text>
              <Text style={styles.cell}>{formatMoney(row.queen)}</Text>
            </>
          ) : null}
          <Text
            style={[
              styles.cell,
              styles.totalCol,
              styles.totalValue,
              isPlayerOut(row, showRemaining, useInCurrentRoundForOut) &&
                styles.out,
            ]}
          >
            {showRemaining
              ? isPlayerOut(row, showRemaining, useInCurrentRoundForOut)
                ? 'Out'
                : formatMoney(row.remaining)
              : formatMoney(row.total)}
          </Text>
        </View>
      ))}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(8, 65, 45, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 183, 93, 0.25)',
  },
  headerCell: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: theme.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  nameCol: {
    flex: 2.2,
    textAlign: 'left',
  },
  totalCol: {
    fontFamily: fonts.sansBold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 183, 93, 0.15)',
  },
  rowAlt: {
    backgroundColor: 'rgba(247, 244, 236, 0.5)',
  },
  rowOut: {
    opacity: 0.55,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  medal: {
    fontSize: 16,
    width: 22,
    textAlign: 'center',
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.text,
  },
  cell: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  totalValue: {
    fontFamily: fonts.sansBold,
    color: theme.primary,
    fontSize: 13,
  },
  out: {
    color: theme.danger,
    fontSize: 11,
  },
});
