import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { CardSuitPattern } from './CardSuitPattern';

type AnimatedSplashProps = {
  onFinish: () => void;
};

type SplashPlayingCardProps = {
  rank: string;
  suit: string;
  suitColor: string;
  large?: boolean;
};

function SplashPlayingCard({
  rank,
  suit,
  suitColor,
  large = false,
}: SplashPlayingCardProps) {
  return (
    <View style={[styles.playingCard, large && styles.playingCardLarge]}>
      <View style={styles.cornerTop}>
        <Text style={[styles.cornerRank, large && styles.cornerRankLarge, { color: suitColor }]}>
          {rank}
        </Text>
        <Text style={[styles.cornerSuit, { color: suitColor }]}>{suit}</Text>
      </View>
      <View style={styles.centerWrap}>
        <Text
          style={[
            styles.centerSuit,
            large && styles.centerSuitLarge,
            { color: suitColor },
          ]}
        >
          {suit}
        </Text>
      </View>
      <View style={styles.cornerBottom}>
        <Text style={[styles.cornerRank, large && styles.cornerRankLarge, { color: suitColor }]}>
          {rank}
        </Text>
        <Text style={[styles.cornerSuit, { color: suitColor }]}>{suit}</Text>
      </View>
    </View>
  );
}

export function AnimatedSplash({ onFinish }: AnimatedSplashProps) {
  const shine = useSharedValue(-1);

  useEffect(() => {
    shine.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(-1, { duration: 0 }),
      ),
      2,
      false,
    );
    const timer = setTimeout(onFinish, 2200);
    return () => clearTimeout(timer);
  }, [onFinish, shine]);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value * 200 }],
    opacity: 0.4,
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.dark, theme.primary, theme.dark]}
        style={StyleSheet.absoluteFill}
      />
      <CardSuitPattern opacity={0.08} />

      <View style={styles.cardsFan}>
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={styles.cardWrapLeft}
        >
          <SplashPlayingCard rank="2" suit="♣" suitColor={theme.text} />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={styles.cardWrapCenter}
        >
          <SplashPlayingCard
            rank="Q"
            suit="♠"
            suitColor={theme.text}
            large
          />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(240).springify()}
          style={styles.cardWrapRight}
        >
          <SplashPlayingCard rank="10" suit="♥" suitColor={theme.danger} />
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.duration(600)} style={styles.titleBlock}>
        <View style={styles.titleWrap}>
          <Text style={styles.titleRun}>RUN</Text>
          <Text style={styles.titleChip}>CHIP</Text>
          <Text style={styles.titleQueen}>QUEEN</Text>
          <Animated.View style={[styles.shine, shineStyle]} />
        </View>
        <Text style={styles.subtitle}>Track your table. See who wins.</Text>
      </Animated.View>
    </View>
  );
}

const CARD_WIDTH = 54;
const CARD_HEIGHT = 76;
const CARD_WIDTH_LG = 62;
const CARD_HEIGHT_LG = 86;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  cardsFan: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: CARD_HEIGHT_LG + 12,
    marginBottom: 36,
  },
  cardWrapLeft: {
    transform: [{ rotate: '-14deg' }],
    marginRight: -18,
    zIndex: 1,
  },
  cardWrapCenter: {
    zIndex: 3,
    marginBottom: 10,
  },
  cardWrapRight: {
    transform: [{ rotate: '14deg' }],
    marginLeft: -18,
    zIndex: 2,
  },
  playingCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: theme.ivory,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.45)',
    padding: 7,
    ...theme.shadowSoft,
  },
  playingCardLarge: {
    width: CARD_WIDTH_LG,
    height: CARD_HEIGHT_LG,
    borderRadius: 11,
    padding: 9,
    ...theme.shadowGold,
  },
  cornerTop: {
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  cornerBottom: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  cornerRank: {
    fontFamily: fonts.serifBold,
    fontSize: 12,
    lineHeight: 14,
  },
  cornerRankLarge: {
    fontSize: 14,
    lineHeight: 16,
  },
  cornerSuit: {
    fontSize: 10,
    lineHeight: 12,
    marginTop: -1,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSuit: {
    fontSize: 24,
    opacity: 0.88,
  },
  centerSuitLarge: {
    fontSize: 30,
  },
  titleBlock: {
    alignItems: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  titleRun: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
    color: theme.ivory,
    letterSpacing: 4,
  },
  titleChip: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: theme.gold,
    letterSpacing: 8,
    marginVertical: 2,
  },
  titleQueen: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
    color: theme.ivory,
    letterSpacing: 4,
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: theme.gold,
  },
  subtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
