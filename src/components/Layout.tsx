import { Link, useLocation } from 'react-router-dom';
import { GameMeta } from '../types';

const GAMES: GameMeta[] = [
  { id: 'pricecheck', name: 'Pricecheck', description: 'Higher or lower?', icon: '\uD83D\uDCB0', path: '/pricecheck' },
  { id: 'trend', name: 'Trend', description: 'Predict the graph', icon: '\uD83D\uDCC8', path: '/trend' },
  { id: 'rank', name: 'Rank', description: 'Order items correctly', icon: '\uD83C\uDFC6', path: '/rank' },
  { id: 'crossfire', name: 'Crossfire', description: 'Find the word', icon: '\uD83C\uDFAF', path: '/crossfire' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col">
      <header className="border-b border-surface-800 px-4 py-3 sticky top-0 z-50 bg-surface-950/95 backdrop-blur-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-sm font-extrabold group-hover:scale-110 transition-transform duration-200">
              IQ
            </div>
            <span className="font-bold text-lg hidden sm:inline">GameIQ</span>
          </Link>
          <nav className="flex gap-1">
            {GAMES.map(g => (
              <Link
                key={g.id}
                to={g.path}
                title={g.name}
                className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap btn-tap ${
                  location.pathname === g.path
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20'
                    : 'text-surface-200 hover:bg-surface-800 hover:text-white'
                }`}
              >
                <span>{g.icon}</span>
                <span className="hidden md:inline ml-1">{g.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div key={location.pathname} className="max-w-lg mx-auto page-transition">
          {children}
        </div>
      </main>

      <footer className="border-t border-surface-800 px-4 py-3 text-center text-xs text-surface-700">
        GameIQ by DAITIQ
      </footer>
    </div>
  );
}
