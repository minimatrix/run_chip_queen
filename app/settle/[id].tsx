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
import { FinalStandingsPanel } from '@/components/ui/FinalStandingsPanel';
import { GameRoundHistoryList } from '@/components/ui/GameRoundHistoryList';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { theme, fonts } from '@/constants/theme';
import { calculatePlayerTotals } from '@/lib/calculations';
import { buildSettleUpSummary, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function SettleUpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activeGame,
    activeGamePlayers,
    activeGameRounds,
    activeGameBuyIns,
    loadGame,
  } = useAppStore();
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
    activeGameBuyIns,
    { includeGameStartingFunds: true },
  );

  const handleShare = async () => {
    const sorted = [...totals].sort((a, b) => b.remaining - a.remaining);
    const summary = [
      `Run, Chip, Queen — ${activeGame.name}`,
      '',
      'Final Standings:',
      ...sorted.map((t) => {
        const topUp =
          (t.buyInTotal ?? 0) > 0
            ? ` | Top-up ${formatMoney(t.buyInTotal ?? 0)}`
            : '';
        return `${t.name}: Run ${formatMoney(t.run)} | Chip ${formatMoney(t.chip)} | Queen ${formatMoney(t.queen)}${topUp} | Finished ${formatMoney(t.remaining)}`;
      }),
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
          <FinalStandingsPanel totals={totals} />

          <Text style={styles.sectionTitle}>Round History</Text>
          <GameRoundHistoryList
            game={activeGame}
            players={activeGamePlayers}
            rounds={activeGameRounds}
            buyIns={activeGameBuyIns}
            allowDelete={false}
            embedded
          />

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
  btn: {
    marginTop: 12,
  },
});
