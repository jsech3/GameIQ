export interface RankItem {
  name: string;
  value: number;
}

export interface RankPuzzle {
  id: number;
  category: string;
  question: string;
  items: RankItem[];
}
