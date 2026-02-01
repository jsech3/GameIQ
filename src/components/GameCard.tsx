import { Link } from 'react-router-dom';
import { GameMeta, GameStats } from '../types';
import { getDayNumber } from '../utils/dates';

interface Props {
  game: GameMeta;
  stats: GameStats;
}

export function GameCard({ game, stats }: Props) {
  const played = stats.lastPlayedDay === getDayNumber();

  return (
    <Link
      to={game.path}
      className="block bg-surface-900 border border-surface-800 rounded-2xl p-5 hover:border-brand-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{game.icon}</div>
          <div>
            <h3 className="font-bold text-lg">{game.name}</h3>
            <p className="text-sm text-surface-200">{game.description}</p>
          </div>
        </div>
        <div className="text-right">
          {played ? (
            <div className="text-xs bg-brand-600/20 text-brand-500 px-2.5 py-1 rounded-full font-medium">
              {stats.todayResult?.score}/{stats.todayResult?.maxScore}
            </div>
          ) : (
            <div className="text-xs bg-surface-800 text-surface-200 px-2.5 py-1 rounded-full font-medium">
              Play
            </div>
          )}
          {stats.currentStreak > 0 && (
            <div className="text-xs text-surface-200 mt-1">
              {stats.currentStreak} day streak
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
