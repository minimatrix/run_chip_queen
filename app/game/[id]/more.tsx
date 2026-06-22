import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
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
    <View style={styles.container}>
      <AppHeader title="More" subtitle={activeGame.name} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Info</Text>
          <InfoRow label="Name" value={activeGame.name} />
          <InfoRow
            label="Stake"
            value={`${activeGame.stakePerPotPence}p per pot`}
          />
          <InfoRow label="Status" value={activeGame.status} />
        </View>

        <PrimaryButton
          title="End Game & Settle Up"
          onPress={handleEndGame}
          disabled={activeGame.status === 'finished'}
        />

        <PrimaryButton
          title="Back to Games"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
          style={styles.btn}
        />
      </ScrollView>
    </View>
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.emerald,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  label: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  btn: {
    marginTop: 12,
  },
});
