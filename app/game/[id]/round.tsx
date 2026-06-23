import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, List } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { BuyInModal } from '@/components/ui/BuyInModal';
import { LeaderboardPanel } from '@/components/ui/LeaderboardPanel';
import { PotCard } from '@/components/ui/PotCard';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { RoundHeroCard } from '@/components/ui/RoundHeroCard';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { TwoHandsBanner } from '@/components/ui/TwoHandsBanner';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { theme, fonts } from '@/constants/theme';
import {
  calculatePlayerTotalsForRoundEntry,
  getActivePlayerIdsForRound,
  getCurrentPotValues,
  getPlayerBalanceBeforeRound,
  getPlayerRoundCostPence,
  getPlayersNeedingBuyInPrompt,
  getPotValuePence,
  getRoundsForDisplay,
  getTwoHandsPlayerForRound,
} from '@/lib/calculations';
import { formatMoney, formatStake } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import type { Player, Round } from '@/lib/types';

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
    activeGameBuyIns,
    activeGameBuyInPromptedAtRound,
    settings,
    saveRound,
    recordPlayerBuyIn,
    markBuyInPrompted,
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
  const [buyInPlayer, setBuyInPlayer] = useState<Player | null>(null);
  const [buyInBalancePence, setBuyInBalancePence] = useState(0);

  const flipRotation = useSharedValue(0);

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

  const flipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - Math.abs(flipRotation.value) * 0.04 }],
    opacity: 1 - Math.abs(flipRotation.value) * 0.15,
  }));

  const roundState = useMemo(() => {
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
      activeGameBuyIns,
    );
    const basePotValue = getPotValuePence(activeGame, activePlayerIds.length);
    const currentPotValues = getCurrentPotValues(
      activeGame,
      activeGamePlayers,
      priorRounds,
      activeGameBuyIns,
    );
    const currentTotals = calculatePlayerTotalsForRoundEntry(
      activeGame,
      priorRounds,
      activeGamePlayers,
      nextRoundNumber,
      activeGameBuyIns,
    );
    const twoHandsPlayer = getTwoHandsPlayerForRound(
      activeGame,
      activeGamePlayers,
      priorRounds,
      nextRoundNumber,
      activeGameBuyIns,
    );
    const disabledPlayerIds = new Set(
      currentTotals
        .filter((row) => row.inCurrentRound === false)
        .map((row) => row.playerId),
    );
    const sortedTotals = [...currentTotals].sort((a, b) => b.total - a.total);
    const hasCarryover =
      currentPotValues.run > basePotValue ||
      currentPotValues.chip > basePotValue ||
      currentPotValues.queen > basePotValue;

    return {
      playerRoundCost,
      priorRounds,
      activePlayerIds,
      basePotValue,
      currentPotValues,
      currentTotals,
      twoHandsPlayer,
      disabledPlayerIds,
      sortedTotals,
      hasCarryover,
    };
  }, [
    activeGame,
    activeGamePlayers,
    activeGameRounds,
    activeGameBuyIns,
    editingRound?.id,
    nextRoundNumber,
  ]);

  useEffect(() => {
    if (!activeGame || editingRound || buyInPlayer) return;

    const priorRounds = getRoundsForDisplay(activeGameRounds, {
      upToRoundNumber: nextRoundNumber,
    });
    const playersNeedingBuyIn = getPlayersNeedingBuyInPrompt(
      activeGame,
      priorRounds,
      activeGamePlayers,
      activeGameBuyIns,
      nextRoundNumber,
      activeGameBuyInPromptedAtRound,
    );

    if (playersNeedingBuyIn.length === 0) return;

    const player = playersNeedingBuyIn[0];
    const balance = getPlayerBalanceBeforeRound(
      activeGame,
      priorRounds,
      activeGamePlayers,
      player.id,
      activeGameBuyIns,
    );

    setBuyInBalancePence(balance);
    setBuyInPlayer(player);
    void markBuyInPrompted(player.id, nextRoundNumber);
  }, [
    activeGame,
    activeGameBuyIns,
    activeGameBuyInPromptedAtRound,
    activeGamePlayers,
    activeGameRounds,
    buyInPlayer,
    editingRound,
    markBuyInPrompted,
    nextRoundNumber,
  ]);

  if (!activeGame || !roundState) return null;

  const {
    playerRoundCost,
    basePotValue,
    currentPotValues,
    twoHandsPlayer,
    disabledPlayerIds,
    sortedTotals,
    hasCarryover,
  } = roundState;

  const navigateToRound = (round: Round | null, roundNumber: number) => {
    router.setParams({
      roundId: round?.id,
      roundNumber: String(roundNumber),
    });
    loadRoundIntoForm(round);
  };

  const handleSave = async () => {
    flipRotation.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(0, { duration: 120 }),
    );
    setSaving(true);
    try {
      await saveRound({
        id: editingRound?.id,
        gameId: activeGame.id,
        roundNumber: nextRoundNumber,
        runWinnerId,
        chipWinnerId,
        queenWinnerId,
        notes,
      });

      if (editingRound) {
        router.navigate({ pathname: '/game/[id]/history', params: { id } });
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

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <AnimatedPressable onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={26} color={theme.gold} />
          </AnimatedPressable>
          <Text style={styles.gameName}>{activeGame.name}</Text>
          <AnimatedPressable
            onPress={() =>
              router.navigate({ pathname: '/game/[id]/history', params: { id } })
            }
            style={styles.backBtn}
            accessibilityLabel="Round history"
          >
            <List size={22} color={theme.gold} />
          </AnimatedPressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={flipStyle}>
            <RoundHeroCard
              roundNumber={nextRoundNumber}
              stakePence={activeGame.stakePerPotPence}
              potValuePence={basePotValue}
              editing={!!editingRound}
            />

            {hasCarryover ? (
              <View style={styles.carryoverBanner}>
                <Text style={styles.carryoverText}>
                  ♦ Carryover active — pots include rolled-over amounts
                </Text>
              </View>
            ) : null}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                {formatStake(playerRoundCost)} per player ·{' '}
                {roundState.activePlayerIds.length} playing ·{' '}
                {formatMoney(activeGame.startingBalancePence ?? 600)} start
              </Text>
            </View>

            <TwoHandsBanner player={twoHandsPlayer} />

            <LeaderboardPanel
              totals={sortedTotals}
              showRemaining
              compact
              showStartingFunds
              showBuyInTotal
              useInCurrentRoundForOut
            />

            <PotCard
              type="run"
              players={activeGamePlayers}
              potValuePence={currentPotValues.run}
              basePotValuePence={basePotValue}
              selectedId={runWinnerId}
              disabledPlayerIds={disabledPlayerIds}
              onSelect={setRunWinnerId}
            />
            <PotCard
              type="chip"
              players={activeGamePlayers}
              potValuePence={currentPotValues.chip}
              basePotValuePence={basePotValue}
              selectedId={chipWinnerId}
              disabledPlayerIds={disabledPlayerIds}
              onSelect={setChipWinnerId}
            />
            <PotCard
              type="queen"
              players={activeGamePlayers}
              potValuePence={currentPotValues.queen}
              basePotValuePence={basePotValue}
              selectedId={queenWinnerId}
              disabledPlayerIds={disabledPlayerIds}
              onSelect={setQueenWinnerId}
            />

            <Text style={styles.notesLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any notes for this round..."
              placeholderTextColor={theme.muted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </Animated.View>

          <View style={styles.navRow}>
            {nextRoundNumber > 1 ? (
              <SecondaryGreenButton
                title="Previous Round"
                onPress={goToPreviousRound}
                style={styles.navBtn}
              />
            ) : null}
            <PrimaryGoldButton
              title={editingRound ? 'Update Round' : 'Save Round'}
              onPress={handleSave}
              loading={saving}
              style={styles.navBtn}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <BuyInModal
        visible={buyInPlayer !== null}
        player={buyInPlayer}
        roundNumber={nextRoundNumber}
        currentBalancePence={buyInBalancePence}
        roundCostPence={playerRoundCost}
        incrementPence={settings.startingBalanceIncrement}
        onConfirm={async (amountPence) => {
          if (!buyInPlayer) return;
          await recordPlayerBuyIn(buyInPlayer.id, nextRoundNumber, amountPence);
          setBuyInPlayer(null);
        }}
        onStayOut={() => setBuyInPlayer(null)}
      />
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameName: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.muted,
    textAlign: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  carryoverBanner: {
    backgroundColor: 'rgba(217, 183, 93, 0.15)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.gold,
  },
  carryoverText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.gold,
    textAlign: 'center',
  },
  metaRow: {
    marginBottom: 12,
  },
  metaText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.muted,
    textAlign: 'center',
  },
  notesLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  notesInput: {
    backgroundColor: 'rgba(247, 244, 236, 0.95)',
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.35)',
    padding: 14,
    fontFamily: fonts.sans,
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
