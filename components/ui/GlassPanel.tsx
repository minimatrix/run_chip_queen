import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

type GlassPanelProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'ivory' | 'dark' | 'gold';
};

export function GlassPanel({
  children,
  style,
  variant = 'ivory',
}: GlassPanelProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'ivory' && styles.ivory,
        variant === 'dark' && styles.dark,
        variant === 'gold' && styles.gold,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    ...theme.shadowSoft,
  },
  ivory: {
    backgroundColor: theme.ivory,
    borderColor: 'rgba(217, 183, 93, 0.35)',
  },
  dark: {
    backgroundColor: 'rgba(3, 40, 27, 0.85)',
    borderColor: 'rgba(217, 183, 93, 0.2)',
  },
  gold: {
    backgroundColor: 'rgba(217, 183, 93, 0.15)',
    borderColor: theme.gold,
  },
});
