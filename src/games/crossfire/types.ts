export interface CrossfireClue {
  domain: string;
  hint: string;
}

export interface CrossfireRound {
  clue1: CrossfireClue;
  clue2: CrossfireClue;
  answer: string;
  acceptedAnswers: string[];
}

export interface CrossfirePuzzle {
  id: number;
  rounds: CrossfireRound[];
}
