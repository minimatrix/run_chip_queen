import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { twoHandsLabel } from '@/lib/format';
import type { Player } from '@/lib/types';

type TwoHandsBannerProps = {
  player: Player | null;
};

export function TwoHandsBanner({ player }: TwoHandsBannerProps) {
  if (!player) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Ionicons name="hand-left-outline" size={20} color={theme.textMuted} />
        <Text style={styles.emptyText}>No players can afford this round</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: player.color }]}>
        <Ionicons name="hand-left" size={18} color={theme.white} />
      </View>
      <Text style={styles.label}>{twoHandsLabel(player.name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: theme.cardRadius,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
    ...theme.shadow,
  },
  empty: {
    backgroundColor: theme.white,
    borderColor: theme.border,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
