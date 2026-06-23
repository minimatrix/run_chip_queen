import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Users, Coins, Trophy } from 'lucide-react-native';
import { theme, fonts } from '@/constants/theme';
import { formatDate, formatStake } from '@/lib/format';
import type { GameWithMeta } from '@/lib/types';
import { AnimatedPressable } from './AnimatedPressable';

type GameCardProps = {
  game: GameWithMeta;
  onPress: () => void;
  index?: number;
  isHero?: boolean;
  roundsPlayed?: number;
  leaderName?: string;
};

export function GameCard({
  game,
  onPress,
  index = 0,
  isHero = false,
  roundsPlayed,
  leaderName,
}: GameCardProps) {
  const isActive = game.status === 'active';

  if (isHero && isActive) {
    return (
      <Animated.View entering={FadeInDown.springify()}>
        <AnimatedPressable onPress={onPress} style={styles.heroWrapper} scaleTo={0.98}>
          <LinearGradient
            colors={[theme.primary, theme.dark, '#021A12']}
            style={styles.heroCard}
          >
            <View style={styles.heroGlow} />
            <Text style={styles.heroSuit}>♠</Text>
            <Text style={styles.heroName}>{game.name}</Text>
            <View style={styles.heroStats}>
              <HeroStat
                icon={<Users size={14} color={theme.gold} />}
                label={`${game.playerCount} Players`}
              />
              <HeroStat
                icon={<Coins size={14} color={theme.gold} />}
                label={`${formatStake(game.stakePerPotPence)} In`}
              />
              {roundsPlayed !== undefined ? (
                <HeroStat
                  icon={<Trophy size={14} color={theme.gold} />}
                  label={`${roundsPlayed} Rounds`}
                />
              ) : null}
            </View>
            {leaderName ? (
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderLabel}>Current Leader</Text>
                <Text style={styles.leaderName}>{leaderName}</Text>
              </View>
            ) : null}
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>● At the table</Text>
            </View>
          </LinearGradient>
        </AnimatedPressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <AnimatedPressable onPress={onPress} style={styles.pastWrapper} scaleTo={0.98}>
        <View style={styles.pastCard}>
          <Text style={styles.pastName}>{game.name}</Text>
          <Text style={styles.pastMeta}>
            {game.playerCount} players · {formatStake(game.stakePerPotPence)} in
          </Text>
          <Text style={styles.pastDate}>
            {isActive
              ? `Started ${formatDate(game.createdAt)}`
              : `Ended ${formatDate(game.finishedAt ?? game.createdAt)}`}
          </Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function HeroStat({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <View style={styles.heroStat}>
      {icon}
      <Text style={styles.heroStatText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: {
    marginBottom: 24,
    ...theme.shadow,
  },
  heroCard: {
    borderRadius: theme.cardRadiusLg,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.4)',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(217, 183, 93, 0.15)',
  },
  heroSuit: {
    fontSize: 32,
    color: theme.gold,
    marginBottom: 8,
  },
  heroName: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: theme.ivory,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  heroStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.muted,
  },
  leaderBadge: {
    backgroundColor: 'rgba(217, 183, 93, 0.15)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.gold,
    marginBottom: 12,
  },
  leaderLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: theme.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leaderName: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: theme.ivory,
    marginTop: 4,
  },
  liveBadge: {
    alignSelf: 'flex-start',
  },
  liveText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.success,
  },
  pastWrapper: {
    marginBottom: 10,
  },
  pastCard: {
    backgroundColor: theme.ivory,
    borderRadius: theme.cardRadius,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.3)',
    ...theme.shadowSoft,
  },
  pastName: {
    fontFamily: fonts.serif,
    fontSize: 17,
    color: theme.text,
    marginBottom: 4,
  },
  pastMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.textSecondary,
  },
  pastDate: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: theme.muted,
    marginTop: 6,
  },
});
