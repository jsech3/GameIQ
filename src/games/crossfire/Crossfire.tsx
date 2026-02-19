import { useState, useCallback, useRef, useEffect } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBank from './puzzles.json';
import { CrossfirePuzzle, CrossfireRound } from './types';

function ClueCard({
  domain,
  hint,
  side,
}: {
  domain: string;
  hint: string;
  side: 'left' | 'right';
}) {
  return (
    <div
      className={`flex-1 p-4 rounded-xl bg-surface-800 border border-surface-700 ${
        side === 'left' ? 'text-left' : 'text-right'
      }`}
    >
      <div className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-1">
        {domain}
      </div>
      <div className="text-white font-medium">{hint}</div>
    </div>
  );
}

function CrossfireInput({
  value,
  onChange,
  onSubmit,
  disabled,
  isCorrect,
  isWrong,
}: {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit();
    }
  };

  let inputClassName =
    'w-full px-4 py-3 text-center text-xl font-bold uppercase tracking-widest rounded-xl border-2 transition-all duration-200 outline-none ';

  if (isCorrect) {
    inputClassName +=
      'bg-green-500/20 border-green-500 text-green-400 correct-glow';
  } else if (isWrong) {
    inputClassName += 'bg-red-500/20 border-red-500 text-red-400 wrong-shake';
  } else {
    inputClassName +=
      'bg-surface-900 border-surface-700 text-white focus:border-brand-500';
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value.toUpperCase())}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="TYPE YOUR ANSWER"
      className={inputClassName}
      autoComplete="off"
      autoCapitalize="characters"
    />
  );
}

