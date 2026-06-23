import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
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
  onDark?: boolean;
  inline?: boolean;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeRingWedge(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, rOuter, endAngle);
  const endOuter = polarToCartesian(cx, cy, rOuter, startAngle);
  const startInner = polarToCartesian(cx, cy, rInner, endAngle);
  const endInner = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${startOuter.x} ${startOuter.y} A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${rInner} ${rInner} 0 ${largeArc} 1 ${startInner.x} ${startInner.y} Z`;
}

function ChipFace({
  size,
  color,
  fontSize,
  initials,
}: {
  size: number;
  color: string;
  fontSize: number;
  initials: string;
}) {
  const segments = 12;
  const cx = size / 2;
  const outerR = size / 2 - 1;
  const stripeInnerR = outerR * 0.78;
  const innerSize = size * 0.58;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Path
          d={`M ${cx} ${cx - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cx - outerR} Z`}
          fill={color}
        />
        {Array.from({ length: segments }).map((_, i) => {
          const start = (360 / segments) * i;
          const end = (360 / segments) * (i + 1);
          return (
            <Path
              key={i}
              d={describeRingWedge(cx, cx, stripeInnerR, outerR, start, end)}
              fill={i % 2 === 0 ? color : '#FFFFFF'}
            />
          );
        })}
      </Svg>
      <View
        style={[
          styles.faceInner,
          {
            backgroundColor: color,
            borderRadius: innerSize / 2,
            width: innerSize,
            height: innerSize,
            top: (size - innerSize) / 2,
            left: (size - innerSize) / 2,
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      </View>
    </View>
  );
}

export function PokerChip({
  player,
  selected = false,
  disabled = false,
  onPress,
  size = 'medium',
  showName = true,
  onDark = false,
  inline = false,
}: PokerChipProps) {
  const ringScale = useSharedValue(1);
  const circleSize = size === 'small' ? 44 : size === 'large' ? 64 : 54;
  const fontSize = size === 'small' ? 12 : size === 'large' ? 18 : 14;

  useEffect(() => {
    ringScale.value = withSpring(selected ? 1.08 : 1, {
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
      <Animated.View style={[styles.chipOuter, inline && styles.chipOuterInline, chipStyle]}>
        {selected ? (
          <View
            style={[
              styles.selectRing,
              {
                width: circleSize + 10,
                height: circleSize + 10,
                borderRadius: (circleSize + 10) / 2,
              },
            ]}
          />
        ) : null}
        <View style={[styles.chipShadow, disabled && styles.chipDisabled]}>
          <ChipFace
            size={circleSize}
            color={player.color}
            fontSize={fontSize}
            initials={getInitials(player.name)}
          />
        </View>
      </Animated.View>
      {showName ? (
        <Text
          style={[
            styles.name,
            onDark && styles.nameOnDark,
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
        style={[styles.pressable, inline && styles.pressableInline]}
        scaleTo={0.92}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return <View style={[styles.pressable, inline && styles.pressableInline]}>{content}</View>;
}

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    width: 76,
    marginBottom: 4,
  },
  pressableInline: {
    width: 'auto',
    marginBottom: 0,
  },
  wrapper: {
    alignItems: 'center',
  },
  chipOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  chipOuterInline: {
    marginBottom: 0,
  },
  selectRing: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: theme.primary,
    ...theme.shadowSoft,
  },
  chipShadow: {
    borderRadius: 999,
    ...theme.shadowSoft,
  },
  chipDisabled: {
    opacity: 0.35,
  },
  faceInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fonts.sansBold,
    color: theme.ivory,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: theme.text,
    textAlign: 'center',
    maxWidth: 72,
  },
  nameOnDark: {
    color: theme.ivory,
  },
  nameSelected: {
    color: theme.primary,
  },
  nameDisabled: {
    textDecorationLine: 'line-through',
    opacity: 0.45,
  },
});
