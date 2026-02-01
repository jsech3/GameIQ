import { GameId } from '../types';
import { getDayNumber } from './dates';

export function buildShareText(gameId: GameId, score: number, maxScore: number): string {
  const dayNum = getDayNumber();

  if (gameId === 'tempo') {
    const icons = Array.from({ length: maxScore }, (_, i) =>
      i < score ? '\u2B06\uFE0F' : '\u2B07\uFE0F'
    ).join('');
    return `Tempo #${dayNum} — ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
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
