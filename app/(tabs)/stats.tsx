import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { theme, fonts } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function StatsScreen() {
  const games = useAppStore((s) => s.games);

  const activeGames = games.filter((g) => g.status === 'active').length;
  const finishedGames = games.filter((g) => g.status === 'finished').length;
  const totalStake = games.reduce((sum, g) => sum + g.stakePerPotPence, 0);
  const avgStake = games.length > 0 ? Math.round(totalStake / games.length) : 0;

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Stats"
          subtitle="Your table history at a glance."
          suit="♣"
        />
        {games.length === 0 ? (
          <PremiumEmptyState
            suit="♦"
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
                value={
                  avgStake >= 100 ? formatMoney(avgStake) : formatStake(avgStake)
                }
              />
            </View>
            <GlassPanel style={styles.section}>
              <Text style={styles.sectionTitle}>♠ Recent Tables</Text>
              {games.slice(0, 5).map((game) => (
                <View key={game.id} style={styles.gameRow}>
                  <Text style={styles.gameName}>{game.name}</Text>
                  <Text style={styles.gameMeta}>
                    {game.playerCount} players ·{' '}
                    {formatStake(game.stakePerPotPence)} in · {game.status}
                  </Text>
                </View>
              ))}
            </GlassPanel>
          </ScrollView>
        )}
      </SafeAreaView>
    </FeltBackground>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
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
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: theme.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: theme.text,
    marginBottom: 12,
  },
  gameRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 183, 93, 0.2)',
  },
  gameName: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: theme.text,
  },
  gameMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
});
