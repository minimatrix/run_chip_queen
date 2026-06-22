import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { theme } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function StatsScreen() {
  const games = useAppStore((s) => s.games);

  const activeGames = games.filter((g) => g.status === 'active').length;
  const finishedGames = games.filter((g) => g.status === 'finished').length;
  const totalStake = games.reduce((sum, g) => sum + g.stakePerPotPence, 0);
  const avgStake = games.length > 0 ? Math.round(totalStake / games.length) : 0;

  return (
    <View style={styles.container}>
      <AppHeader title="Stats" subtitle="Your game history at a glance." />
      {games.length === 0 ? (
        <EmptyState
          icon="stats-chart-outline"
          title="No stats yet"
          subtitle="Play some games to see your stats here."
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            <StatCard label="Total Games" value={String(games.length)} />
            <StatCard label="Active" value={String(activeGames)} />
            <StatCard label="Finished" value={String(finishedGames)} />
            <StatCard
              label="Avg Stake"
              value={avgStake >= 100 ? formatMoney(avgStake) : `${avgStake}p`}
            />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Games</Text>
            {games.slice(0, 5).map((game) => (
              <View key={game.id} style={styles.gameRow}>
                <Text style={styles.gameName}>{game.name}</Text>
                <Text style={styles.gameMeta}>
                  {game.playerCount} players · {game.stakePerPotPence}p in ·{' '}
                  {game.status}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.emerald,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  section: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 12,
  },
  gameRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  gameName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  gameMeta: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
});
