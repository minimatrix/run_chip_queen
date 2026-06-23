import {
  ActivityIndicator,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme, fonts } from '@/constants/theme';
import { AnimatedPressable } from './AnimatedPressable';

type SecondaryGreenButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'filled' | 'outline';
};

export function SecondaryGreenButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  variant = 'outline',
}: SecondaryGreenButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variant === 'filled' && styles.filled,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
      ]}
      scaleTo={0.97}
    >
      {loading ? (
        <ActivityIndicator color={theme.gold} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'filled' && styles.textFilled,
          ]}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.buttonRadius,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  filled: {
    backgroundColor: theme.primary,
    borderWidth: 1,
    borderColor: theme.gold,
    ...theme.shadowSoft,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.gold,
  },
  text: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: theme.gold,
    letterSpacing: 0.5,
  },
  textFilled: {
    color: theme.ivory,
  },
  disabled: {
    opacity: 0.4,
  },
});
