import { GameCard } from '../components/GameCard';
import { useGameState } from '../hooks/useGameState';
import { GameMeta } from '../types';

const GAMES: GameMeta[] = [
  { id: 'blindspot', name: 'Blindspot', description: 'Find the wrong word in each statement', icon: '\uD83D\uDCA1', path: '/blindspot' },
  { id: 'odd-angle', name: 'Odd Angle', description: 'Guess what you see as it zooms out', icon: '\uD83D\uDD0D', path: '/odd-angle' },
];

export function Home() {
  const blindspotState = useGameState('blindspot');
  const oddAngleState = useGameState('odd-angle');
  const statsMap = { blindspot: blindspotState.stats, 'odd-angle': oddAngleState.stats };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold">GameIQ</h1>
        <p className="text-surface-200 text-sm mt-1">Daily brain games to keep you sharp</p>
      </div>

      <div className="space-y-3">
        {GAMES.map(game => (
          <GameCard key={game.id} game={game} stats={statsMap[game.id]} />
        ))}
      </div>

      <div className="text-center text-xs text-surface-700">
        New puzzles every day at midnight UTC
      </div>
    </div>
  );
}
