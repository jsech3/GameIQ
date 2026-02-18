export interface TrendRound {
  category: string;
  title: string;
  data: number[];
  hidden: number[];
  answer: 'up' | 'down' | 'flat';
  source: string;
}

export interface TrendPuzzle {
  id: number;
  rounds: TrendRound[];
}
