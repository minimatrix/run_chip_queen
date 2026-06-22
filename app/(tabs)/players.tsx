import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Check, Pencil, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeltBackground } from '@/components/ui/FeltBackground';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { PremiumEmptyState } from '@/components/ui/PremiumEmptyState';
import { PrimaryGoldButton } from '@/components/ui/PrimaryGoldButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { theme, fonts } from '@/constants/theme';
import { useAppStore } from '@/store/useAppStore';
import type { Player } from '@/lib/types';

export default function PlayersScreen() {
  const { globalPlayers, addGlobalPlayer, updateGlobalPlayer, deleteGlobalPlayer } =
    useAppStore();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    await addGlobalPlayer(name.trim());
    setName('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSaveEdit = async (player: Player) => {
    if (!editName.trim()) return;
    await updateGlobalPlayer({ ...player, name: editName.trim() });
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (player: Player) => {
    Alert.alert(
      'Delete Player',
      `Remove ${player.name} from saved players?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteGlobalPlayer(player.id),
        },
      ],
    );
  };

  return (
    <FeltBackground>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader
          title="Players"
          subtitle="Saved players for quick deal-in."
          suit="♥"
        />
        <View style={styles.addSection}>
          <TextInput
            style={styles.input}
            placeholder="Player name"
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />
          <PrimaryGoldButton
            title="Add"
            onPress={handleAdd}
            disabled={!name.trim()}
            size="medium"
            style={styles.addButton}
          />
        </View>
        {globalPlayers.length === 0 ? (
          <PremiumEmptyState
            suit="♠"
            title="No saved players"
            subtitle="Add players here to deal them in quickly at your next table."
          />
        ) : (
          <FlatList
            data={globalPlayers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <GlassPanel style={styles.row}>
                <PlayerAvatar player={item} showName={false} size="small" />
                {editingId === item.id ? (
                  <TextInput
                    style={styles.editInput}
                    value={editName}
                    onChangeText={setEditName}
                    autoFocus
                    onSubmitEditing={() => handleSaveEdit(item)}
                  />
                ) : (
                  <Text style={styles.playerName}>{item.name}</Text>
                )}
                <View style={styles.actions}>
                  {editingId === item.id ? (
                    <AnimatedPressable
                      onPress={() => handleSaveEdit(item)}
                      style={styles.iconBtn}
                    >
                      <Check size={20} color={theme.success} />
                    </AnimatedPressable>
                  ) : (
                    <AnimatedPressable
                      onPress={() => {
                        setEditingId(item.id);
                        setEditName(item.name);
                      }}
                      style={styles.iconBtn}
                    >
                      <Pencil size={18} color={theme.gold} />
                    </AnimatedPressable>
                  )}
                  <AnimatedPressable
                    onPress={() => handleDelete(item)}
                    style={styles.iconBtn}
                  >
                    <Trash2 size={18} color={theme.danger} />
                  </AnimatedPressable>
                </View>
              </GlassPanel>
            )}
          />
        )}
      </SafeAreaView>
    </FeltBackground>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  addSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
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
  addButton: {
    minWidth: 80,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  playerName: {
    flex: 1,
    fontFamily: fonts.sansBold,
    fontSize: 16,
    color: theme.text,
  },
  editInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: theme.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.gold,
    paddingVertical: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
  },
});
