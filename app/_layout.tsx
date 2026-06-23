import 'react-native-reanimated';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useAppStore } from '@/store/useAppStore';
import { theme } from '@/constants/theme';
import { AnimatedSplash } from '@/components/ui/AnimatedSplash';
import { FeltBackground } from '@/components/ui/FeltBackground';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { initialized, init } = useAppStore();
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    init().finally(() => {
      SplashScreen.hideAsync();
    });
  }, [init]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!initialized || !fontsLoaded) {
    return (
      <FeltBackground>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.gold} />
        </View>
      </FeltBackground>
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.dark },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="game/new"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="how-to-play"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen name="game/[id]" />
        <Stack.Screen
          name="settle/[id]"
          options={{ presentation: 'modal', animation: 'fade_from_bottom' }}
        />
      </Stack>
      {showSplash ? <AnimatedSplash onFinish={handleSplashFinish} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
