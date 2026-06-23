import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { fonts, theme } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
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
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Settings"
          subtitle="Preferences and app info."
          suit="♦"
        />
        <ScrollView contentContainerStyle={styles.content}>
          <GlassPanel style={styles.section}>
            <Text style={styles.sectionTitle}>Display</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>{settings.currency}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.label}>Stake increment</Text>
              <View style={styles.stepperRow}>
                <SecondaryGreenButton
                  title="−"
                  onPress={() =>
                    updateSettings({
                      stakeIncrement: Math.max(5, settings.stakeIncrement - 5),
                    })
                  }
                  style={styles.stepBtn}
                />
                <Text style={styles.stepValue}>{settings.stakeIncrement}p</Text>
                <SecondaryGreenButton
                  title="+"
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
                <SecondaryGreenButton
                  title="−"
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
                <SecondaryGreenButton
                  title="+"
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
          </GlassPanel>

          <GlassPanel style={styles.section}>
            <Text style={styles.sectionTitle}>Help</Text>
            <SecondaryGreenButton
              title="How to Play"
              onPress={() => router.push('/how-to-play')}
            />
          </GlassPanel>

          <GlassPanel style={styles.section}>
            <Text style={styles.sectionTitle}>Data</Text>
            <PrimaryGoldButton
              title="Clear All Data"
              onPress={handleClearAll}
              size="medium"
            />
          </GlassPanel>

          <GlassPanel style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              Run, Chip, Queen v1.0.0{'\n\n'}
              Your premium companion for tracking pots around the card table.
              Each player puts in a fixed stake per pot each round - Run, Chip,
              and Queen. Totals are calculated automatically from round history.
            </Text>
          </GlassPanel>
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.text,
    flex: 1,
  },
  value: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(217, 183, 93, 0.2)',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    minWidth: 44,
    paddingHorizontal: 12,
  },
  stepValue: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: theme.primary,
    minWidth: 48,
    textAlign: 'center',
  },
  aboutText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: theme.textSecondary,
    lineHeight: 22,
  },
});
