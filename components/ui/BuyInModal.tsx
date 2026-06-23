import { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PokerChip } from '@/components/ui/PokerChip';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { StakePill } from '@/components/ui/StakePill';
import { theme, fonts } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import type { Player } from '@/lib/types';

type BuyInModalProps = {
  visible: boolean;
  player: Player | null;
  roundNumber: number;
  currentBalancePence: number;
  roundCostPence: number;
  incrementPence: number;
  variant?: 'prompt' | 'manual';
  onConfirm: (amountPence: number) => void;
  onStayOut: () => void;
};

export function BuyInModal({
  visible,
  player,
  roundNumber,
  currentBalancePence,
  roundCostPence,
  incrementPence,
  variant = 'prompt',
  onConfirm,
  onStayOut,
}: BuyInModalProps) {
  const isManual = variant === 'manual';
  const shortfall = Math.max(0, roundCostPence - currentBalancePence);
  const minAmount = isManual ? incrementPence : Math.max(incrementPence, shortfall);
  const defaultAmount = isManual
    ? incrementPence
    : Math.max(incrementPence, shortfall);
  const [amount, setAmount] = useState(defaultAmount);

  useEffect(() => {
    if (visible) {
      setAmount(defaultAmount);
    }
  }, [visible, defaultAmount, player?.id]);

  if (!player) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onStayOut}
    >
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safe}>
          <GlassPanel style={styles.card}>
            <Text style={styles.kicker}>Round {roundNumber}</Text>
            <Text style={styles.title}>
              {isManual ? 'Add funds' : 'Buy back in'}
            </Text>
            <Text style={styles.subtitle}>
              {isManual
                ? `Top up ${player.name}'s balance for the next round.`
                : `${player.name} is out of funds for this round.`}
            </Text>

            <View style={styles.playerRow}>
              <PokerChip player={player} showName={false} size="small" />
              <Text style={styles.playerName}>{player.name}</Text>
            </View>

            <View style={styles.summary}>
              <SummaryRow
                label="Current balance"
                value={formatMoney(currentBalancePence)}
              />
              <SummaryRow label="Round cost" value={formatStake(roundCostPence)} />
              {!isManual ? (
                <SummaryRow
                  label="Minimum top-up"
                  value={formatMoney(shortfall)}
                  highlight
                />
              ) : null}
            </View>

            <Text style={styles.label}>Top-up amount</Text>
            <StakePill
              value={amount}
              format="money"
              onDecrement={() =>
                setAmount(Math.max(minAmount, amount - incrementPence))
              }
              onIncrement={() => setAmount(amount + incrementPence)}
              min={minAmount}
            />

            <PrimaryGoldButton
              title={`Add ${formatMoney(amount)}`}
              onPress={() => onConfirm(amount)}
              style={styles.btn}
            />
            <SecondaryGreenButton
              title={isManual ? 'Cancel' : 'Stay Out This Round'}
              onPress={onStayOut}
              style={styles.btn}
            />
          </GlassPanel>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && styles.summaryHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 42, 28, 0.72)',
    justifyContent: 'center',
    padding: 20,
  },
  safe: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 22,
  },
  kicker: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: theme.text,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 18,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  playerName: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: theme.text,
  },
  summary: {
    backgroundColor: 'rgba(8, 65, 45, 0.06)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: theme.text,
  },
  summaryHighlight: {
    color: theme.primary,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  btn: {
    marginTop: 12,
  },
});
