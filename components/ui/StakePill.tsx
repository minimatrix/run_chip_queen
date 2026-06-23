import { StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { AnimatedPressable } from './AnimatedPressable';

type StakePillProps = {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  format?: 'stake' | 'money';
  min?: number;
};

export function StakePill({
  value,
  onDecrement,
  onIncrement,
  format = 'stake',
  min = 0,
}: StakePillProps) {
  const display = format === 'money' ? formatMoney(value) : formatStake(value);

  return (
    <View style={styles.pill}>
      <AnimatedPressable
        onPress={onDecrement}
        disabled={value <= min}
        style={[styles.btn, value <= min && styles.btnDisabled]}
        scaleTo={0.9}
      >
        <Minus size={22} color={theme.gold} strokeWidth={2.5} />
      </AnimatedPressable>
      <Text style={styles.value}>{display}</Text>
      <AnimatedPressable onPress={onIncrement} style={styles.btn} scaleTo={0.9}>
        <Plus size={22} color={theme.gold} strokeWidth={2.5} />
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(3, 40, 27, 0.6)',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: theme.gold,
    paddingVertical: 8,
    paddingHorizontal: 12,
    ...theme.shadowGold,
  },
  btn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(217, 183, 93, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  value: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
    color: theme.ivory,
    minWidth: 100,
    textAlign: 'center',
  },
});
