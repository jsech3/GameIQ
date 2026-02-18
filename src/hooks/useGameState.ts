import { useState, useCallback } from 'react';
import { GameId, GameResult, GameStats, PlayerState } from '../types';
import { getDayNumber } from '../utils/dates';

const STORAGE_KEY = 'gameiq_state';

function defaultStats(): GameStats {
  return {
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    lastPlayedDay: -1,
    todayResult: null,
  };
}

function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure all games have stats (handles new games added after initial load)
      return {
        ...parsed,
        games: {
          blindspot: parsed.games?.blindspot ?? defaultStats(),
          trend: parsed.games?.trend ?? defaultStats(),
          rank: parsed.games?.rank ?? defaultStats(),
          crossfire: parsed.games?.crossfire ?? defaultStats(),
        },
      };
    }
  } catch { /* ignore */ }
  return {
    games: {
      blindspot: defaultStats(),
      trend: defaultStats(),
      rank: defaultStats(),
      crossfire: defaultStats(),
    },
    memberSince: new Date().toISOString(),
  };
}

function saveState(state: PlayerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useGameState(gameId: GameId) {
  const [state, setState] = useState<PlayerState>(loadState);
  const stats = state.games[gameId] ?? defaultStats();
  const dayNumber = getDayNumber();
  const alreadyPlayed = stats.lastPlayedDay === dayNumber;

  const recordResult = useCallback((result: GameResult) => {
    setState(prev => {
      const gs = prev.games[gameId] ?? defaultStats();
      const isConsecutive = gs.lastPlayedDay === dayNumber - 1;
      const newStreak = isConsecutive ? gs.currentStreak + 1 : 1;

      const updated: GameStats = {
        currentStreak: newStreak,
        maxStreak: Math.max(gs.maxStreak, newStreak),
        gamesPlayed: gs.gamesPlayed + 1,
        gamesWon: gs.gamesWon + (result.completed ? 1 : 0),
        lastPlayedDay: dayNumber,
        todayResult: result,
      };

      const next: PlayerState = {
        ...prev,
        games: { ...prev.games, [gameId]: updated },
      };
      saveState(next);
      return next;
    });
  }, [gameId, dayNumber]);

  return { stats, alreadyPlayed, recordResult, dayNumber };
}
