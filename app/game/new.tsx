import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, UserPlus, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AnimatedStakeExplanation } from '@/components/ui/AnimatedStakeExplanation';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SecondaryGreenButton } from '@/components/ui/SecondaryGreenButton';
import { StakePill } from '@/components/ui/StakePill';
import { theme, fonts } from '@/constants/theme';
import { pickPlayerColor } from '@/lib/colors';
import { useAppStore } from '@/store/useAppStore';
import type { Player } from '@/lib/types';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';

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

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (
      draftPlayers.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())
    ) {
      Alert.alert('Duplicate', 'That player is already at the table.');
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

  const movePlayer = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= draftPlayers.length) return;
    const updated = [...draftPlayers];
    const [item] = updated.splice(index, 1);
    updated.splice(nextIndex, 0, item);
    setDraftPlayers(updated);
  };

  const addSavedPlayer = (player: Player) => {
    if (draftPlayers.some((p) => p.name.toLowerCase() === player.name.toLowerCase())) {
      return;
    }
    setDraftPlayers([...draftPlayers, { ...player, id: `draft-${player.id}` }]);
  };

  const handleStart = async () => {
    if (!gameName.trim()) {
      Alert.alert('Name required', 'Give your table a name.');
      return;
    }
    if (draftPlayers.length < 2) {
      Alert.alert('More players needed', 'Add at least 2 players to deal in.');
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
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScreenHeader
          title="Set the Table"
          subtitle="Stakes, players, and order."
          suit="♥"
        />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Table name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Saturday Night"
            placeholderTextColor={theme.muted}
            value={gameName}
            onChangeText={setGameName}
          />

          <Text style={styles.label}>Stake per pot per player</Text>
          <StakePill
            value={stake}
            onDecrement={() => setStake(Math.max(increment, stake - increment))}
            onIncrement={() => setStake(stake + increment)}
            min={increment}
          />

          <Text style={styles.label}>Starting balance per player</Text>
          <StakePill
            value={startingBalance}
            format="money"
            onDecrement={() =>
              setStartingBalance(
                Math.max(balanceIncrement, startingBalance - balanceIncrement),
              )
            }
            onIncrement={() =>
              setStartingBalance(startingBalance + balanceIncrement)
            }
            min={balanceIncrement}
          />

          <AnimatedStakeExplanation
            playerCount={displayPlayerCount}
            stakePence={stake}
          />

          <Text style={styles.label}>Deal in players</Text>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.input, styles.flexInput]}
              placeholder="Player name"
              placeholderTextColor={theme.muted}
              value={playerName}
              onChangeText={setPlayerName}
              onSubmitEditing={() => addPlayer(playerName)}
            />
            <AnimatedPressable
              style={styles.addBtn}
              onPress={() => addPlayer(playerName)}
              scaleTo={0.9}
            >
              <UserPlus size={22} color={theme.dark} />
            </AnimatedPressable>
          </View>

          {globalPlayers.length > 0 ? (
            <GlassPanel style={styles.savedSection}>
              <Text style={styles.savedLabel}>Quick add saved players</Text>
              <View style={styles.savedRow}>
                {globalPlayers.map((p) => (
                  <PlayerAvatar
                    key={p.id}
                    player={p}
                    size="small"
                    onPress={() => addSavedPlayer(p)}
                  />
                ))}
              </View>
            </GlassPanel>
          ) : null}

          <View style={styles.playerList}>
            <Text style={styles.orderHint}>
              Two hands order — top player deals first, then rotates each round
            </Text>
            {draftPlayers.map((player, index) => (
              <Animated.View
                key={player.id}
                entering={FadeInDown.springify()}
              >
                <GlassPanel style={styles.playerRow}>
                  <View style={styles.orderBadge}>
                    <Text style={styles.orderBadgeText}>{index + 1}</Text>
                  </View>
                  <PlayerAvatar player={player} showName={false} size="small" />
                  <Text style={styles.playerRowName}>{player.name}</Text>
                  <View style={styles.orderActions}>
                    <AnimatedPressable
                      onPress={() => movePlayer(index, -1)}
                      disabled={index === 0}
                      style={index === 0 && styles.orderBtnDisabled}
                    >
                      <ChevronUp
                        size={20}
                        color={index === 0 ? theme.muted : theme.gold}
                      />
                    </AnimatedPressable>
                    <AnimatedPressable
                      onPress={() => movePlayer(index, 1)}
                      disabled={index === draftPlayers.length - 1}
                      style={
                        index === draftPlayers.length - 1 &&
                        styles.orderBtnDisabled
                      }
                    >
                      <ChevronDown
                        size={20}
                        color={
                          index === draftPlayers.length - 1
                            ? theme.muted
                            : theme.gold
                        }
                      />
                    </AnimatedPressable>
                  </View>
                  <AnimatedPressable onPress={() => removePlayer(player.id)}>
                    <X size={20} color={theme.danger} />
                  </AnimatedPressable>
                </GlassPanel>
              </Animated.View>
            ))}
          </View>

          <PrimaryGoldButton
            title="Deal In"
            onPress={handleStart}
            loading={loading}
            disabled={draftPlayers.length < 2 || !gameName.trim()}
            style={styles.startBtn}
          />
          <SecondaryGreenButton
            title="Cancel"
            onPress={() => router.back()}
            style={styles.cancelBtn}
          />
        </ScrollView>
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: theme.gold,
    marginBottom: 10,
    marginTop: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(247, 244, 236, 0.95)',
    borderRadius: theme.cardRadius,
    borderWidth: 1,
    borderColor: 'rgba(217, 183, 93, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: theme.text,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadowGold,
  },
  savedSection: {
    marginTop: 16,
    padding: 14,
  },
  savedLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 10,
  },
  savedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  playerList: {
    marginTop: 16,
  },
  orderHint: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: theme.muted,
    marginBottom: 12,
    lineHeight: 18,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.gold,
  },
  orderBadgeText: {
    fontFamily: fonts.sansBold,
    color: theme.ivory,
    fontSize: 13,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 2,
  },
  orderBtnDisabled: {
    opacity: 0.35,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  playerRowName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: theme.text,
  },
  startBtn: {
    marginTop: 28,
  },
  cancelBtn: {
    marginTop: 12,
  },
});
