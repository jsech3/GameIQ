import { Link, useLocation } from 'react-router-dom';
import { GameMeta } from '../types';

const GAMES: GameMeta[] = [
  { id: 'tempo', name: 'Tempo', description: 'Order events in time', icon: '\u23F1', path: '/tempo' },
  { id: 'odd-angle', name: 'Odd Angle', description: 'Guess from the zoom', icon: '\uD83D\uDD0D', path: '/odd-angle' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col">
      <header className="border-b border-surface-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-sm font-extrabold">
              IQ
            </div>
            <div>
              <span className="font-bold text-lg">GameIQ</span>
              <span className="text-xs text-surface-200 ml-1.5 hidden sm:inline">by DAITIQ</span>
            </div>
          </Link>
          <nav className="flex gap-1">
            {GAMES.map(g => (
              <Link
                key={g.id}
                to={g.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === g.path
                    ? 'bg-brand-600 text-white'
                    : 'text-surface-200 hover:bg-surface-800'
                }`}
              >
                {g.icon} {g.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">{children}</div>
      </main>

      <footer className="border-t border-surface-800 px-4 py-3 text-center text-xs text-surface-700">
        GameIQ by DAITIQ
      </footer>
    </div>
  );
}
