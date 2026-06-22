import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAppStore } from '@/store/useAppStore';
import { theme } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialized, init } = useAppStore();

  useEffect(() => {
    init().finally(() => {
      SplashScreen.hideAsync();
    });
  }, [init]);

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.emerald} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="game/new"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen name="game/[id]" />
      <Stack.Screen
        name="settle/[id]"
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.white,
  },
});
