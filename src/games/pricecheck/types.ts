export interface PricecheckRound {
  category: string;
  item: string;
  shownValue: number;
  actualValue: number;
  unit: string;
}

export interface PricecheckPuzzle {
  id: number;
  rounds: PricecheckRound[];
}
