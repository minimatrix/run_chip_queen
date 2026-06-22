import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Trophy } from 'lucide-react-native';
import { Confetti } from '@/components/ui/Confetti';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { LeaderCard } from '@/components/ui/LeaderCard';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { SettlementCard } from '@/components/ui/SettlementCard';
import { theme, fonts } from '@/constants/theme';
import {
  calculatePlayerTotals,
  computeSettlementTransfers,
} from '@/lib/calculations';
import { buildSettleUpSummary, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function SettleUpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, activeGamePlayers, activeGameRounds, loadGame } =
    useAppStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    if (id) loadGame(id);
  }, [id, loadGame]);

  useEffect(() => {
    if (activeGame?.id === id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [activeGame?.id, id]);

  if (!activeGame || activeGame.id !== id) {
    return (
      <FeltBackground>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.gold} />
        </View>
      </FeltBackground>
    );
  }

  const totals = calculatePlayerTotals(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
  );
  const sorted = [...totals].sort((a, b) => b.total - a.total);
  const transfers = computeSettlementTransfers(totals);

  const handleShare = async () => {
    const summary = [
      `Run, Chip, Queen — ${activeGame.name}`,
      '',
      'Final Totals:',
      ...sorted.map(
        (t) =>
          `${t.name}: Run ${formatMoney(t.run)} | Chip ${formatMoney(t.chip)} | Queen ${formatMoney(t.queen)} | Total ${formatMoney(t.total)}`,
      ),
      '',
      'Settle Up:',
      buildSettleUpSummary(totals),
    ].join('\n');

    await Share.share({ message: summary });
  };

  return (
    <FeltBackground>
      <Confetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.springify()} style={styles.hero}>
            <Trophy size={56} color={theme.gold} strokeWidth={1.5} />
            <Text style={styles.heroSuit}>♠</Text>
            <Text style={styles.heroTitle}>Game Complete</Text>
            <Text style={styles.heroSubtitle}>{activeGame.name}</Text>
          </Animated.View>

          <Text style={styles.sectionTitle}>Final Standings</Text>
          {sorted.map((total, index) => (
            <LeaderCard key={total.playerId} total={total} rank={index} />
          ))}

          {transfers.length > 0 ? (
            <View style={styles.settleSection}>
              <Text style={styles.sectionTitle}>Settlement</Text>
              {transfers.map((transfer, index) => (
                <SettlementCard
                  key={`${transfer.fromId}-${transfer.toId}-${index}`}
                  fromName={transfer.fromName}
                  fromColor={transfer.fromColor}
                  toName={transfer.toName}
                  toColor={transfer.toColor}
                  amountPence={transfer.amountPence}
                />
              ))}
            </View>
          ) : null}

          <PrimaryGoldButton
            title="Share Summary"
            onPress={handleShare}
            style={styles.btn}
          />
          <SecondaryGreenButton
            title="New Game"
            onPress={() => router.replace('/game/new')}
            style={styles.btn}
          />
          <SecondaryGreenButton
            title="Back to Games"
            variant="filled"
            onPress={() => router.replace('/(tabs)')}
            style={styles.btn}
          />
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 28,
    paddingTop: 12,
  },
  heroSuit: {
    fontSize: 24,
    color: theme.gold,
    marginTop: 12,
  },
  heroTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
    color: theme.ivory,
    marginTop: 8,
  },
  heroSubtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: theme.muted,
    marginTop: 6,
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 8,
  },
  settleSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  btn: {
    marginTop: 12,
  },
});
