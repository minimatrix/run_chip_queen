import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LeaderboardPanel } from '@/components/ui/LeaderboardPanel';
import { MoneyCounter } from '@/components/ui/MoneyCounter';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { theme, fonts } from '@/constants/theme';
import {
  calculatePlayerTotals,
  getAverageRoundValuePence,
  getTotalGameValuePence,
} from '@/lib/calculations';
import { useAppStore } from '@/store/useAppStore';

export default function TotalsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, activeGamePlayers, activeGameRounds } = useAppStore();

  if (!activeGame) return null;

  const totals = calculatePlayerTotals(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
  );
  const sorted = [...totals].sort((a, b) => b.total - a.total);
  const roundTotal = getAverageRoundValuePence(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
  );
  const gameValue = getTotalGameValuePence(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
  );

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Leaderboard" subtitle={activeGame.name} suit="♣" />
        <ScrollView contentContainerStyle={styles.content}>
          <GlassPanel style={styles.summary}>
            <View style={styles.summaryRow}>
              <SummaryStat
                label="Per Round"
                value={<MoneyCounter pence={roundTotal} style={styles.summaryValue} />}
              />
              <View style={styles.summaryDivider} />
              <SummaryStat
                label="Rounds"
                value={
                  <Text style={styles.summaryValue}>
                    {activeGameRounds.length}
                  </Text>
                }
              />
              <View style={styles.summaryDivider} />
              <SummaryStat
                label="Table Total"
                value={<MoneyCounter pence={gameValue} style={styles.summaryValue} />}
              />
            </View>
          </GlassPanel>

          <LeaderboardPanel totals={sorted} showRemaining />

          <PrimaryGoldButton
            title="Add Next Round"
            onPress={() =>
              router.push({
                pathname: '/game/[id]/round',
                params: {
                  id,
                  roundNumber: String(activeGameRounds.length + 1),
                },
              })
            }
            style={styles.btn}
          />
          <SecondaryGreenButton
            title="Game History"
            onPress={() =>
              router.navigate({ pathname: '/game/[id]/history', params: { id } })
            }
            style={styles.btn}
          />
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryLabel}>{label}</Text>
      {value}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  summary: {
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: theme.primary,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(217, 183, 93, 0.3)',
  },
  btn: {
    marginTop: 12,
  },
});
