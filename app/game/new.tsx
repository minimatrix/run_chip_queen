import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/AppHeader';
import { PlayerChip } from '@/components/PlayerChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
import { formatMoney, formatStake } from '@/lib/format';
import { pickPlayerColor } from '@/lib/colors';
import { useAppStore } from '@/store/useAppStore';
import type { Player } from '@/lib/types';

export default function NewGameScreen() {
  const router = useRouter();
  const { settings, globalPlayers, createGame } = useAppStore();
  const [gameName, setGameName] = useState('');
  const [stake, setStake] = useState(20);
  const [startingBalance, setStartingBalance] = useState(
    settings.defaultStartingBalancePence,
  );
  const [playerName, setPlayerName] = useState('');
  const [draftPlayers, setDraftPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);

  const increment = settings.stakeIncrement;
  const balanceIncrement = settings.startingBalanceIncrement;
  const displayPlayerCount = Math.max(draftPlayers.length, 4);
  const examplePot = stake * displayPlayerCount;
  const exampleRound = examplePot * 3;

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (
      draftPlayers.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      Alert.alert('Duplicate', 'That player is already added.');
      return;
    }
    const usedColors = draftPlayers.map((p) => p.color);
    setDraftPlayers([
      ...draftPlayers,
      {
        id: `draft-${Date.now()}-${Math.random()}`,
        name: trimmed,
        color: pickPlayerColor(usedColors),
      },
    ]);
    setPlayerName('');
  };

  const removePlayer = (id: string) => {
    setDraftPlayers(draftPlayers.filter((p) => p.id !== id));
  };

  const addSavedPlayer = (player: Player) => {
    if (draftPlayers.some((p) => p.name.toLowerCase() === player.name.toLowerCase())) {
      return;
    }
    setDraftPlayers([...draftPlayers, { ...player, id: `draft-${player.id}` }]);
  };

  const handleStart = async () => {
    if (!gameName.trim()) {
      Alert.alert('Name required', 'Please enter a game name.');
      return;
    }
    if (draftPlayers.length < 2) {
      Alert.alert('More players needed', 'Add at least 2 players to start.');
      return;
    }
    setLoading(true);
    try {
      const gameId = await createGame(
        gameName.trim(),
        stake,
        draftPlayers.map((p) => p.name),
        startingBalance,
      );
      router.replace({
        pathname: '/game/[id]/round',
        params: { id: gameId },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="New Game" subtitle="Set up stakes and players." />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Game name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Saturday Night"
          placeholderTextColor={theme.textMuted}
          value={gameName}
          onChangeText={setGameName}
        />

        <Text style={styles.label}>Stake per pot per player</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setStake(Math.max(increment, stake - increment))}
          >
            <Ionicons name="remove" size={24} color={theme.emerald} />
          </Pressable>
          <Text style={styles.stakeDisplay}>{formatStake(stake)}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => setStake(stake + increment)}
          >
            <Ionicons name="add" size={24} color={theme.emerald} />
          </Pressable>
        </View>

        <Text style={styles.label}>Starting balance per player</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() =>
              setStartingBalance(
                Math.max(balanceIncrement, startingBalance - balanceIncrement),
              )
            }
          >
            <Ionicons name="remove" size={24} color={theme.emerald} />
          </Pressable>
          <Text style={styles.stakeDisplay}>{formatMoney(startingBalance)}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() =>
              setStartingBalance(startingBalance + balanceIncrement)
            }
          >
            <Ionicons name="add" size={24} color={theme.emerald} />
          </Pressable>
        </View>

        <View style={styles.explanation}>
          <Text style={styles.explanationText}>
            {displayPlayerCount} players × {formatStake(stake)} ={' '}
            {formatStake(examplePot)} per pot
          </Text>
          <Text style={styles.explanationText}>
            3 pots = {formatMoney(exampleRound)} per round
          </Text>
        </View>

        <Text style={styles.label}>Add players</Text>
        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.flexInput]}
            placeholder="Player name"
            placeholderTextColor={theme.textMuted}
            value={playerName}
            onChangeText={setPlayerName}
            onSubmitEditing={() => addPlayer(playerName)}
          />
          <Pressable
            style={styles.addBtn}
            onPress={() => addPlayer(playerName)}
          >
            <Ionicons name="person-add" size={22} color={theme.white} />
          </Pressable>
        </View>

        {globalPlayers.length > 0 ? (
          <View style={styles.savedSection}>
            <Text style={styles.savedLabel}>Quick add saved players</Text>
            <View style={styles.savedRow}>
              {globalPlayers.map((p) => (
                <Pressable key={p.id} onPress={() => addSavedPlayer(p)}>
                  <PlayerChip player={p} size="small" />
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.playerList}>
          {draftPlayers.map((player) => (
            <View key={player.id} style={styles.playerRow}>
              <PlayerChip player={player} showName={false} size="small" />
              <Text style={styles.playerRowName}>{player.name}</Text>
              <Pressable onPress={() => removePlayer(player.id)}>
                <Ionicons name="close-circle" size={22} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </View>

        <PrimaryButton
          title="Start Game"
          onPress={handleStart}
          loading={loading}
          disabled={draftPlayers.length < 2 || !gameName.trim()}
          style={styles.startBtn}
        />
        <PrimaryButton
          title="Cancel"
          variant="outline"
          onPress={() => router.back()}
          style={styles.cancelBtn}
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.emerald,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 24,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stakeDisplay: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.emerald,
    minWidth: 80,
    textAlign: 'center',
  },
  explanation: {
    backgroundColor: theme.mint,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#C6E8CC',
  },
  explanationText: {
    fontSize: 14,
    color: theme.emeraldDark,
    fontWeight: '500',
    lineHeight: 22,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  flexInput: {
    flex: 1,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedSection: {
    marginTop: 16,
  },
  savedLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  savedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  playerList: {
    marginTop: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  playerRowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  startBtn: {
    marginTop: 24,
  },
  cancelBtn: {
    marginTop: 12,
  },
});
