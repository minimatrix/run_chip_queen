import { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { PlayerChip } from '@/components/PlayerChip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { theme } from '@/constants/theme';
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
    <View style={styles.container}>
      <AppHeader
        title="Players"
        subtitle="Manage saved players for quick reuse."
      />
      <View style={styles.addSection}>
        <TextInput
          style={styles.input}
          placeholder="Player name"
          placeholderTextColor={theme.textMuted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
        />
        <PrimaryButton
          title="Add"
          onPress={handleAdd}
          disabled={!name.trim()}
          style={styles.addButton}
        />
      </View>
      {globalPlayers.length === 0 ? (
        <EmptyState
          icon="person-add-outline"
          title="No saved players"
          subtitle="Add players here to reuse them in new games."
        />
      ) : (
        <FlatList
          data={globalPlayers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <PlayerChip player={item} showName={false} size="small" />
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
                  <Pressable
                    onPress={() => handleSaveEdit(item)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="checkmark" size={20} color={theme.success} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={() => {
                      setEditingId(item.id);
                      setEditName(item.name);
                    }}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="pencil" size={18} color={theme.emerald} />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => handleDelete(item)}
                  style={styles.iconBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.danger} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  addSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: theme.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    backgroundColor: theme.white,
    borderRadius: theme.cardRadius,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
    ...theme.shadow,
  },
  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginLeft: 4,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text,
    borderBottomWidth: 1,
    borderBottomColor: theme.emerald,
    paddingVertical: 4,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 8,
  },
});
