import { useState, useEffect, useRef } from 'react';
import { GameId, GameStats } from '../types';
import { buildShareText, copyToClipboard } from '../utils/share';

interface Props {
  gameId: GameId;
  score: number;
  maxScore: number;
  stats: GameStats;
  message: string;
  onRestart?: () => void;
}

const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

function Confetti({ count = 50 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    size: 8 + Math.random() * 8,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedScore({ score, maxScore }: { score: number; maxScore: number }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const duration = 600;
    const steps = 20;
    const increment = score / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), score);
      setDisplayScore(current);

      if (step >= steps) {
        clearInterval(timer);
        setAnimationComplete(true);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className={`text-5xl font-extrabold ${animationComplete ? 'score-animate' : ''}`}>
      <span className={score === maxScore ? 'text-green-400' : ''}>{displayScore}</span>
      <span className="text-surface-700">/</span>
      <span className="text-surface-200">{maxScore}</span>
    </div>
  );
}

export function ResultModal({ gameId, score, maxScore, stats, message, onRestart }: Props) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPerfect = score === maxScore;

  useEffect(() => {
    if (isPerfect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isPerfect]);

  const handleShare = async () => {
    const text = buildShareText(gameId, score, maxScore);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative mt-8 bg-surface-900 border border-surface-700 rounded-2xl p-6 text-center space-y-4 animate-fade-in-up overflow-hidden"
    >
      {showConfetti && <Confetti count={60} />}

      <AnimatedScore score={score} maxScore={maxScore} />

      {isPerfect && (
        <div className="text-2xl animate-bounce-in">&#127881;</div>
      )}

      <p className="text-surface-200 animate-fade-in" style={{ animationDelay: '0.3s' }}>{message}</p>

      <div className="grid grid-cols-3 gap-3 text-center text-sm">
        {[
          { value: stats.gamesPlayed, label: 'Played' },
          { value: stats.currentStreak, label: 'Streak', highlight: stats.currentStreak > 0 },
          { value: stats.maxStreak, label: 'Best' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="bg-surface-800 rounded-xl p-3 animate-fade-in-up"
            style={{ animationDelay: `${0.4 + i * 0.1}s` }}
          >
            <div className={`text-2xl font-bold ${stat.highlight ? 'text-orange-400' : ''}`}>
              {stat.highlight && <span className="mr-1">&#128293;</span>}
              {stat.value}
            </div>
            <div className="text-surface-200">{stat.label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold text-sm btn-tap transition-all animate-fade-in-up"
        style={{ animationDelay: '0.7s' }}
      >
        {copied ? (
          <span className="flex items-center justify-center gap-2">
            <span>&#10003;</span> Copied!
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <span>&#128279;</span> Share Result
          </span>
        )}
      </button>

      {onRestart && (
        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-surface-800 hover:bg-surface-700 font-semibold text-sm btn-tap transition-all animate-fade-in-up"
          style={{ animationDelay: '0.8s' }}
        >
          Restart
        </button>
      )}
    </div>
  );
}
