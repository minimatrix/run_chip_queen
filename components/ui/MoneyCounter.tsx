import { StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { AnimatedNumber } from './AnimatedNumber';

type MoneyCounterProps = {
  pence: number;
  useStakeFormat?: boolean;
  style?: object;
};

export function MoneyCounter({
  pence,
  useStakeFormat = false,
  style,
}: MoneyCounterProps) {
  const formatter = useStakeFormat ? formatStake : formatMoney;

  return (
    <AnimatedNumber
      value={pence}
      format={formatter}
      style={[styles.money, style]}
    />
  );
}

const styles = StyleSheet.create({
  money: {
    color: theme.gold,
    fontSize: 16,
  },
});
