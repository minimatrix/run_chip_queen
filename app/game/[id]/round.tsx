import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PotSelector } from '@/components/PotSelector';
import { PotTotalsPanel } from '@/components/PotTotalsPanel';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import {
  calculatePlayerTotals,
  getActivePlayerIdsForRound,
  getCurrentPotValues,
  getPlayerRoundCostPence,
  getPotValuePence,
  getRoundsForDisplay,
} from '@/lib/calculations';
import { formatMoney, formatStake } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import type { Round } from '@/lib/types';

const emptyForm = {
  runWinnerId: null as string | null,
  chipWinnerId: null as string | null,
  queenWinnerId: null as string | null,
  notes: '',
};

export default function RoundScreen() {
  const router = useRouter();
  const { id, roundId, roundNumber: roundNumberParam } = useLocalSearchParams<{
    id: string;
    roundId?: string;
    roundNumber?: string;
  }>();

  const {
    activeGame,
    activeGamePlayers,
    activeGameRounds,
    saveRound,
  } = useAppStore();

  const editingRound = roundId
    ? activeGameRounds.find((round) => round.id === roundId)
    : null;

  const nextRoundNumber = editingRound
    ? editingRound.roundNumber
    : roundNumberParam
      ? parseInt(roundNumberParam, 10)
      : activeGameRounds.length + 1;

  const [runWinnerId, setRunWinnerId] = useState<string | null>(null);
  const [chipWinnerId, setChipWinnerId] = useState<string | null>(null);
  const [queenWinnerId, setQueenWinnerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRoundIntoForm = (round: Round | null) => {
    if (round) {
      setRunWinnerId(round.runWinnerId ?? null);
      setChipWinnerId(round.chipWinnerId ?? null);
      setQueenWinnerId(round.queenWinnerId ?? null);
      setNotes(round.notes ?? '');
      return;
    }

    setRunWinnerId(emptyForm.runWinnerId);
    setChipWinnerId(emptyForm.chipWinnerId);
    setQueenWinnerId(emptyForm.queenWinnerId);
    setNotes(emptyForm.notes);
  };

  useEffect(() => {
    loadRoundIntoForm(editingRound ?? null);
  }, [editingRound?.id, roundId]);

  if (!activeGame) return null;

  const playerRoundCost = getPlayerRoundCostPence(activeGame);

  const priorRounds = getRoundsForDisplay(activeGameRounds, {
    editingRoundId: editingRound?.id,
    upToRoundNumber: editingRound ? undefined : nextRoundNumber,
  });

  const activePlayerIds = getActivePlayerIdsForRound(
    activeGame,
    activeGamePlayers,
    priorRounds,
  );
  const basePotValue = getPotValuePence(activeGame, activePlayerIds.length);
  const currentPotValues = getCurrentPotValues(
    activeGame,
    activeGamePlayers,
    priorRounds,
  );

  const currentTotals = calculatePlayerTotals(
    activeGame,
    priorRounds,
    activeGamePlayers,
  );

  const disabledPlayerIds = useMemo(
    () =>
      new Set(
        currentTotals.filter((row) => !row.canPlay).map((row) => row.playerId),
      ),
    [currentTotals],
  );

  const navigateToRound = (round: Round | null, roundNumber: number) => {
    router.setParams({
      roundId: round?.id,
      roundNumber: String(roundNumber),
    });
    loadRoundIntoForm(round);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveRound({
        id: editingRound?.id,
        gameId: activeGame.id,
        roundNumber: nextRoundNumber,
        runWinnerId: runWinnerId,
        chipWinnerId: chipWinnerId,
        queenWinnerId: queenWinnerId,
        notes,
      });

      if (editingRound) {
        router.push({ pathname: '/game/[id]/history', params: { id } });
        return;
      }

      const updatedRoundCount = useAppStore.getState().activeGameRounds.length;
      navigateToRound(null, updatedRoundCount + 1);
    } finally {
      setSaving(false);
    }
  };

  const goToPreviousRound = () => {
    const previousRound = activeGameRounds.find(
      (round) => round.roundNumber === nextRoundNumber - 1,
    );

    if (previousRound) {
      navigateToRound(previousRound, previousRound.roundNumber);
    }
  };

  const canGoPrevious = nextRoundNumber > 1;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.white} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.topTitle}>
            Round {nextRoundNumber}
            {editingRound ? ' (editing)' : ''}
          </Text>
          <Text style={styles.topSubtitle}>{activeGame.name}</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Base stake: {formatStake(activeGame.stakePerPotPence)} in (
          {formatStake(basePotValue)} per pot) ·{' '}
          {formatStake(playerRoundCost)} per player · {activePlayerIds.length}{' '}
          playing
        </Text>
        {(currentPotValues.run > basePotValue ||
          currentPotValues.chip > basePotValue ||
          currentPotValues.queen > basePotValue) && (
          <Text style={styles.bannerSubtext}>
            Carryover active — pot values below include rolled-over amounts
          </Text>
        )}
        <Text style={styles.bannerSubtext}>
          Starting balance: {formatMoney(activeGame.startingBalancePence ?? 600)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PotTotalsPanel totals={currentTotals} roundCost={playerRoundCost} />

        <PotSelector
          title="Run Pot"
          potValuePence={currentPotValues.run}
          basePotValuePence={basePotValue}
          players={activeGamePlayers}
          selectedId={runWinnerId}
          disabledPlayerIds={disabledPlayerIds}
          onSelect={setRunWinnerId}
        />
        <PotSelector
          title="Chip Pot"
          potValuePence={currentPotValues.chip}
          basePotValuePence={basePotValue}
          players={activeGamePlayers}
          selectedId={chipWinnerId}
          disabledPlayerIds={disabledPlayerIds}
          onSelect={setChipWinnerId}
        />
        <PotSelector
          title="Queen Pot"
          potValuePence={currentPotValues.queen}
          basePotValuePence={basePotValue}
          players={activeGamePlayers}
          selectedId={queenWinnerId}
          disabledPlayerIds={disabledPlayerIds}
          onSelect={setQueenWinnerId}
        />

        <Text style={styles.notesLabel}>Notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Any notes for this round..."
          placeholderTextColor={theme.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <View style={styles.navRow}>
          {canGoPrevious ? (
            <PrimaryButton
              title="Previous Round"
              variant="outline"
              onPress={goToPreviousRound}
              style={styles.navBtn}
            />
          ) : null}
          <PrimaryButton
            title={editingRound ? 'Update Round' : 'Save Round'}
            onPress={handleSave}
            loading={saving}
            style={styles.navBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.emerald,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.white,
  },
  topSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  banner: {
    backgroundColor: theme.mint,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#C6E8CC',
    gap: 4,
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.emeraldDark,
    textAlign: 'center',
  },
  bannerSubtext: {
    fontSize: 12,
    color: theme.emerald,
    textAlign: 'center',
    fontWeight: '500',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.emerald,
    marginBottom: 8,
    marginTop: 4,
  },
  notesInput: {
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    fontSize: 15,
    color: theme.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  navRow: {
    gap: 10,
  },
  navBtn: {
    marginBottom: 0,
  },
});
