import { useState, useCallback } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBank from './puzzles.json';
import { OddAnglePuzzle } from '../../types';

const MAX_LEVELS = 6;

export function OddAngle() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<OddAnglePuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('odd-angle');

  const [level, setLevel] = useState(alreadyPlayed ? MAX_LEVELS : 1);
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [solved, setSolved] = useState(alreadyPlayed && (stats.todayResult?.completed ?? false));
  const [failed, setFailed] = useState(alreadyPlayed && !(stats.todayResult?.completed ?? false));
  const [showHint, setShowHint] = useState(false);

  const isCorrect = (input: string): boolean => {
    const normalized = input.trim().toLowerCase();
    return puzzle.acceptableAnswers.some(a => a.toLowerCase() === normalized);
  };

  const handleGuess = useCallback(() => {
    if (!guess.trim()) return;
    const trimmed = guess.trim();
    setGuesses(prev => [...prev, trimmed]);
    setGuess('');

    if (isCorrect(trimmed)) {
      setSolved(true);
      const score = MAX_LEVELS - level + 1; // Higher score = solved with fewer reveals
      recordResult({
        dayNumber: 0,
        score: level, // Level they solved it on (1 = best)
        maxScore: MAX_LEVELS,
        completed: true,
        details: { guesses: [...guesses, trimmed], level },
      });
    } else if (level >= MAX_LEVELS) {
      setFailed(true);
      recordResult({
        dayNumber: 0,
        score: 0,
        maxScore: MAX_LEVELS,
        completed: false,
        details: { guesses: [...guesses, trimmed], level },
      });
    } else {
      setLevel(prev => prev + 1);
    }
  }, [guess, guesses, level, puzzle, recordResult]);

  const handleSkip = () => {
    if (level >= MAX_LEVELS) {
      setFailed(true);
      recordResult({
        dayNumber: 0,
        score: 0,
        maxScore: MAX_LEVELS,
        completed: false,
        details: { guesses, level },
      });
    } else {
      setLevel(prev => prev + 1);
    }
  };

  const done = solved || failed;

  // Placeholder image — real images go in public/images/puzzles/{folder}/level-{n}.jpg
  // For now, show a gradient placeholder with level indicator
  const imageSrc = `/images/puzzles/${puzzle.imageFolder}/level-${level}.jpg`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Odd Angle</h2>
        <p className="text-surface-200 text-sm mt-1">
          What are you looking at?
        </p>
        <div className="inline-block mt-2 px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-200">
          #{puzzleNumber}
        </div>
      </div>

      {/* Zoom level indicator */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: MAX_LEVELS }, (_, i) => (
          <div
            key={i}
            className={`w-8 h-1.5 rounded-full transition-colors ${
              i < level
                ? solved
                  ? 'bg-green-500'
                  : failed
                    ? 'bg-red-500'
                    : 'bg-brand-500'
                : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Image area */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-900 border border-surface-700">
        <img
          src={imageSrc}
          alt="Puzzle"
          className="w-full h-full object-cover"
          onError={e => {
            // Fallback: show placeholder if image doesn't exist yet
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
          }}
        />
        {/* Placeholder shown when images aren't loaded */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-900">
          <div className="text-center">
            <div className="text-6xl mb-3">{'\uD83D\uDD0D'}</div>
            <p className="text-surface-200 text-sm">Zoom level {level}/{MAX_LEVELS}</p>
            <p className="text-surface-700 text-xs mt-1">(Add images to public/images/puzzles/)</p>
          </div>
        </div>
      </div>

      {/* Guesses history */}
      {guesses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {guesses.map((g, i) => (
            <span
              key={i}
              className={`text-xs px-2.5 py-1 rounded-full ${
                solved && i === guesses.length - 1
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-surface-800 text-surface-200 line-through'
              }`}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {!done && (
        <>
          {/* Hint */}
          {level >= 3 && (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-brand-500 hover:underline"
            >
              {showHint ? `Hint: ${puzzle.hint}` : 'Need a hint?'}
            </button>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              placeholder="What is it?"
              className="flex-1 px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-white placeholder-surface-200 text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={handleGuess}
              disabled={!guess.trim()}
              className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 font-semibold text-sm transition-colors"
            >
              Guess
            </button>
          </div>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-sm text-surface-200 hover:text-white transition-colors"
          >
            Skip &mdash; reveal more
          </button>
        </>
      )}

      {/* Answer reveal on failure */}
      {failed && (
        <div className="text-center p-4 bg-surface-900 border border-surface-700 rounded-xl">
          <p className="text-surface-200 text-sm">The answer was</p>
          <p className="text-xl font-bold mt-1">{puzzle.answer}</p>
        </div>
      )}

      {done && (
        <ResultModal
          gameId="odd-angle"
          score={solved ? level : 0}
          maxScore={MAX_LEVELS}
          stats={stats}
          message={
            solved
              ? level === 1
                ? 'Incredible! Got it from the tightest crop!'
                : level <= 3
                  ? 'Sharp eye! Spotted it early.'
                  : 'Got there in the end!'
              : 'Tough one. Try again tomorrow!'
          }
        />
      )}
    </div>
  );
}
