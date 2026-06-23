import { StyleSheet, Text, View } from 'react-native';
import { theme, fonts } from '@/constants/theme';
import { formatStake } from '@/lib/format';

type WinnerBadgeProps = {
  pot: 'Run' | 'Chip' | 'Queen';
  name: string;
  payout?: number;
};

export function WinnerBadge({ pot, name, payout }: WinnerBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{pot}</Text>
      <Text style={styles.arrow}>→</Text>
      <Text style={styles.name}>{name}</Text>
      {payout && payout > 0 ? (
        <Text style={styles.payout}>({formatStake(payout)})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrow: {
    color: theme.muted,
    fontSize: 12,
  },
  name: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.text,
  },
  payout: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: theme.textSecondary,
  },
});
