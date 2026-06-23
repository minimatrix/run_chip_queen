import { StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import { GlassPanel } from './GlassPanel';

type RoundHeroCardProps = {
  roundNumber: number;
  stakePence: number;
  potValuePence: number;
  editing?: boolean;
};

export function RoundHeroCard({
  roundNumber,
  stakePence,
  potValuePence,
  editing = false,
}: RoundHeroCardProps) {
  return (
    <GlassPanel variant="dark" style={styles.card}>
      <Text style={styles.suit}>♠</Text>
      <Text style={styles.round}>
        Round {roundNumber}
        {editing ? ' · Editing' : ''}
      </Text>
      <View style={styles.stats}>
        <Stat label="In" value={formatStake(stakePence)} />
        <View style={styles.divider} />
        <Stat label="Per Pot" value={formatStake(potValuePence)} />
      </View>
    </GlassPanel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  suit: {
    fontSize: 20,
    color: theme.gold,
    marginBottom: 4,
  },
  round: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: theme.ivory,
    marginBottom: 14,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: theme.gold,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(217, 183, 93, 0.3)',
  },
});
