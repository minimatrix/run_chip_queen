import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import {
  getPotValuesForRound,
  getRoundPayouts,
} from '@/lib/calculations';
import { useAppStore } from '@/store/useAppStore';

export default function HistoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activeGame,
    activeGamePlayers,
    activeGameRounds,
    deleteRound,
  } = useAppStore();

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
    <View style={styles.container}>
      <AppHeader title="Game History" subtitle={activeGame.name} />
      {activeGameRounds.length === 0 ? (
        <EmptyState
          icon="list-outline"
          title="No rounds yet"
          subtitle="Add your first round to start tracking."
        />
      ) : (
        <FlatList
          data={activeGameRounds}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
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

            return (
              <Pressable
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => handleEdit(item.id, item.roundNumber)}
              >
                <View style={styles.roundBadge}>
                  <Text style={styles.roundNum}>{item.roundNumber}</Text>
                </View>
                <View style={styles.details}>
                  <Text style={styles.potValue}>
                    Run {formatStake(potValues.run)}
                    {item.runWinnerId ? '' : ' · rolled'}
                    {' · '}
                    Chip {formatStake(potValues.chip)}
                    {item.chipWinnerId ? '' : ' · rolled'}
                    {' · '}
                    Queen {formatStake(potValues.queen)}
                    {item.queenWinnerId ? '' : ' · rolled'}
                  </Text>
                  <View style={styles.winners}>
                    <WinnerTag
                      label="Run"
                      name={getPlayerName(item.runWinnerId)}
                      payout={payouts.run}
                    />
                    <WinnerTag
                      label="Chip"
                      name={getPlayerName(item.chipWinnerId)}
                      payout={payouts.chip}
                    />
                    <WinnerTag
                      label="Queen"
                      name={getPlayerName(item.queenWinnerId)}
                      payout={payouts.queen}
                    />
                  </View>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.id, item.roundNumber)}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={20} color={theme.danger} />
                </Pressable>
              </Pressable>
            );
          }}
        />
      )}
      <View style={styles.footer}>
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
        />
      </View>
    </View>
  );
}

function WinnerTag({
  label,
  name,
  payout,
}: {
  label: string;
  name: string;
  payout: number;
}) {
  return (
    <Text style={styles.winnerTag}>
      <Text style={styles.winnerLabel}>{label}: </Text>
      {name}
      {payout > 0 ? (
        <Text style={styles.payout}> ({formatStake(payout)})</Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
    gap: 12,
  },
  pressed: {
    opacity: 0.9,
  },
  roundBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundNum: {
    color: theme.white,
    fontWeight: '700',
    fontSize: 16,
  },
  details: {
    flex: 1,
  },
  potValue: {
    fontSize: 11,
    color: theme.textSecondary,
    marginBottom: 4,
    lineHeight: 16,
  },
  winners: {
    gap: 2,
  },
  winnerTag: {
    fontSize: 13,
    color: theme.text,
  },
  winnerLabel: {
    fontWeight: '600',
    color: theme.emerald,
  },
  payout: {
    color: theme.textSecondary,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
  },
});
