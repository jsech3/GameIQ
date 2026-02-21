import { useState, useCallback, useEffect } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import type { PricecheckPuzzle } from './types';
import puzzleBank from './puzzles.json';

function formatValue(value: number, unit: string): string {
  if (unit === '$') return `$${value.toLocaleString()}`;
  return `${value.toLocaleString()} ${unit}`;
}


function AnimatedValue({ target, unit }: { target: number; unit: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 600;
    const steps = 20;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setDisplay(Math.min(Math.round(increment * step), target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target]);

  return <span>{formatValue(display, unit)}</span>;
}

export function Pricecheck() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<PricecheckPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('pricecheck');

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(alreadyPlayed);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; points: number }[]>(
    alreadyPlayed ? (stats.todayResult?.details?.roundResults as { correct: boolean; points: number }[] ?? []) : []
  );
  const [lastAnswer, setLastAnswer] = useState<'higher' | 'lower' | null>(null);
  const [animResult, setAnimResult] = useState<'correct' | 'wrong' | null>(null);
  const [roundKey, setRoundKey] = useState(0);

  const round = puzzle.rounds[currentRound];
  const totalRounds = puzzle.rounds.length;

  const handleGuess = useCallback((guess: 'higher' | 'lower') => {
    if (answered || finished) return;
    setAnswered(true);
    setLastAnswer(guess);

    const correctDirection = round.actualValue > round.shownValue ? 'higher' : 'lower';
    const isCorrect = guess === correctDirection;
    const points = isCorrect ? 1 : 0;

    const newResults = [...roundResults, { correct: isCorrect, points }];
    setRoundResults(newResults);
    setAnimResult(isCorrect ? 'correct' : 'wrong');
    setScore(prev => prev + points);

    setTimeout(() => {
      setAnimResult(null);
      if (currentRound + 1 >= totalRounds) {
        const finalScore = score + points;
        setFinished(true);
        recordResult({
          dayNumber: 0,
          score: finalScore,
          maxScore: 5,
          completed: finalScore >= 3,
          details: { roundResults: newResults },
        });
      } else {
        setCurrentRound(prev => prev + 1);
        setAnswered(false);
        setLastAnswer(null);
        setRoundKey(prev => prev + 1);
      }
    }, 2500);
  }, [answered, finished, round, roundResults, currentRound, totalRounds, score, recordResult]);

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold">Pricecheck</h2>
          <p className="text-surface-200 text-sm mt-1">Higher or Lower?</p>
        </div>

        {/* Round-by-round recap */}
        <div className="space-y-2">
          {puzzle.rounds.map((r, i) => {
            const res = roundResults[i];
            const correctDir = r.actualValue > r.shownValue ? 'Higher' : 'Lower';
            return (
              <div
                key={i}
                className={`p-3 rounded-xl border text-sm animate-fade-in-up ${
                  res?.correct
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold ${res?.correct ? 'text-green-400' : 'text-red-400'}`}>
                    {res?.correct ? '\u2713' : '\u2717'}
                  </span>
                  <span className="text-xs text-surface-200">{r.category}</span>
                </div>
                <p className="text-white text-sm">{r.item}</p>
                <p className="text-surface-200 text-xs mt-1">
                  Shown: {formatValue(r.shownValue, r.unit)} {'\u2192'} Actual: {formatValue(r.actualValue, r.unit)}
                  <span className="ml-1 text-surface-500">({correctDir})</span>
                </p>
              </div>
            );
          })}
        </div>

        <ResultModal
          gameId="pricecheck"
          score={score}
          maxScore={5}
          stats={stats}
          message={
            score === 5
              ? 'Perfect! You nailed every price.'
              : score >= 4
                ? 'Excellent instincts!'
                : score >= 3
                  ? 'Solid guessing! You know your stuff.'
                  : 'Tricky prices today. Try again tomorrow!'
          }
          onRestart={() => {
            setCurrentRound(0);
            setScore(0);
            setAnswered(false);
            setFinished(false);
            setRoundResults([]);
            setLastAnswer(null);
            setAnimResult(null);
            setRoundKey(prev => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold">Pricecheck</h2>
        <p className="text-surface-200 text-sm mt-1">Is the real value higher or lower?</p>
        <div className="inline-block mt-2 px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-200">
          #{puzzleNumber}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {puzzle.rounds.map((_, i) => (
          <div
            key={i}
            className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
              i < currentRound
                ? roundResults[i]?.correct
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : i === currentRound
                  ? 'bg-brand-500 animate-pulse-glow'
                  : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Round info */}
      <div
        key={`round-info-${roundKey}`}
        className="flex items-center justify-between text-xs text-surface-200 round-enter"
      >
        <span className="px-2 py-0.5 bg-surface-800 rounded-full">{round.category}</span>
        <span>{currentRound + 1} of {totalRounds}</span>
      </div>

      {/* Main card */}
      <div
        key={`round-${roundKey}`}
        className={`bg-surface-900 border border-surface-700 rounded-2xl p-6 text-center transition-all duration-300 round-enter ${
          animResult === 'correct' ? 'correct-glow border-green-500/50' : ''
        } ${animResult === 'wrong' ? 'wrong-shake border-red-500/50' : ''}`}
      >
        <p className="text-surface-200 text-sm mb-3">{round.item}</p>
        <p className="text-4xl font-extrabold mb-1">
          {formatValue(round.shownValue, round.unit)}
        </p>
        <p className="text-surface-500 text-xs">Is the real value higher or lower?</p>

        {/* Reveal actual value */}
        {answered && (
          <div className="mt-4 pt-4 border-t border-surface-700 animate-fade-in-up">
            <p className="text-surface-200 text-xs mb-1">Actual value</p>
            <p className="text-3xl font-extrabold">
              <AnimatedValue target={round.actualValue} unit={round.unit} />
            </p>
            {roundResults[roundResults.length - 1]?.correct ? (
              <div className="mt-2">
                <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-1">
                  <span className="animate-bounce-in">&#10003;</span> Correct!
                </p>
              </div>
            ) : (
              <p className="text-red-400 text-sm font-medium mt-2">
                Wrong — it was {round.actualValue > round.shownValue ? 'higher' : 'lower'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Higher / Lower buttons */}
      {!answered && (
        <div className="grid grid-cols-2 gap-3 round-enter" key={`buttons-${roundKey}`}>
          <button
            onClick={() => handleGuess('higher')}
            className="py-4 rounded-xl bg-green-600 hover:bg-green-700 font-bold text-lg btn-tap transition-all active:scale-95"
          >
            <span className="mr-1">{'\u2B06\uFE0F'}</span> Higher
          </button>
          <button
            onClick={() => handleGuess('lower')}
            className="py-4 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-lg btn-tap transition-all active:scale-95"
          >
            <span className="mr-1">{'\u2B07\uFE0F'}</span> Lower
          </button>
        </div>
      )}

      {/* Score display */}
      <div className="flex justify-center items-center gap-3">
        <div className="flex gap-1.5">
          {roundResults.map((res, i) => (
            <span
              key={i}
              className="text-lg animate-bounce-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {res.correct ? '\uD83D\uDCB0' : '\u274C'}
            </span>
          ))}
        </div>
        {roundResults.length > 0 && (
          <span className="text-surface-200 text-sm font-medium">{score}/{totalRounds}</span>
        )}
      </div>
    </div>
  );
}
