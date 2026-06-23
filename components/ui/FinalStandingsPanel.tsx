import { StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { PlayerTotal } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

const MEDALS = ['🥇', '🥈', '🥉'];

type FinalStandingsPanelProps = {
  totals: PlayerTotal[];
};

export function FinalStandingsPanel({ totals }: FinalStandingsPanelProps) {
  const sorted = [...totals].sort((a, b) => b.remaining - a.remaining);

  return (
    <View style={styles.list}>
      {sorted.map((row, index) => (
        <GlassPanel key={row.playerId} style={styles.card}>
          <View style={styles.header}>
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
            <Text style={styles.playerName}>{row.name}</Text>
            <View style={styles.finishedBlock}>
              <Text style={styles.finishedLabel}>Finished</Text>
              <Text style={styles.finishedValue}>
                {formatMoney(row.remaining)}
              </Text>
            </View>
          </View>

          <View style={styles.breakdown}>
            <BreakdownItem label="Run" value={row.run} />
            <BreakdownItem label="Chip" value={row.chip} />
            <BreakdownItem label="Queen" value={row.queen} />
            {(row.buyInTotal ?? 0) > 0 ? (
              <BreakdownItem
                label="Top-up"
                value={row.buyInTotal ?? 0}
                highlight
              />
            ) : null}
          </View>
        </GlassPanel>
      ))}
    </View>
  );
}

function BreakdownItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.breakdownItem}>
      <Text
        style={[styles.breakdownLabel, highlight && styles.breakdownHighlight]}
      >
        {label}
      </Text>
      <Text
        style={[styles.breakdownValue, highlight && styles.breakdownHighlight]}
      >
        {formatMoney(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
    marginBottom: 14,
  },
  card: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  medal: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: theme.text,
    lineHeight: 22,
  },
  finishedBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  finishedLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 9,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  finishedValue: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: theme.primary,
  },
  breakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 183, 93, 0.2)',
  },
  breakdownItem: {
    minWidth: '45%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(8, 65, 45, 0.06)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  breakdownLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  breakdownValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.text,
  },
  breakdownHighlight: {
    color: theme.goldDark,
  },
});
