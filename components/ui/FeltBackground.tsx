import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { CardSuitPattern } from './CardSuitPattern';
import { theme } from '@/constants/theme';

type FeltBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  showPattern?: boolean;
};

export function FeltBackground({
  children,
  style,
  showPattern = true,
}: FeltBackgroundProps) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[theme.dark, theme.primary, theme.darkElevated]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {showPattern ? <CardSuitPattern opacity={0.06} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.dark,
  },
});
