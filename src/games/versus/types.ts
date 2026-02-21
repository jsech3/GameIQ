export interface VersusRound {
  category: string;
  metric: string;
  optionA: { name: string; value: number; unit: string };
  optionB: { name: string; value: number; unit: string };
  higherWins: boolean;
}

export interface VersusPuzzle {
  id: number;
  rounds: VersusRound[];
}
