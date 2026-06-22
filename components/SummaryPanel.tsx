import { StyleSheet, Text, View } from 'react-native';
import { theme } from '@/constants/theme';
import { formatMoney } from '@/lib/format';

type SummaryPanelProps = {
  totalInPerRound: number;
  roundsPlayed: number;
  totalGameValue: number;
};

export function SummaryPanel({
  totalInPerRound,
  roundsPlayed,
  totalGameValue,
}: SummaryPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Total in per round</Text>
        <Text style={styles.value}>{formatMoney(totalInPerRound)}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Rounds played</Text>
        <Text style={styles.value}>{roundsPlayed}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Total game value</Text>
        <Text style={[styles.value, styles.highlight]}>
          {formatMoney(totalGameValue)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.mint,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#C6E8CC',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: theme.emerald,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.emeraldDark,
  },
  highlight: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#C6E8CC',
  },
});
