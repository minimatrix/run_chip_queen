import { StyleSheet, Text, View } from 'react-native';
import { Hand } from 'lucide-react-native';
import { theme, fonts } from '@/constants/theme';
import { twoHandsLabel } from '@/lib/format';
import type { Player } from '@/lib/types';
import { GlassPanel } from './GlassPanel';
import { PokerChip } from './PokerChip';

type TwoHandsBannerProps = {
  player: Player | null;
  /** Whose seat turn it is this round (may differ from player when substituting). */
  seatHolder?: Player | null;
};

export function TwoHandsBanner({ player, seatHolder }: TwoHandsBannerProps) {
  if (!player) {
    return (
      <GlassPanel style={styles.empty}>
        <Hand size={18} color={theme.muted} />
        <Text style={styles.emptyText}>No players can afford this round</Text>
      </GlassPanel>
    );
  }

  const isSubstitute =
    seatHolder !== undefined &&
    seatHolder !== null &&
    seatHolder.id !== player.id;

  return (
    <GlassPanel variant="gold" style={styles.container}>
      <PokerChip player={player} showName={false} size="small" />
      <Hand size={20} color={theme.gold} />
      <View style={styles.labelBlock}>
        <Text style={styles.label}>{twoHandsLabel(player.name)}</Text>
        {isSubstitute ? (
          <Text style={styles.subLabel}>{seatHolder.name}&apos;s turn</Text>
        ) : null}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    marginBottom: 14,
  },
  label: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: theme.gold,
  },
  labelBlock: {
    alignItems: 'center',
  },
  subLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.textSecondary,
  },
});
