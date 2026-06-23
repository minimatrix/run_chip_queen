import { StyleSheet, Text, View } from 'react-native';
import { Hand, RefreshCw, Wallet } from 'lucide-react-native';
import { theme, fonts } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

const DEMO_PLAYERS = [
  { id: '1', name: 'Alex', color: '#E53935' },
  { id: '2', name: 'Sam', color: '#1E88E5' },
  { id: '3', name: 'Jo', color: '#43A047' },
  { id: '4', name: 'Pat', color: '#FB8C00' },
];

export function PotsVisual() {
  return (
    <View style={styles.potsRow}>
      {(['RUN', 'CHIP', 'QUEEN'] as const).map((label) => (
        <View key={label} style={styles.potPill}>
          <Text style={styles.potPillText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

export function StakeMathVisual() {
  const players = 4;
  const stake = 20;
  const perPot = stake * players;
  const perRound = perPot * 3;

  return (
    <GlassPanel style={styles.mathPanel}>
      <MathRow label="Players in round" value={`${players}`} />
      <MathRow label="Stake per pot" value={formatStake(stake)} />
      <View style={styles.mathDivider} />
      <MathRow
        label="Each pot holds"
        value={`${players} × ${formatStake(stake)} = ${formatStake(perPot)}`}
        highlight
      />
      <Text style={styles.mathArrow}>↓</Text>
      <MathRow
        label="Each player pays per round"
        value={`${formatStake(perPot)} × 3 pots = ${formatMoney(perRound)}`}
        highlight
      />
    </GlassPanel>
  );
}

export function PlayerOrderVisual() {
  return (
    <View style={styles.orderList}>
      {DEMO_PLAYERS.map((player, index) => (
        <View key={player.id} style={styles.orderRow}>
          <View style={styles.orderBadge}>
            <Text style={styles.orderNumber}>{index + 1}</Text>
          </View>
          <PokerChip player={player} showName={false} size="small" inline />
          <Text style={styles.orderName}>{player.name}</Text>
          {index === 0 ? (
            <Text style={styles.orderHint}>deals round 1</Text>
          ) : null}
        </View>
      ))}
      <Text style={styles.orderFootnote}>
        Order rotates each round for Two Hands
      </Text>
    </View>
  );
}

export function TwoHandsVisual() {
  return (
    <GlassPanel variant="gold" style={styles.twoHandsPanel}>
      <View style={styles.twoHandsRow}>
        <PokerChip player={DEMO_PLAYERS[1]} showName={false} size="small" />
        <Hand size={22} color={theme.gold} />
        <Text style={styles.twoHandsText}>Sam&apos;s Two Hands</Text>
      </View>
      <View style={styles.rotationRow}>
        <RefreshCw size={14} color={theme.goldDark} />
        <Text style={styles.rotationText}>
          Round 1 → Alex · Round 2 → Sam · Round 3 → Jo …
        </Text>
      </View>
    </GlassPanel>
  );
}

export function CarryoverVisual() {
  return (
    <View style={styles.carryoverWrap}>
      <View style={styles.carryoverRound}>
        <Text style={styles.carryoverRoundLabel}>Round 3</Text>
        <View style={styles.carryoverPot}>
          <Text style={styles.carryoverPotTitle}>RUN</Text>
          <Text style={styles.carryoverPotValue}>80p</Text>
          <Text style={styles.carryoverNote}>no winner</Text>
        </View>
      </View>
      <Text style={styles.carryoverArrow}>↓ rolls into</Text>
      <View style={styles.carryoverRound}>
        <Text style={styles.carryoverRoundLabel}>Round 4</Text>
        <View style={[styles.carryoverPot, styles.carryoverPotActive]}>
          <Text style={styles.carryoverPotTitle}>RUN</Text>
          <Text style={styles.carryoverPotValueActive}>160p</Text>
          <Text style={styles.carryoverNoteActive}>inc. carryover</Text>
        </View>
      </View>
    </View>
  );
}

export function BuyInVisual() {
  return (
    <GlassPanel style={styles.buyInPanel}>
      <View style={styles.buyInRow}>
        <Wallet size={20} color={theme.primary} />
        <View style={styles.buyInCopy}>
          <Text style={styles.buyInTitle}>Can&apos;t afford the round?</Text>
          <Text style={styles.buyInBody}>
            Top up from the prompt, or tap a player on the Totals tab.
          </Text>
        </View>
      </View>
      <View style={styles.buyInExample}>
        <Text style={styles.buyInExampleLabel}>Example top-up</Text>
        <Text style={styles.buyInExampleValue}>+ £2.00 → back in the round</Text>
      </View>
    </GlassPanel>
  );
}

function MathRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.mathRow}>
      <Text style={styles.mathLabel}>{label}</Text>
      <Text style={[styles.mathValue, highlight && styles.mathValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  potsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  potPill: {
    backgroundColor: 'rgba(8, 65, 45, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.35)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 72,
    alignItems: 'center',
  },
  potPillText: {
    fontFamily: fonts.serifBold,
    fontSize: 14,
    color: theme.primary,
    letterSpacing: 1.5,
  },
  mathPanel: {
    padding: 14,
    gap: 8,
  },
  mathRow: {
    gap: 4,
  },
  mathLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mathValue: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.text,
  },
  mathValueHighlight: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: theme.primary,
  },
  mathDivider: {
    height: 1,
    backgroundColor: 'rgba(217, 183, 93, 0.2)',
    marginVertical: 4,
  },
  mathArrow: {
    textAlign: 'center',
    color: theme.gold,
    fontSize: 16,
  },
  orderList: {
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(8, 65, 45, 0.05)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  orderBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderNumber: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.ivory,
  },
  orderName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.text,
  },
  orderHint: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orderFootnote: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  twoHandsPanel: {
    padding: 14,
    gap: 10,
  },
  twoHandsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  twoHandsText: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: theme.gold,
  },
  rotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rotationText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
  },
  carryoverWrap: {
    alignItems: 'center',
    gap: 6,
  },
  carryoverRound: {
    alignItems: 'center',
    gap: 6,
  },
  carryoverRoundLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  carryoverPot: {
    backgroundColor: 'rgba(8, 65, 45, 0.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  carryoverPotActive: {
    backgroundColor: theme.ivory,
    borderColor: theme.gold,
  },
  carryoverPotTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 13,
    color: theme.primary,
    letterSpacing: 1,
  },
  carryoverPotValue: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: theme.primary,
    marginTop: 2,
  },
  carryoverPotValueActive: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: theme.primary,
    marginTop: 2,
  },
  carryoverNote: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.textSecondary,
    marginTop: 2,
  },
  carryoverNoteActive: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: theme.goldDark,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  carryoverArrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.gold,
  },
  buyInPanel: {
    padding: 14,
    gap: 12,
  },
  buyInRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  buyInCopy: {
    flex: 1,
    gap: 4,
  },
  buyInTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: theme.text,
  },
  buyInBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: theme.textSecondary,
    lineHeight: 19,
  },
  buyInExample: {
    backgroundColor: 'rgba(217, 183, 93, 0.12)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  buyInExampleLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buyInExampleValue: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: theme.primary,
    marginTop: 2,
  },
});
