import { create } from 'zustand';
import { getDatabase, resetDatabase } from '@/lib/db';
import {
  deletePlayer as dbDeletePlayer,
  deleteRound as dbDeleteRound,
  finishGame as dbFinishGame,
  generateId,
  getAllGames,
  getAllPlayers,
  getGame,
  getGamePlayers,
  getGameRounds,
  getRound,
  getSettings,
  insertGame,
  insertPlayer,
  insertRound,
  updatePlayer as dbUpdatePlayer,
  updateRound as dbUpdateRound,
  updateSettings as dbUpdateSettings,
} from '@/lib/db/queries';
import { pickPlayerColor } from '@/lib/colors';
import type {
  AppSettings,
  Game,
  GameWithMeta,
  Player,
  Round,
} from '@/lib/types';

type AppStore = {
  initialized: boolean;
  games: GameWithMeta[];
  globalPlayers: Player[];
  settings: AppSettings;
  activeGame: Game | null;
  activeGamePlayers: Player[];
  activeGameRounds: Round[];

  init: () => Promise<void>;
  refreshGames: () => Promise<void>;
  refreshGlobalPlayers: () => Promise<void>;
  loadGame: (gameId: string) => Promise<void>;
  clearActiveGame: () => void;
  createGame: (
    name: string,
    stakePerPotPence: number,
    playerNames: string[],
    startingBalancePence: number,
  ) => Promise<string>;
  finishGame: (gameId: string) => Promise<void>;
  saveRound: (round: Omit<Round, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  deleteRound: (roundId: string) => Promise<void>;
  addGlobalPlayer: (name: string) => Promise<Player>;
  updateGlobalPlayer: (player: Player) => Promise<void>;
  deleteGlobalPlayer: (playerId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  clearAllData: () => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  initialized: false,
  games: [],
  globalPlayers: [],
  settings: { currency: 'GBP', stakeIncrement: 5, defaultStartingBalancePence: 600, startingBalanceIncrement: 50 },
  activeGame: null,
  activeGamePlayers: [],
  activeGameRounds: [],

  init: async () => {
    const db = await getDatabase();
    const settings = await getSettings(db);
    const games = await getAllGames(db);
    const globalPlayers = await getAllPlayers(db);
    set({ initialized: true, settings, games, globalPlayers });
  },

  refreshGames: async () => {
    const db = await getDatabase();
    const games = await getAllGames(db);
    set({ games });
  },

  refreshGlobalPlayers: async () => {
    const db = await getDatabase();
    const globalPlayers = await getAllPlayers(db);
    set({ globalPlayers });
  },

  loadGame: async (gameId: string) => {
    const db = await getDatabase();
    const game = await getGame(db, gameId);
    if (!game) return;

    const [players, rounds] = await Promise.all([
      getGamePlayers(db, gameId),
      getGameRounds(db, gameId),
    ]);

    set({
      activeGame: game,
      activeGamePlayers: players,
      activeGameRounds: rounds,
    });
  },

  clearActiveGame: () => {
    set({
      activeGame: null,
      activeGamePlayers: [],
      activeGameRounds: [],
    });
  },

  createGame: async (name, stakePerPotPence, playerNames, startingBalancePence) => {
    const db = await getDatabase();
    const existingPlayers = await getAllPlayers(db);
    const playerIds: string[] = [];
    const usedColors = existingPlayers.map((p) => p.color);

    for (const playerName of playerNames) {
      const existing = existingPlayers.find(
        (p) => p.name.toLowerCase() === playerName.toLowerCase(),
      );
      if (existing) {
        playerIds.push(existing.id);
      } else {
        const color = pickPlayerColor(usedColors);
        usedColors.push(color);
        const player: Player = {
          id: generateId(),
          name: playerName.trim(),
          color,
        };
        await insertPlayer(db, player);
        playerIds.push(player.id);
        existingPlayers.push(player);
      }
    }

    const game: Game = {
      id: generateId(),
      name: name.trim(),
      stakePerPotPence,
      startingBalancePence,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await insertGame(db, game, playerIds);
    await get().refreshGames();
    await get().refreshGlobalPlayers();
    return game.id;
  },

  finishGame: async (gameId: string) => {
    const db = await getDatabase();
    await dbFinishGame(db, gameId);
    await get().refreshGames();
    if (get().activeGame?.id === gameId) {
      await get().loadGame(gameId);
    }
  },

  saveRound: async (roundData) => {
    const db = await getDatabase();
    const { activeGame, activeGameRounds } = get();
    if (!activeGame) return;

    if (roundData.id) {
      const existing = await getRound(db, roundData.id);
      if (existing) {
        const updated: Round = {
          ...existing,
          runWinnerId: roundData.runWinnerId,
          chipWinnerId: roundData.chipWinnerId,
          queenWinnerId: roundData.queenWinnerId,
          notes: roundData.notes,
        };
        await dbUpdateRound(db, updated);
      }
    } else {
      const round: Round = {
        id: generateId(),
        gameId: activeGame.id,
        roundNumber: roundData.roundNumber,
        runWinnerId: roundData.runWinnerId,
        chipWinnerId: roundData.chipWinnerId,
        queenWinnerId: roundData.queenWinnerId,
        notes: roundData.notes,
        createdAt: new Date().toISOString(),
      };
      await insertRound(db, round);
    }

    const rounds = await getGameRounds(db, activeGame.id);
    set({ activeGameRounds: rounds });
  },

  deleteRound: async (roundId: string) => {
    const db = await getDatabase();
    const { activeGame } = get();
    if (!activeGame) return;

    await dbDeleteRound(db, roundId);
    const rounds = await getGameRounds(db, activeGame.id);
    set({ activeGameRounds: rounds });
  },

  addGlobalPlayer: async (name: string) => {
    const db = await getDatabase();
    const existing = await getAllPlayers(db);
    const player: Player = {
      id: generateId(),
      name: name.trim(),
      color: pickPlayerColor(existing.map((p) => p.color)),
    };
    await insertPlayer(db, player);
    await get().refreshGlobalPlayers();
    return player;
  },

  updateGlobalPlayer: async (player: Player) => {
    const db = await getDatabase();
    await dbUpdatePlayer(db, player);
    await get().refreshGlobalPlayers();
    if (get().activeGame) {
      await get().loadGame(get().activeGame!.id);
    }
  },

  deleteGlobalPlayer: async (playerId: string) => {
    const db = await getDatabase();
    await dbDeletePlayer(db, playerId);
    await get().refreshGlobalPlayers();
  },

  updateSettings: async (settings) => {
    const db = await getDatabase();
    await dbUpdateSettings(db, settings);
    const updated = await getSettings(db);
    set({ settings: updated });
  },

  clearAllData: async () => {
    await resetDatabase();
    const db = await getDatabase();
    const settings = await getSettings(db);
    const games = await getAllGames(db);
    const globalPlayers = await getAllPlayers(db);
    set({
      games,
      globalPlayers,
      settings,
      activeGame: null,
      activeGamePlayers: [],
      activeGameRounds: [],
    });
  },
}));
