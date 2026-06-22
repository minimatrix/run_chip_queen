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
      <CardSuitPattern opacity={0.1} />
      <Animated.View entering={FadeIn.duration(600)} style={styles.cards}>
        <Text style={[styles.card, styles.cardLeft]}>2♣</Text>
        <Text style={[styles.card, styles.cardCenter]}>Q♠</Text>
        <Text style={[styles.card, styles.cardRight]}>10♥</Text>
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(400).springify()}>
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

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  cards: {
    flexDirection: 'row',
    marginBottom: 32,
    height: 80,
    alignItems: 'center',
  },
  card: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: theme.ivory,
    backgroundColor: 'rgba(247, 244, 236, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.gold,
    overflow: 'hidden',
  },
  cardLeft: {
    transform: [{ rotate: '-15deg' }],
    marginRight: -10,
    zIndex: 1,
  },
  cardCenter: {
    zIndex: 3,
    ...theme.shadowGold,
  },
  cardRight: {
    transform: [{ rotate: '15deg' }],
    marginLeft: -10,
    zIndex: 2,
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
