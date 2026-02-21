export type GameId = 'pricecheck' | 'trend' | 'rank' | 'crossfire' | 'versus';

export interface GameResult {
  dayNumber: number;
  score: number;
  maxScore: number;
  completed: boolean;
  details: Record<string, unknown>;
}

export interface GameStats {
  currentStreak: number;
  maxStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  lastPlayedDay: number;
  todayResult: GameResult | null;
}

export interface PlayerState {
  games: Record<GameId, GameStats>;
  memberSince: string;
}

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  path: string;
}
