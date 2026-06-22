import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { theme, fonts } from '@/constants/theme';
import { getInitials } from '@/lib/format';
import type { Player } from '@/lib/types';
import { AnimatedPressable } from './AnimatedPressable';

type PokerChipProps = {
  player: Player;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  isQueenPot?: boolean;
};

export function PokerChip({
  player,
  selected = false,
  disabled = false,
  onPress,
  size = 'medium',
  showName = true,
  isQueenPot = false,
}: PokerChipProps) {
  const ringScale = useSharedValue(1);

  const circleSize = size === 'small' ? 44 : size === 'large' ? 64 : 54;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 20 : 16;

  useEffect(() => {
    ringScale.value = withSpring(selected ? 1.1 : 1, {
      damping: 12,
      stiffness: 200,
    });
    if (selected) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selected, ringScale]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const handlePress = () => {
    if (disabled || !onPress) return;
    onPress();
  };

  const content = (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.chipOuter, chipStyle]}>
        {selected ? (
          <View
            style={[
              styles.goldRing,
              {
                width: circleSize + 12,
                height: circleSize + 12,
                borderRadius: (circleSize + 12) / 2,
              },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.chip,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              backgroundColor: player.color,
            },
            disabled && styles.chipDisabled,
          ]}
        >
          <View style={styles.chipInnerRing} />
          <Text style={[styles.initials, { fontSize }]}>
            {getInitials(player.name)}
          </Text>
          {selected && isQueenPot ? (
            <Text style={styles.crown}>👑</Text>
          ) : null}
        </View>
      </Animated.View>
      {showName ? (
        <Text
          style={[
            styles.name,
            selected && styles.nameSelected,
            disabled && styles.nameDisabled,
          ]}
          numberOfLines={1}
        >
          {player.name}
        </Text>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        disabled={disabled}
        style={styles.pressable}
        scaleTo={0.92}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={styles.pressable}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    width: 76,
    marginBottom: 4,
  },
  wrapper: {
    alignItems: 'center',
  },
  chipOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  goldRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: theme.gold,
    ...theme.shadowGold,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    ...theme.shadowSoft,
  },
  chipInnerRing: {
    position: 'absolute',
    width: '75%',
    height: '75%',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    borderStyle: 'dashed',
  },
  chipDisabled: {
    opacity: 0.35,
  },
  initials: {
    fontFamily: fonts.sansBold,
    color: theme.ivory,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  crown: {
    position: 'absolute',
    top: -10,
    fontSize: 14,
  },
  name: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: theme.muted,
    textAlign: 'center',
    maxWidth: 72,
  },
  nameSelected: {
    color: theme.gold,
    fontFamily: fonts.sansBold,
  },
  nameDisabled: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
});
