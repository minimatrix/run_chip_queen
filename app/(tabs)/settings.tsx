import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/AppHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

export default function SettingsScreen() {
  const { settings, updateSettings, clearAllData } = useAppStore();

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all games, players, and rounds. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllData(),
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Settings" subtitle="Preferences and app info." />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Currency</Text>
            <Text style={styles.value}>{settings.currency}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Stake increment</Text>
            <View style={styles.stepperRow}>
              <PrimaryButton
                title="−"
                variant="outline"
                onPress={() =>
                  updateSettings({
                    stakeIncrement: Math.max(5, settings.stakeIncrement - 5),
                  })
                }
                style={styles.stepBtn}
              />
              <Text style={styles.stepValue}>{settings.stakeIncrement}p</Text>
              <PrimaryButton
                title="+"
                variant="outline"
                onPress={() =>
                  updateSettings({
                    stakeIncrement: settings.stakeIncrement + 5,
                  })
                }
                style={styles.stepBtn}
              />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Default starting balance</Text>
            <View style={styles.stepperRow}>
              <PrimaryButton
                title="−"
                variant="outline"
                onPress={() =>
                  updateSettings({
                    defaultStartingBalancePence: Math.max(
                      50,
                      settings.defaultStartingBalancePence -
                        settings.startingBalanceIncrement,
                    ),
                  })
                }
                style={styles.stepBtn}
              />
              <Text style={styles.stepValue}>
                {formatMoney(settings.defaultStartingBalancePence)}
              </Text>
              <PrimaryButton
                title="+"
                variant="outline"
                onPress={() =>
                  updateSettings({
                    defaultStartingBalancePence:
                      settings.defaultStartingBalancePence +
                      settings.startingBalanceIncrement,
                  })
                }
                style={styles.stepBtn}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <PrimaryButton
            title="Clear All Data"
            variant="secondary"
            onPress={handleClearAll}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Run, Chip, Queen v1.0.0{'\n\n'}
            Track your card game pots offline. Each player puts in a fixed stake
            per pot each round — Run, Chip, and Queen. Totals are calculated
            automatically from round history.
          </Text>
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
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.emerald,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: theme.text,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBtn: {
    minWidth: 44,
  },
  stepValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.emerald,
    minWidth: 40,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
});
