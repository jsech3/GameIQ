import { GameId } from '../types';
import { getDayNumber } from './dates';

export function buildShareText(gameId: GameId, score: number, maxScore: number): string {
  const dayNum = getDayNumber();

  if (gameId === 'blindspot') {
    const icons = Array.from({ length: maxScore }, (_, i) =>
      i < score ? '\uD83D\uDFE9' : '\uD83D\uDFE5'
    ).join('');
    return `Blindspot #${dayNum} — ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
  }

  if (gameId === 'odd-angle') {
    const icons = Array.from({ length: score }, () => '\uD83D\uDD0D').join('');
    return `Odd Angle #${dayNum} — ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
  }

  return '';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
