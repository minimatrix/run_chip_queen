import { StyleSheet, Text, View, ViewStyle } from 'react-native';
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
  return (
    <View style={[styles.container, dark && styles.dark, style]}>
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
    paddingTop: 4,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  dark: {
    backgroundColor: 'transparent',
  },
  suit: {
    fontSize: 20,
    color: theme.gold,
    marginBottom: 4,
  },
  suitDark: {
    color: theme.gold,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
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
    marginTop: 4,
  },
  subtitleDark: {
    color: theme.muted,
  },
});
