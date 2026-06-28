import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useLayout } from '@/hooks/useLayout';

type TabletContentProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
};

export function TabletContent({
  children,
  style,
  fullWidth = false,
}: TabletContentProps) {
  const { isTablet, contentMaxWidth, contentPadding } = useLayout();

  return (
    <View
      style={[
        styles.base,
        { paddingHorizontal: contentPadding },
        isTablet && !fullWidth && contentMaxWidth
          ? { maxWidth: contentMaxWidth }
          : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
});
