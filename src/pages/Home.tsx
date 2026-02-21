import { GameCard } from '../components/GameCard';
import { useGameState } from '../hooks/useGameState';
import { GameMeta, GameStats } from '../types';

const GAMES: GameMeta[] = [
  { id: 'pricecheck', name: 'Pricecheck', description: 'Guess if the real value is higher or lower', icon: '\uD83D\uDCB0', path: '/pricecheck' },
  { id: 'trend', name: 'Trend', description: 'Predict where the data goes next', icon: '\uD83D\uDCC8', path: '/trend' },
  { id: 'rank', name: 'Rank', description: 'Order items by a hidden metric', icon: '\uD83C\uDFC6', path: '/rank' },
  { id: 'crossfire', name: 'Crossfire', description: 'One word connects two clues', icon: '\uD83C\uDFAF', path: '/crossfire' },
  { id: 'versus', name: 'Versus', description: 'Pick the winner in head-to-head matchups', icon: '\u2694\uFE0F', path: '/versus' },
];

export function Home() {
  const pricecheckState = useGameState('pricecheck');
  const trendState = useGameState('trend');
  const rankState = useGameState('rank');
  const crossfireState = useGameState('crossfire');
  const versusState = useGameState('versus');

  const statsMap: Record<string, GameStats> = {
    pricecheck: pricecheckState.stats,
    trend: trendState.stats,
    rank: rankState.stats,
    crossfire: crossfireState.stats,
    versus: versusState.stats,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">GameIQ</h1>
        <p className="text-surface-200 text-sm mt-1">Daily brain games to keep you sharp</p>
      </div>

      <div className="space-y-3">
        {GAMES.map((game, i) => (
          <div
            key={game.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <GameCard game={game} stats={statsMap[game.id]} />
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-surface-700">
        New puzzles every day at midnight UTC
      </div>
    </div>
  );
}
