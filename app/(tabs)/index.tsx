import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardSuitPattern } from '@/components/ui/CardSuitPattern';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { GameCard } from '@/components/ui/GameCard';
import { PastGameCard } from '@/components/ui/PastGameCard';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { theme, fonts } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import type { GameWithMeta } from '@/lib/types';
import { TabletContent } from '@/components/ui/TabletContent';
import { useLayout } from '@/hooks/useLayout';

export default function GamesScreen() {
  const { isWide } = useLayout();
  const router = useRouter();
  const games = useAppStore((s) => s.games);
  const getGamePreview = useAppStore((s) => s.getGamePreview);
  const deleteGame = useAppStore((s) => s.deleteGame);

  const activeGame = games.find((g) => g.status === 'active');
  const pastGames = games.filter((g) => g.id !== activeGame?.id);

  const [activeMeta, setActiveMeta] = useState<{
    rounds: number;
    leader?: string;
  } | null>(null);

  useEffect(() => {
    if (!activeGame) {
      setActiveMeta(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const preview = await getGamePreview(activeGame.id);
      if (!cancelled && preview) {
        setActiveMeta({
          rounds: preview.rounds,
          leader: preview.leader,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeGame?.id, getGamePreview]);

  const handleGamePress = (gameId: string, status: string) => {
    if (status === 'finished') {
      router.push({ pathname: '/settle/[id]', params: { id: gameId } });
    } else {
      router.push({ pathname: '/game/[id]', params: { id: gameId } });
    }
  };

  const handleDeleteGame = (game: GameWithMeta) => {
    Alert.alert(
      'Delete Game',
      `Delete "${game.name}" and all its rounds? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGame(game.id),
        },
      ],
    );
  };

  return (
    <FeltBackground>
      <CardSuitPattern opacity={0.04} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Welcome back"
          subtitle="Continue your table."
          suit="♠"
        />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TabletContent>
          {games.length === 0 ? (
            <PremiumEmptyState
              suit="♦"
              title="No games yet"
              subtitle="Start your first game and track every pot around the table."
            />
          ) : (
            <>
              {activeGame ? (
                <GameCard
                  game={activeGame}
                  onPress={() => handleGamePress(activeGame.id, activeGame.status)}
                  isHero
                  roundsPlayed={activeMeta?.rounds}
                  leaderName={activeMeta?.leader}
                />
              ) : null}
              {pastGames.length > 0 ? (
                <View style={styles.pastSection}>
                  <Text style={styles.pastTitle}>Past Tables</Text>
                  <View style={isWide ? styles.pastGrid : undefined}>
                    {pastGames.map((game, index) => (
                      <View
                        key={game.id}
                        style={isWide ? styles.pastGridItem : undefined}
                      >
                        <PastGameCard
                          game={game}
                          index={index}
                          onPress={() => handleGamePress(game.id, game.status)}
                          onDelete={() => handleDeleteGame(game)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          )}
          <View style={styles.bottomPad} />
          </TabletContent>
        </ScrollView>
        <FloatingActionButton onPress={() => router.push('/game/new')} />
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  pastSection: {
    marginTop: 8,
  },
  pastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pastGridItem: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 300,
  },
  pastTitle: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  bottomPad: {
    height: 40,
  },
});
