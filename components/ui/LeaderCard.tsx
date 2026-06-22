import { StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import type { PlayerTotal } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { MoneyCounter } from './MoneyCounter';
import { PokerChip } from './PokerChip';

const RANK_STYLES = [
  { medal: '🥇', border: theme.gold, glow: 'rgba(217, 183, 93, 0.25)' },
  { medal: '🥈', border: theme.silver, glow: 'rgba(168, 180, 196, 0.2)' },
  { medal: '🥉', border: theme.bronze, glow: 'rgba(196, 154, 108, 0.2)' },
];

type LeaderCardProps = {
  total: PlayerTotal;
  rank: number;
  showRemaining?: boolean;
  compact?: boolean;
};

export function LeaderCard({
  total,
  rank,
  showRemaining = false,
  compact = false,
}: LeaderCardProps) {
  const rankStyle = RANK_STYLES[rank] ?? {
    medal: `${rank + 1}`,
    border: theme.muted,
    glow: 'transparent',
  };
  const isLeader = rank === 0;

  return (
    <View>
      <GlassPanel
        style={[
          styles.card,
          { borderColor: rankStyle.border, borderWidth: isLeader ? 2 : 1 },
          isLeader ? { backgroundColor: rankStyle.glow } : undefined,
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.medal}>{rankStyle.medal}</Text>
          <PokerChip
            player={{
              id: total.playerId,
              name: total.name,
              color: total.color,
            }}
            showName={false}
            size="small"
          />
          <Text style={styles.name}>{total.name}</Text>
          {showRemaining ? (
            <View style={styles.remaining}>
              <Text style={styles.remainingLabel}>Left</Text>
              <MoneyCounter
                pence={total.remaining}
                style={[
                  styles.remainingValue,
                  !total.canPlay && styles.out,
                ]}
              />
            </View>
          ) : (
            <MoneyCounter pence={total.total} style={styles.totalValue} />
          )}
        </View>
        {!compact ? (
          <View style={styles.breakdown}>
            <Stat label="Run" value={total.run} />
            <Stat label="Chip" value={total.chip} />
            <Stat label="Queen" value={total.queen} />
            <Stat label="Total" value={total.total} highlight />
          </View>
        ) : null}
      </GlassPanel>
    </View>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, highlight && styles.statHighlight]}>
        {formatMoney(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  medal: {
    fontSize: 22,
    width: 28,
  },
  name: {
    flex: 1,
    fontFamily: fonts.serif,
    fontSize: 18,
    color: theme.text,
  },
  totalValue: {
    fontSize: 18,
  },
  remaining: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  remainingValue: {
    fontSize: 16,
  },
  out: {
    color: theme.danger,
  },
  breakdown: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(217, 183, 93, 0.2)',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: theme.text,
  },
  statHighlight: {
    color: theme.primary,
    fontSize: 15,
  },
});
