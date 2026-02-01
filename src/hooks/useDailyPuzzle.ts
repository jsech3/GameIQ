import { useMemo } from 'react';
import { getDayNumber, getPuzzleIndex } from '../utils/dates';

export function useDailyPuzzle<T>(puzzles: T[]): { puzzle: T; dayNumber: number; puzzleNumber: number } {
  const dayNumber = getDayNumber();
  return useMemo(() => {
    const idx = getPuzzleIndex(dayNumber, puzzles.length);
    return { puzzle: puzzles[idx], dayNumber, puzzleNumber: dayNumber };
  }, [dayNumber, puzzles]);
}
