import { StyleSheet, View, type ViewStyle } from 'react-native';

type TabletSplitProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  leftFlex?: number;
  rightFlex?: number;
  gap?: number;
  style?: ViewStyle;
};

export function TabletSplit({
  left,
  right,
  leftFlex = 1,
  rightFlex = 1,
  gap = 20,
  style,
}: TabletSplitProps) {
  return (
    <View style={[styles.split, { gap }, style]}>
      <View style={[styles.column, { flex: leftFlex }]}>{left}</View>
      <View style={[styles.column, { flex: rightFlex }]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  split: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    minWidth: 0,
  },
});
