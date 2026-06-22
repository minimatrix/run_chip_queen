import { useEffect } from 'react';
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
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TotalsTable } from '@/components/TotalsTable';
import { theme } from '@/constants/theme';
import { calculatePlayerTotals } from '@/lib/calculations';
import { buildSettleUpSummary, formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function SettleUpScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, activeGamePlayers, activeGameRounds, loadGame } =
    useAppStore();

  useEffect(() => {
    if (id) loadGame(id);
  }, [id, loadGame]);

  if (!activeGame || activeGame.id !== id) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.emerald} />
      </View>
    );
  }

  const totals = calculatePlayerTotals(
    activeGame,
    activeGameRounds,
    activeGamePlayers,
  );

  const handleShare = async () => {
    const summary = [
      `Run, Chip, Queen — ${activeGame.name}`,
      '',
      'Final Totals:',
      ...totals.map(
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
    <View style={styles.container}>
      <AppHeader
        title="Game Complete!"
        subtitle="Settle up"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <TotalsTable totals={totals} showNet showRemaining />

        <View style={styles.settleSection}>
          <Text style={styles.settleTitle}>Funds remaining</Text>
          {totals.map((t) => (
            <View key={`remaining-${t.playerId}`} style={styles.settleRow}>
              <Text style={styles.settleName}>{t.name}</Text>
              <Text
                style={[
                  styles.settleAmount,
                  t.remaining <= 0 && styles.negative,
                  t.canPlay && styles.positive,
                ]}
              >
                {t.remaining <= 0
                  ? 'out of funds'
                  : formatMoney(t.remaining)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.settleSection}>
          <Text style={styles.settleTitle}>What does everyone owe?</Text>
          {totals.map((t) => (
            <View key={`net-${t.playerId}`} style={styles.settleRow}>
              <Text style={styles.settleName}>{t.name}</Text>
              <Text
                style={[
                  styles.settleAmount,
                  t.net > 0 && styles.positive,
                  t.net < 0 && styles.negative,
                ]}
              >
                {t.net > 0
                  ? `is owed ${formatMoney(t.net)}`
                  : t.net < 0
                    ? `owes ${formatMoney(Math.abs(t.net))}`
                    : 'is even'}
              </Text>
            </View>
          ))}
        </View>

        <PrimaryButton title="New Game" onPress={() => router.replace('/game/new')} />
        <PrimaryButton
          title="Share Summary"
          variant="outline"
          onPress={handleShare}
          style={styles.btn}
        />
        <PrimaryButton
          title="Back to Games"
          variant="secondary"
          onPress={() => router.replace('/(tabs)')}
          style={styles.btn}
        />
        <SafeAreaView edges={['bottom']} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  settleSection: {
    backgroundColor: theme.mint,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#C6E8CC',
  },
  settleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.emeraldDark,
    marginBottom: 12,
  },
  settleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#C6E8CC',
  },
  settleName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
  },
  settleAmount: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  positive: {
    color: theme.success,
    fontWeight: '700',
  },
  negative: {
    color: theme.danger,
    fontWeight: '700',
  },
  btn: {
    marginTop: 12,
  },
});
