import { StyleSheet, Text, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney } from '@/lib/format';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

type SettlementCardProps = {
  fromName: string;
  fromColor: string;
  toName: string;
  toColor: string;
  amountPence: number;
};

export function SettlementCard({
  fromName,
  fromColor,
  toName,
  toColor,
  amountPence,
}: SettlementCardProps) {
  return (
    <GlassPanel style={styles.card}>
      <View style={styles.row}>
        <PokerChip
          player={{ id: 'from', name: fromName, color: fromColor }}
          showName={false}
          size="small"
        />
        <View style={styles.names}>
          <Text style={styles.from}>{fromName}</Text>
          <View style={styles.arrowRow}>
            <Text style={styles.pays}>pays</Text>
            <ArrowRight size={14} color={theme.gold} />
          </View>
          <Text style={styles.to}>{toName}</Text>
        </View>
        <PokerChip
          player={{ id: 'to', name: toName, color: toColor }}
          showName={false}
          size="small"
        />
      </View>
      <Text style={styles.amount}>{formatMoney(amountPence)}</Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  names: {
    flex: 1,
    alignItems: 'center',
  },
  from: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.danger,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 4,
  },
  pays: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  to: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.success,
  },
  amount: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: theme.gold,
    textAlign: 'center',
    marginTop: 12,
  },
});
