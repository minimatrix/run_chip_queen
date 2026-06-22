import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme, fonts } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  suit?: '♠' | '♥' | '♣' | '♦';
  dark?: boolean;
  style?: ViewStyle;
};

export function ScreenHeader({
  title,
  subtitle,
  suit = '♠',
  dark = true,
  style,
}: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16 },
        dark && styles.dark,
        style,
      ]}
    >
      <Text style={[styles.suit, dark && styles.suitDark]}>{suit}</Text>
      <Text style={[styles.title, dark && styles.titleDark]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, dark && styles.subtitleDark]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dark: {
    backgroundColor: 'transparent',
  },
  suit: {
    fontSize: 22,
    color: theme.gold,
    marginBottom: 6,
  },
  suitDark: {
    color: theme.gold,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: theme.text,
    letterSpacing: 0.5,
  },
  titleDark: {
    color: theme.ivory,
  },
  subtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 6,
  },
  subtitleDark: {
    color: theme.muted,
  },
});
