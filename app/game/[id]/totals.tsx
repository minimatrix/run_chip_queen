import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SummaryPanel } from '@/components/SummaryPanel';
import { TotalsTable } from '@/components/TotalsTable';
import { theme } from '@/constants/theme';
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
    <View style={styles.container}>
      <AppHeader title="Totals" subtitle={activeGame.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <SummaryPanel
          totalInPerRound={roundTotal}
          roundsPlayed={activeGameRounds.length}
          totalGameValue={gameValue}
        />
        <TotalsTable totals={totals} showRemaining />
        <PrimaryButton
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
        <PrimaryButton
          title="Game History"
          variant="outline"
          onPress={() =>
            router.push({ pathname: '/game/[id]/history', params: { id } })
          }
          style={styles.btn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  btn: {
    marginTop: 12,
  },
});