export function Crossfire() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<CrossfirePuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('crossfire');

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(
    alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0
  );
  const [inputValue, setInputValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(alreadyPlayed);
  const [roundResults, setRoundResults] = useState<boolean[]>(
    alreadyPlayed
      ? ((stats.todayResult?.details?.roundResults as boolean[]) ?? [])
      : []
  );
  const [animatingResult, setAnimatingResult] = useState<
    'correct' | 'wrong' | null
  >(null);
  const [roundKey, setRoundKey] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(
    alreadyPlayed
      ? ((stats.todayResult?.details?.userAnswers as string[]) ?? [])
      : []
  );

  const round = puzzle.rounds[currentRound];
  const totalRounds = puzzle.rounds.length;

  const checkAnswer = useCallback(
    (answer: string, roundData: CrossfireRound) => {
      const normalizedAnswer = answer.trim().toUpperCase();
      return roundData.acceptedAnswers.some(
        (accepted) => accepted.toUpperCase() === normalizedAnswer
      );
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || revealed || finished) return;

    setRevealed(true);
    const isCorrect = checkAnswer(inputValue, round);
    const newResults = [...roundResults, isCorrect];
    const newAnswers = [...userAnswers, inputValue.trim().toUpperCase()];
    setRoundResults(newResults);
    setUserAnswers(newAnswers);
    setAnimatingResult(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setTimeout(() => {
      setAnimatingResult(null);
      if (currentRound + 1 >= totalRounds) {
        const finalScore = isCorrect ? score + 1 : score;
        setFinished(true);
        recordResult({
          dayNumber: 0,
          score: finalScore,
          maxScore: totalRounds,
          completed: finalScore >= 3,
          details: { roundResults: newResults, userAnswers: newAnswers },
        });
      } else {
        setCurrentRound((prev) => prev + 1);
        setInputValue('');
        setRevealed(false);
        setRoundKey((prev) => prev + 1);
      }
    }, 2000);
  }, [
    inputValue,
    revealed,
    finished,
    round,
    roundResults,
    userAnswers,
    currentRound,
    totalRounds,
    score,
    recordResult,
    checkAnswer,
  ]);

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold">Crossfire</h2>
          <p className="text-surface-200 text-sm mt-1">Find the connecting word</p>
        </div>

        {/* Round-by-round recap */}
        <div className="space-y-2">
          {puzzle.rounds.map((r, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border text-sm animate-fade-in-up ${
                roundResults[i]
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-surface-200">
                  <span className="bg-surface-700 px-2 py-0.5 rounded">
                    {r.clue1.domain}
                  </span>
                  <span>+</span>
                  <span className="bg-surface-700 px-2 py-0.5 rounded">
                    {r.clue2.domain}
                  </span>
                </div>
                <span
                  className={`text-xs font-bold ${
                    roundResults[i] ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {roundResults[i] ? '\u2713' : '\u2717'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-surface-200 text-xs">
                  {r.clue1.hint} / {r.clue2.hint}
                </span>
                <span className="font-bold text-brand-500">{r.answer}</span>
              </div>
              {!roundResults[i] && userAnswers[i] && (
                <div className="text-xs text-red-400 mt-1">
                  You answered: {userAnswers[i]}
                </div>
              )}
            </div>
          ))}
        </div>

        <ResultModal
          gameId="crossfire"
          score={score}
          maxScore={totalRounds}
          stats={stats}
          message={
            score === 5
              ? 'Perfect crossfire! You found every connection.'
              : score >= 3
              ? 'Nice connections! You see the links.'
              : 'Tricky clues today. Try again tomorrow!'
          }
          onRestart={() => {
            setCurrentRound(0);
            setScore(0);
            setInputValue('');
            setRevealed(false);
            setFinished(false);
            setRoundResults([]);
            setAnimatingResult(null);
            setRoundKey(prev => prev + 1);
            setUserAnswers([]);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold">Crossfire</h2>
        <p className="text-surface-200 text-sm mt-1">
          One word connects both clues
        </p>
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
                ? roundResults[i]
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : i === currentRound
                ? 'bg-brand-500 animate-pulse-glow'
                : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Round counter */}
      <div
        key={`round-info-${roundKey}`}
        className="flex items-center justify-between text-xs text-surface-200 round-enter"
      >
        <span>Find the word</span>
        <span>
          {currentRound + 1} of {totalRounds}
        </span>
      </div>

      {/* Clue cards */}
      <div
        key={`clues-${roundKey}`}
        className="flex gap-3 round-enter"
      >
        <ClueCard
          domain={round.clue1.domain}
          hint={round.clue1.hint}
          side="left"
        />
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-lg">
            +
          </div>
        </div>
        <ClueCard
          domain={round.clue2.domain}
          hint={round.clue2.hint}
          side="right"
        />
      </div>

      {/* Input */}
      <div key={`input-${roundKey}`} className="round-enter">
        <CrossfireInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={revealed}
          isCorrect={animatingResult === 'correct'}
          isWrong={animatingResult === 'wrong'}
        />
      </div>

      {/* Submit button */}
      {!revealed && (
        <button
          onClick={handleSubmit}
          disabled={!inputValue.trim()}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all btn-tap ${
            inputValue.trim()
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-surface-800 text-surface-700 cursor-not-allowed'
          }`}
        >
          Submit
        </button>
      )}

      {/* Result feedback */}
      {revealed && (
        <div
          className={`text-center py-3 rounded-xl animate-fade-in-up ${
            checkAnswer(inputValue, round)
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {checkAnswer(inputValue, round) ? (
            <span className="flex items-center justify-center gap-2">
              <span>{'\u2713'}</span> Correct! {round.answer} connects both.
            </span>
          ) : (
            <span>
              The answer was{' '}
              <span className="font-bold text-brand-500">{round.answer}</span>
            </span>
          )}
        </div>
      )}

      {/* Score so far */}
      <div className="flex justify-center gap-1.5">
        {roundResults.map((correct, i) => (
          <span
            key={i}
            className="text-lg animate-bounce-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {correct ? '\uD83C\uDFAF' : '\u274C'}
          </span>
        ))}
      </div>
    </div>
  );
}
