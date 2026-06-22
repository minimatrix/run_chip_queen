import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/constants/theme';
import { getInitials } from '@/lib/format';
import type { Player } from '@/lib/types';

type PlayerChipProps = {
  player: Player;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
};

export function PlayerChip({
  player,
  selected = false,
  disabled = false,
  onPress,
  size = 'medium',
  showName = true,
}: PlayerChipProps) {
  const circleSize = size === 'small' ? 36 : size === 'large' ? 52 : 44;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  const handlePress = () => {
    if (disabled || !onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const content = (
    <>
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor: player.color,
          },
          selected && styles.selectedCircle,
          disabled && styles.disabledCircle,
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(player.name)}
        </Text>
      </View>
      {showName ? (
        <Text
          style={[
            styles.name,
            selected && styles.selectedName,
            disabled && styles.disabledName,
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.container,
          disabled && styles.disabledContainer,
          pressed && !disabled && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 72,
    marginBottom: 8,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  selectedCircle: {
    borderWidth: 3,
    borderColor: theme.emerald,
    ...theme.shadowGold,
  },
  initials: {
    color: theme.white,
    fontWeight: '700',
  },
  name: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  selectedName: {
    color: theme.emerald,
    fontWeight: '600',
  },
  disabledContainer: {
    opacity: 0.45,
  },
  disabledCircle: {
    borderWidth: 2,
    borderColor: theme.border,
  },
  disabledName: {
    color: theme.textMuted,
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.8,
  },
});
