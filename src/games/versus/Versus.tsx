import { useState, useCallback, useEffect } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import type { VersusPuzzle } from './types';
import puzzleBank from './puzzles.json';

function formatValue(value: number, unit: string): string {
  if (unit === '$') return `$${value.toLocaleString()}`;
  if (unit === '') return value.toLocaleString();
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

export function Versus() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<VersusPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('versus');

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(alreadyPlayed);
  const [roundResults, setRoundResults] = useState<{ correct: boolean; points: number }[]>(
    alreadyPlayed ? (stats.todayResult?.details?.roundResults as { correct: boolean; points: number }[] ?? []) : []
  );
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);
  const [animResult, setAnimResult] = useState<'correct' | 'wrong' | null>(null);
  const [roundKey, setRoundKey] = useState(0);

  const round = puzzle.rounds[currentRound];
  const totalRounds = puzzle.rounds.length;

  const handlePick = useCallback((pick: 'A' | 'B') => {
    if (answered || finished) return;
    setAnswered(true);
    setSelectedOption(pick);

    const aVal = round.optionA.value;
    const bVal = round.optionB.value;
    const higherWins = round.higherWins !== false;
    const correctPick = higherWins
      ? (aVal >= bVal ? 'A' : 'B')
      : (aVal <= bVal ? 'A' : 'B');
    const isCorrect = pick === correctPick;
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
        setSelectedOption(null);
        setRoundKey(prev => prev + 1);
      }
    }, 2500);
  }, [answered, finished, round, roundResults, currentRound, totalRounds, score, recordResult]);

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold">Versus</h2>
          <p className="text-surface-200 text-sm mt-1">Which one wins?</p>
        </div>

        {/* Round-by-round recap */}
        <div className="space-y-2">
          {puzzle.rounds.map((r, i) => {
            const res = roundResults[i];
            const hw = r.higherWins !== false;
            const winner = hw
              ? (r.optionA.value >= r.optionB.value ? r.optionA : r.optionB)
              : (r.optionA.value <= r.optionB.value ? r.optionA : r.optionB);
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
                <p className="text-white text-sm">{r.metric}</p>
                <p className="text-surface-200 text-xs mt-1">
                  {r.optionA.name}: {formatValue(r.optionA.value, r.optionA.unit)} vs {r.optionB.name}: {formatValue(r.optionB.value, r.optionB.unit)}
                  <span className="ml-1 text-surface-500">({winner.name} wins)</span>
                </p>
              </div>
            );
          })}
        </div>

        <ResultModal
          gameId="versus"
          score={score}
          maxScore={5}
          stats={stats}
          message={
            score === 5
              ? 'Flawless!'
              : score >= 4
                ? 'Excellent instincts!'
                : score >= 3
                  ? 'Solid picks!'
                  : 'Tough matchups today.'
          }
          onRestart={() => {
            setCurrentRound(0);
            setScore(0);
            setAnswered(false);
            setFinished(false);
            setRoundResults([]);
            setSelectedOption(null);
            setAnimResult(null);
            setRoundKey(prev => prev + 1);
          }}
        />
      </div>
    );
  }

  const higherWins = round.higherWins !== false;
  const aCorrect = higherWins
    ? round.optionA.value >= round.optionB.value
    : round.optionA.value <= round.optionB.value;

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold">Versus</h2>
        <p className="text-surface-200 text-sm mt-1">Which one wins?</p>
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

      {/* Metric question */}
      <div
        key={`metric-${roundKey}`}
        className="text-center round-enter"
      >
        <p className="text-lg font-semibold text-white">{round.metric}</p>
      </div>

      {/* Two option cards */}
      <div
        key={`cards-${roundKey}`}
        className="grid grid-cols-2 gap-3 round-enter"
      >
        {/* Option A */}
        <button
          onClick={() => handlePick('A')}
          disabled={answered}
          className={`relative p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
            !answered
              ? 'bg-surface-900 border-surface-700 hover:border-brand-500 hover:bg-surface-800 btn-tap active:scale-95 cursor-pointer'
              : selectedOption === 'A'
                ? aCorrect
                  ? 'bg-green-500/10 border-green-500 correct-glow'
                  : 'bg-red-500/10 border-red-500 wrong-shake'
                : aCorrect
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-surface-900 border-surface-700 opacity-60'
          }`}
        >
          <p className="text-lg font-bold mb-2">{round.optionA.name}</p>
          {answered && (
            <div className="animate-fade-in-up">
              <p className="text-2xl font-extrabold">
                <AnimatedValue target={round.optionA.value} unit={round.optionA.unit} />
              </p>
              {aCorrect && (
                <p className="text-green-400 text-xs font-medium mt-1">Winner</p>
              )}
            </div>
          )}
          {!answered && (
            <p className="text-surface-500 text-sm">Tap to pick</p>
          )}
        </button>

        {/* Option B */}
        <button
          onClick={() => handlePick('B')}
          disabled={answered}
          className={`relative p-5 rounded-2xl border-2 text-center transition-all duration-300 ${
            !answered
              ? 'bg-surface-900 border-surface-700 hover:border-brand-500 hover:bg-surface-800 btn-tap active:scale-95 cursor-pointer'
              : selectedOption === 'B'
                ? !aCorrect
                  ? 'bg-green-500/10 border-green-500 correct-glow'
                  : 'bg-red-500/10 border-red-500 wrong-shake'
                : !aCorrect
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-surface-900 border-surface-700 opacity-60'
          }`}
        >
          <p className="text-lg font-bold mb-2">{round.optionB.name}</p>
          {answered && (
            <div className="animate-fade-in-up">
              <p className="text-2xl font-extrabold">
                <AnimatedValue target={round.optionB.value} unit={round.optionB.unit} />
              </p>
              {!aCorrect && (
                <p className="text-green-400 text-xs font-medium mt-1">Winner</p>
              )}
            </div>
          )}
          {!answered && (
            <p className="text-surface-500 text-sm">Tap to pick</p>
          )}
        </button>
      </div>

      {/* Result feedback */}
      {answered && (
        <div className="text-center animate-fade-in">
          {roundResults[roundResults.length - 1]?.correct ? (
            <p className="text-green-400 text-sm font-medium flex items-center justify-center gap-1">
              <span className="animate-bounce-in">&#10003;</span> Correct!
            </p>
          ) : (
            <p className="text-red-400 text-sm font-medium">
              Wrong pick!
            </p>
          )}
        </div>
      )}

      {/* VS divider between cards */}
      <div className="flex justify-center items-center -mt-3">
        <div className="flex gap-1.5">
          {roundResults.map((res, i) => (
            <span
              key={i}
              className="text-lg animate-bounce-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {res.correct ? '\u2694\uFE0F' : '\u274C'}
            </span>
          ))}
        </div>
        {roundResults.length > 0 && (
          <span className="text-surface-200 text-sm font-medium ml-3">{score}/{totalRounds}</span>
        )}
      </div>
    </div>
  );
}
