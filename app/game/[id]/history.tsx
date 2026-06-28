import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GameRoundHistoryList } from '@/components/ui/GameRoundHistoryList';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAppStore } from '@/store/useAppStore';
import { useLayout } from '@/hooks/useLayout';

export default function HistoryScreen() {
  const { isTablet, isWide } = useLayout();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeGame, activeGamePlayers, activeGameRounds, activeGameBuyIns, deleteRound } =
    useAppStore();

  if (!activeGame) return null;

  const handleEdit = (roundId: string, roundNumber: number) => {
    router.navigate({
      pathname: '/game/[id]/round',
      params: { id, roundId, roundNumber: String(roundNumber) },
    });
  };

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Round History" subtitle={activeGame.name} suit="♦" />
        <GameRoundHistoryList
          game={activeGame}
          players={activeGamePlayers}
          rounds={activeGameRounds}
          buyIns={activeGameBuyIns}
          onEditRound={handleEdit}
          onDeleteRound={deleteRound}
          columns={isWide ? 2 : 1}
        />
        <View
          style={[
            styles.footer,
            isTablet ? styles.footerTablet : null,
          ]}
        >
          <PrimaryGoldButton
            title="Add Next Round"
            onPress={() =>
              router.navigate({
                pathname: '/game/[id]/round',
                params: {
                  id,
                  roundNumber: String(activeGameRounds.length + 1),
                },
              })
            }
          />
        </View>
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    width: '100%',
  },
  footerTablet: {
    maxWidth: 960,
    alignSelf: 'center',
  },
});
