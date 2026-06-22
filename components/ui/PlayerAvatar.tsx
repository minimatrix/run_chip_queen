import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Player } from '@/lib/types';
import { PokerChip } from './PokerChip';

type PlayerAvatarProps = {
  player: Player;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  isQueenPot?: boolean;
  animateIn?: boolean;
  index?: number;
};

export function PlayerAvatar({
  animateIn = false,
  index = 0,
  ...props
}: PlayerAvatarProps) {
  const chip = <PokerChip {...props} />;

  if (animateIn) {
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        {chip}
      </Animated.View>
    );
  }

  return chip;
}
