import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { HistoryRoundCard } from '@/components/ui/HistoryRoundCard';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import {
  getPotValuesForRound,
  getRoundPayouts,
  getTwoHandsPlayerForRound,
} from '@/lib/calculations';
import { useAppStore } from '@/store/useAppStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, activeGamePlayers, activeGameRounds, deleteRound } =
    useAppStore();

  if (!activeGame) return null;

  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return '—';
    return activeGamePlayers.find((p) => p.id === playerId)?.name ?? '—';
  };

  const handleDelete = (roundId: string, roundNumber: number) => {
    Alert.alert(
      'Delete Round',
      `Delete round ${roundNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRound(roundId),
        },
      ],
    );
  };

  const handleEdit = (roundId: string, roundNumber: number) => {
    router.push({
      pathname: '/game/[id]/round',
      params: { id, roundId, roundNumber: String(roundNumber) },
    });
  };

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Round History" subtitle={activeGame.name} suit="♦" />
        {activeGameRounds.length === 0 ? (
          <PremiumEmptyState
            suit="♣"
            title="No rounds yet"
            subtitle="Add your first round to start tracking the table."
          />
        ) : (
          <FlatList
            data={[...activeGameRounds].reverse()}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const potValues = getPotValuesForRound(
                activeGame,
                activeGamePlayers,
                activeGameRounds,
                item.roundNumber,
              );
              const payouts = getRoundPayouts(
                activeGame,
                activeGamePlayers,
                activeGameRounds,
                item,
              );
              const priorRounds = activeGameRounds.filter(
                (round) => round.roundNumber < item.roundNumber,
              );
              const twoHandsPlayer = getTwoHandsPlayerForRound(
                activeGame,
                activeGamePlayers,
                priorRounds,
                item.roundNumber,
              );

              return (
                <HistoryRoundCard
                  roundNumber={item.roundNumber}
                  twoHandsName={twoHandsPlayer?.name}
                  runWinner={getPlayerName(item.runWinnerId)}
                  chipWinner={getPlayerName(item.chipWinnerId)}
                  queenWinner={getPlayerName(item.queenWinnerId)}
                  runPayout={item.runWinnerId ? potValues.run : undefined}
                  chipPayout={item.chipWinnerId ? potValues.chip : undefined}
                  queenPayout={item.queenWinnerId ? potValues.queen : undefined}
                  onPress={() => handleEdit(item.id, item.roundNumber)}
                  onDelete={() => handleDelete(item.id, item.roundNumber)}
                  index={index}
                />
              );
            }}
          />
        )}
        <View style={styles.footer}>
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
          />
        </View>
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
});
