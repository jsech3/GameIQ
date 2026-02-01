export type GameId = 'tempo' | 'odd-angle';

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

export interface TempoEvent {
  text: string;
  year: number;
}

export interface TempoPuzzle {
  id: number;
  theme: string;
  events: TempoEvent[];
}

export interface OddAnglePuzzle {
  id: number;
  answer: string;
  acceptableAnswers: string[];
  hint: string;
  imageFolder: string;
}

export interface GameMeta {
  id: GameId;
  name: string;
  description: string;
  icon: string;
  path: string;
}
