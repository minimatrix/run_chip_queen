import { StyleSheet, Text, TextStyle } from 'react-native';
import { formatMoney, formatStake } from '@/lib/format';
import { theme } from '@/constants/theme';

type MoneyTextProps = {
  pence: number;
  style?: TextStyle;
  useStakeFormat?: boolean;
  prefix?: string;
};

export function MoneyText({
  pence,
  style,
  useStakeFormat = false,
  prefix,
}: MoneyTextProps) {
  const formatted = useStakeFormat ? formatStake(pence) : formatMoney(pence);
  return (
    <Text style={[styles.text, style]}>
      {prefix}
      {formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    color: theme.text,
  },
});
