import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Tabs, useLocalSearchParams } from 'expo-router';
import { PlusCircle, List, Trophy, MoreHorizontal } from 'lucide-react-native';
import { useAppStore } from '@/store/useAppStore';
import { theme, fonts } from '@/constants/theme';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { useLayout } from '@/hooks/useLayout';

export default function GameLayout() {
  const { isTablet } = useLayout();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const activeGame = useAppStore((s) => s.activeGame);
  const loadGame = useAppStore((s) => s.loadGame);

  useEffect(() => {
    if (!id) return;
    loadGame(id);
  }, [id, loadGame]);

  if (!id || !activeGame || activeGame.id !== id) {
    return (
      <FeltBackground>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.gold} />
        </View>
      </FeltBackground>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        lazy: true,
        tabBarActiveTintColor: theme.gold,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.dark,
          borderTopColor: 'rgba(217, 183, 93, 0.25)',
          borderTopWidth: 1,
          height: isTablet ? 72 : 88,
          paddingTop: isTablet ? 4 : 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: isTablet ? 12 : 11,
          marginBottom: isTablet ? 6 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="round"
        options={{
          title: 'Round',
          tabBarIcon: ({ color, size }) => (
            <PlusCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="totals"
        options={{
          title: 'Totals',
          tabBarIcon: ({ color, size }) => <Trophy size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
