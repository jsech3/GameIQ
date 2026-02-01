import { useState } from 'react';
import { GameId, GameStats } from '../types';
import { buildShareText, copyToClipboard } from '../utils/share';

interface Props {
  gameId: GameId;
  score: number;
  maxScore: number;
  stats: GameStats;
  message: string;
}

export function ResultModal({ gameId, score, maxScore, stats, message }: Props) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = buildShareText(gameId, score, maxScore);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-8 bg-surface-900 border border-surface-700 rounded-2xl p-6 text-center space-y-4">
      <div className="text-4xl font-extrabold">
        {score}/{maxScore}
      </div>
      <p className="text-surface-200">{message}</p>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        <div className="bg-surface-800 rounded-xl p-3">
          <div className="text-2xl font-bold">{stats.gamesPlayed}</div>
          <div className="text-surface-200">Played</div>
        </div>
        <div className="bg-surface-800 rounded-xl p-3">
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-surface-200">Streak</div>
        </div>
        <div className="bg-surface-800 rounded-xl p-3">
          <div className="text-2xl font-bold">{stats.maxStreak}</div>
          <div className="text-surface-200">Best</div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold text-sm transition-colors"
      >
        {copied ? 'Copied!' : 'Share Result'}
      </button>
    </div>
  );
}
