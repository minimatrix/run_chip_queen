import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { formatDate, formatStake } from '@/lib/format';
import type { GameWithMeta } from '@/lib/types';

type GameCardProps = {
  game: GameWithMeta;
  onPress: () => void;
};

export function GameCard({ game, onPress }: GameCardProps) {
  const isActive = game.status === 'active';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isActive && styles.activeCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.name, isActive && styles.activeName]}>{game.name}</Text>
        {isActive ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Active</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons
            name="people-outline"
            size={14}
            color={isActive ? 'rgba(255,255,255,0.8)' : theme.textSecondary}
          />
          <Text style={[styles.metaText, isActive && styles.activeMetaText]}>
            {game.playerCount} players
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons
            name="cash-outline"
            size={14}
            color={isActive ? 'rgba(255,255,255,0.8)' : theme.textSecondary}
          />
          <Text style={[styles.metaText, isActive && styles.activeMetaText]}>
            {formatStake(game.stakePerPotPence)} in
          </Text>
        </View>
      </View>
      <Text style={[styles.date, isActive && styles.activeDate]}>
        {isActive
          ? `Started ${formatDate(game.createdAt)}`
          : `Ended ${formatDate(game.finishedAt ?? game.createdAt)}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  activeCard: {
    backgroundColor: theme.emerald,
    borderColor: theme.emeraldDark,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    flex: 1,
  },
  activeName: {
    color: theme.white,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: theme.white,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  activeMetaText: {
    color: 'rgba(255,255,255,0.85)',
  },
  date: {
    fontSize: 12,
    color: theme.textMuted,
  },
  activeDate: {
    color: 'rgba(255,255,255,0.7)',
  },
});
