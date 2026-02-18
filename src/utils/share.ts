import { GameId } from '../types';
import { getDayNumber } from './dates';

export function buildShareText(gameId: GameId, score: number, maxScore: number): string {
  const dayNum = getDayNumber();

  if (gameId === 'pricecheck') {
    const roundCount = 5;
    const icons = Array.from({ length: roundCount }, (_, i) => {
      const threshold = (i + 1) * (maxScore / roundCount);
      return score >= threshold ? '\uD83D\uDCB0' : '\u274C';
    }).join('');
    return `Pricecheck #${dayNum} \u2014 ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
  }

  if (gameId === 'trend') {
    const icons = Array.from({ length: maxScore }, (_, i) =>
      i < score ? '\uD83D\uDCC8' : '\uD83D\uDCC9'
    ).join('');
    return `Trend #${dayNum} \u2014 ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
  }

  if (gameId === 'rank') {
    const icons = Array.from({ length: maxScore }, (_, i) =>
      i < score ? '\u2B06\uFE0F' : '\u2B07\uFE0F'
    ).join('');
    return `Rank #${dayNum} \u2014 ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
  }

  if (gameId === 'crossfire') {
    const icons = Array.from({ length: maxScore }, (_, i) =>
      i < score ? '\uD83C\uDFAF' : '\u274C'
    ).join('');
    return `Crossfire #${dayNum} \u2014 ${score}/${maxScore} ${icons}\nhttps://gameiq.daitiq.com`;
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
