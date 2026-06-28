import { HistoryRoundCard } from '@/components/ui/HistoryRoundCard';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import {
  getPotValuesForRound,
  getTwoHandsPlayerForRound,
} from '@/lib/calculations';
import type { Game, Player, PlayerBuyIn, Round } from '@/lib/types';
import { Alert, FlatList, StyleSheet, View, ViewStyle } from 'react-native';

type GameRoundHistoryListProps = {
  game: Game;
  players: Player[];
  rounds: Round[];
  buyIns?: PlayerBuyIn[];
  onEditRound?: (roundId: string, roundNumber: number) => void;
  allowDelete?: boolean;
  onDeleteRound?: (roundId: string) => void;
  embedded?: boolean;
  contentContainerStyle?: ViewStyle;
  columns?: 1 | 2;
};

export function GameRoundHistoryList({
  game,
  players,
  rounds,
  buyIns = [],
  onEditRound,
  allowDelete = true,
  onDeleteRound,
  embedded = false,
  contentContainerStyle,
  columns = 1,
}: GameRoundHistoryListProps) {
  const getPlayerName = (playerId?: string | null) => {
    if (!playerId) return '-';
    return players.find((p) => p.id === playerId)?.name ?? '-';
  };

  const handleDelete = (roundId: string, roundNumber: number) => {
    if (!onDeleteRound) return;
    Alert.alert(
      'Delete Round',
      `Delete round ${roundNumber}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteRound(roundId),
        },
      ],
    );
  };

  const sortedRounds = [...rounds].reverse();

  const renderRound = (item: Round, index: number) => {
    const potValues = getPotValuesForRound(
      game,
      players,
      rounds,
      item.roundNumber,
      buyIns,
    );
    const priorRounds = rounds.filter(
      (round) => round.roundNumber < item.roundNumber,
    );
    const twoHandsPlayer = getTwoHandsPlayerForRound(
      game,
      players,
      priorRounds,
      item.roundNumber,
      buyIns,
    );
    const roundBuyIns = buyIns
      .filter((buyIn) => buyIn.roundNumber === item.roundNumber)
      .map((buyIn) => ({
        id: buyIn.id,
        playerName: getPlayerName(buyIn.playerId),
        amountPence: buyIn.amountPence,
      }));

    return (
      <HistoryRoundCard
        roundNumber={item.roundNumber}
        twoHandsName={twoHandsPlayer?.name}
        buyIns={roundBuyIns}
        runWinner={getPlayerName(item.runWinnerId)}
        chipWinner={getPlayerName(item.chipWinnerId)}
        queenWinner={getPlayerName(item.queenWinnerId)}
        runPayout={item.runWinnerId ? potValues.run : undefined}
        chipPayout={item.chipWinnerId ? potValues.chip : undefined}
        queenPayout={item.queenWinnerId ? potValues.queen : undefined}
        onPress={
          onEditRound
            ? () => onEditRound(item.id, item.roundNumber)
            : undefined
        }
        onDelete={
          allowDelete && onDeleteRound
            ? () => handleDelete(item.id, item.roundNumber)
            : undefined
        }
        readOnly={!onEditRound && !(allowDelete && onDeleteRound)}
        index={index}
      />
    );
  };

  const wrapForColumns = (node: React.ReactNode, key: string) => {
    if (columns === 1) {
      return <View key={key}>{node}</View>;
    }
    return (
      <View key={key} style={styles.gridItem}>
        {node}
      </View>
    );
  };

  if (rounds.length === 0) {
    return (
      <PremiumEmptyState
        suit="♣"
        title="No rounds yet"
        subtitle="Add your first round to start tracking the table."
      />
    );
  }

  if (embedded) {
    return (
      <View
        style={[
          styles.embedded,
          columns === 2 && styles.embeddedGrid,
          contentContainerStyle,
        ]}
      >
        {sortedRounds.map((round, index) =>
          wrapForColumns(renderRound(round, index), round.id),
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={sortedRounds}
      key={columns}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      columnWrapperStyle={columns === 2 ? styles.columnWrapper : undefined}
      contentContainerStyle={[styles.list, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <View style={columns === 2 ? styles.flatGridItem : undefined}>
          {renderRound(item, index)}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 8,
  },
  embedded: {
    gap: 0,
  },
  embeddedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 280,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  flatGridItem: {
    flex: 1,
  },
});
