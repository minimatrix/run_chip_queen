import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
};

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.outlineButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.emerald} />
        ) : (
          <Text style={styles.outlineText}>{title}</Text>
        )}
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.secondaryButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={theme.emerald} />
        ) : (
          <Text style={styles.secondaryText}>{title}</Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.wrapper,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={[theme.emerald, theme.emeraldDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={theme.white} />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.buttonRadius,
    overflow: 'hidden',
    ...theme.shadow,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  text: {
    color: theme.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: theme.mint,
    borderRadius: theme.buttonRadius,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#C6E8CC',
  },
  secondaryText: {
    color: theme.emerald,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    borderRadius: theme.buttonRadius,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 50,
    borderWidth: 2,
    borderColor: theme.emerald,
    backgroundColor: theme.white,
  },
  outlineText: {
    color: theme.emerald,
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
