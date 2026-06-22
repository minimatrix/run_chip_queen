import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { GameCard } from '@/components/GameCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';

export default function GamesScreen() {
  const router = useRouter();
  const games = useAppStore((s) => s.games);

  const handleGamePress = (gameId: string, status: string) => {
    if (status === 'finished') {
      router.push({ pathname: '/settle/[id]', params: { id: gameId } });
    } else {
      router.push({ pathname: '/game/[id]/round', params: { id: gameId } });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Run, Chip, Queen"
        subtitle="Track your games. See who wins."
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <EmptyState
            icon="diamond-outline"
            title="No games yet"
            subtitle="Start your first game and track every pot."
          />
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => handleGamePress(game.id, game.status)}
            />
          ))
        )}
        <PrimaryButton
          title="+ New Game"
          onPress={() => router.push('/game/new')}
          style={styles.cta}
        />
        <SafeAreaView edges={['bottom']} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  cta: {
    marginTop: 8,
  },
});
