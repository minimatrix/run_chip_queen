import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuyInModal } from '@/components/ui/BuyInModal';
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
  getPlayerBalanceBeforeRound,
  getPlayerRoundCostPence,
  getTotalGameValuePence,
} from '@/lib/calculations';
import { useAppStore } from '@/store/useAppStore';
import type { Player, PlayerTotal } from '@/lib/types';
import { TabletSplit } from '@/components/ui/TabletSplit';
import { useLayout } from '@/hooks/useLayout';

export default function TotalsScreen() {
  const { isTablet, contentPadding, splitGap } = useLayout();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activeGame,
    activeGamePlayers,
    activeGameRounds,
    activeGameBuyIns,
    settings,
    recordPlayerBuyIn,
  } = useAppStore();

  const [buyInPlayer, setBuyInPlayer] = useState<Player | null>(null);

  if (!activeGame) return null;

  const nextRoundNumber = activeGameRounds.length + 1;
  const canBuyIn = activeGame.status === 'active';

  const buyInBalancePence = buyInPlayer
    ? getPlayerBalanceBeforeRound(
        activeGame,
        activeGameRounds,
        activeGamePlayers,
        buyInPlayer.id,
        activeGameBuyIns,
        nextRoundNumber,
      )
    : 0;

  const totals = calculatePlayerTotals(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
    activeGameBuyIns,
    {
      includeGameStartingFunds: true,
      applyBuyInsBeforeRound: nextRoundNumber,
    },
  );
  const sorted = [...totals].sort((a, b) => b.remaining - a.remaining);
  const roundTotal = getAverageRoundValuePence(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
    activeGameBuyIns,
  );
  const gameValue = getTotalGameValuePence(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
    activeGameBuyIns,
  );

  const handlePlayerPress = (row: PlayerTotal) => {
    if (!canBuyIn) return;
    const player = activeGamePlayers.find((p) => p.id === row.playerId);
    if (player) setBuyInPlayer(player);
  };

  const summaryPanel = (
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
  );

  const actions = (
    <>
      <PrimaryGoldButton
        title="Add Next Round"
        onPress={() =>
          router.push({
            pathname: '/game/[id]/round',
            params: {
              id,
              roundNumber: String(nextRoundNumber),
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
    </>
  );

  const leaderboard = (
    <LeaderboardPanel
      totals={sorted}
      showRemaining
      compact={!isTablet}
      showStartingFunds
      showBuyInTotal
      onPlayerPress={canBuyIn ? handlePlayerPress : undefined}
    />
  );

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Leaderboard" subtitle={activeGame.name} suit="♣" />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { padding: contentPadding, paddingBottom: 40 },
          ]}
        >
          {isTablet ? (
            <TabletSplit
              gap={splitGap}
              leftFlex={0.9}
              rightFlex={1.1}
              left={
                <>
                  {summaryPanel}
                  {canBuyIn ? (
                    <Text style={styles.hint}>Tap a player to add funds</Text>
                  ) : null}
                  {actions}
                </>
              }
              right={leaderboard}
            />
          ) : (
            <>
              {summaryPanel}
              {canBuyIn ? (
                <Text style={styles.hint}>Tap a player to add funds</Text>
              ) : null}
              {leaderboard}
              {actions}
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <BuyInModal
        variant="manual"
        visible={buyInPlayer !== null}
        player={buyInPlayer}
        roundNumber={nextRoundNumber}
        currentBalancePence={buyInBalancePence}
        roundCostPence={getPlayerRoundCostPence(activeGame)}
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
  content: {},
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
  hint: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.muted,
    textAlign: 'center',
    marginBottom: 10,
  },
  btn: {
    marginTop: 12,
  },
});
