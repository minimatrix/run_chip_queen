import { useRef, type ReactNode } from 'react';
import {
  Animated as RNAnimated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';

const REVEAL_WIDTH = 72;

type SwipeToDeleteProps = {
  onDelete: () => void;
  children: ReactNode;
  style?: object;
};

export function SwipeToDelete({
  onDelete,
  children,
  style,
}: SwipeToDeleteProps) {
  const translateX = useRef(new RNAnimated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (g.dx < 0) {
          translateX.setValue(Math.max(g.dx, -REVEAL_WIDTH));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx < -40) {
          RNAnimated.spring(translateX, {
            toValue: -REVEAL_WIDTH,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
        } else {
          RNAnimated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 300,
          }).start();
        }
      },
    }),
  ).current;

  const close = () => {
    RNAnimated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    close();
    onDelete();
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        style={styles.deleteZone}
        onPress={handleDelete}
        accessibilityLabel="Delete"
      >
        <Trash2 size={20} color={theme.ivory} strokeWidth={2} />
      </Pressable>
      <RNAnimated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </RNAnimated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: theme.cardRadius,
    overflow: 'hidden',
  },
  deleteZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: REVEAL_WIDTH,
    backgroundColor: theme.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
