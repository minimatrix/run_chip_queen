import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme, fonts } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

type PrimaryGoldButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'large' | 'medium';
};

export function PrimaryGoldButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  size = 'large',
}: PrimaryGoldButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[styles.wrapper, disabled && styles.disabled, style]}
      scaleTo={0.97}
    >
      <LinearGradient
        colors={[theme.goldLight, theme.gold, theme.goldDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, size === 'medium' && styles.buttonMedium]}
      >
        {loading ? (
          <ActivityIndicator color={theme.dark} />
        ) : (
          <Text style={[styles.text, size === 'medium' && styles.textMedium]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.buttonRadius,
    overflow: 'hidden',
    ...theme.shadowGold,
  },
  button: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  buttonMedium: {
    paddingVertical: 14,
    minHeight: 50,
  },
  text: {
    fontFamily: fonts.sansBold,
    fontSize: 17,
    color: theme.dark,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  textMedium: {
    fontSize: 15,
  },
  disabled: {
    opacity: 0.45,
  },
});
