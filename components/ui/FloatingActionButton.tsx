import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { theme, fonts } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

type FloatingActionButtonProps = {
  onPress: () => void;
};

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View entering={FadeIn.delay(300)} style={styles.container}>
      <AnimatedPressable onPress={handlePress} style={styles.button} scaleTo={0.9}>
        <LinearGradient
          colors={[theme.goldLight, theme.gold, theme.goldDark]}
          style={styles.gradient}
        >
          <Plus size={28} color={theme.dark} strokeWidth={3} />
        </LinearGradient>
      </AnimatedPressable>
      <Text style={styles.label}>New Game</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    alignItems: 'center',
  },
  button: {
    borderRadius: 32,
    overflow: 'hidden',
    ...theme.shadowGold,
  },
  gradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: theme.gold,
    marginTop: 6,
  },
});
