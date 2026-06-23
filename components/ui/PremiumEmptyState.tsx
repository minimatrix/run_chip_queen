import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme, fonts } from '@/constants/theme';
import { GlassPanel } from './GlassPanel';

type PremiumEmptyStateProps = {
  suit?: '♠' | '♥' | '♣' | '♦';
  title: string;
  subtitle: string;
};

export function PremiumEmptyState({
  suit = '♦',
  title,
  subtitle,
}: PremiumEmptyStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <GlassPanel style={styles.card}>
        <Text style={styles.suit}>{suit}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </GlassPanel>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    padding: 32,
    alignItems: 'center',
    maxWidth: 300,
  },
  suit: {
    fontSize: 40,
    color: theme.gold,
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 22,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
