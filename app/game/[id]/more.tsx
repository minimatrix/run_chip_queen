import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { theme, fonts } from '@/constants/theme';
import { formatStake } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function MoreScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, finishGame } = useAppStore();

  if (!activeGame) return null;

  const handleEndGame = () => {
    Alert.alert(
      'End Game',
      'Mark this game as finished and go to settle up?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Game',
          onPress: async () => {
            await finishGame(activeGame.id);
            router.replace({
              pathname: '/settle/[id]',
              params: { id: activeGame.id },
            });
          },
        },
      ],
    );
  };

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="More" subtitle={activeGame.name} suit="♠" />
        <ScrollView contentContainerStyle={styles.content}>
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionTitle}>♦ Table Info</Text>
            <InfoRow label="Name" value={activeGame.name} />
            <InfoRow
              label="Stake"
              value={`${formatStake(activeGame.stakePerPotPence)} per pot`}
            />
            <InfoRow
              label="Status"
              value={activeGame.status === 'active' ? 'At the table' : 'Finished'}
            />
          </GlassPanel>

          <PrimaryGoldButton
            title="End Game & Settle Up"
            onPress={handleEndGame}
            disabled={activeGame.status === 'finished'}
          />

          <SecondaryGreenButton
            title="Back to Games"
            onPress={() => router.replace('/(tabs)')}
            style={styles.btn}
          />
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 183, 93, 0.2)',
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.textSecondary,
  },
  value: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.text,
  },
  btn: {
    marginTop: 12,
  },
});
