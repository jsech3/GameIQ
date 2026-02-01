import { useState, useCallback } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBank from './puzzles.json';

interface Round {
  text: string;
  wrongWord: string;
  correctWord: string;
  category: string;
}

interface BlindspotPuzzle {
  id: number;
  rounds: Round[];
}

export function Blindspot() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<BlindspotPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('blindspot');

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(alreadyPlayed);
  const [roundResults, setRoundResults] = useState<boolean[]>(
    alreadyPlayed ? (stats.todayResult?.details?.roundResults as boolean[] ?? []) : []
  );

  const round = puzzle.rounds[currentRound];
  const totalRounds = puzzle.rounds.length;

  // Split text into tappable words
  const getWords = (text: string): { word: string; raw: string }[] => {
    // Split keeping punctuation attached
    const tokens = text.split(/(\s+)/);
    return tokens
      .filter(t => t.trim().length > 0)
      .map(raw => ({
        raw,
        word: raw.replace(/["""''.,!?;:()—\-]/g, '').trim(),
      }));
  };

  const words = round ? getWords(round.text) : [];

  const handleWordTap = useCallback((word: string, raw: string) => {
    if (revealed || finished) return;
    setSelectedWord(raw);
    setRevealed(true);

    const cleanWord = word.toLowerCase();
    const wrongWord = round.wrongWord.toLowerCase();
    const isCorrect = cleanWord === wrongWord;

    const newResults = [...roundResults, isCorrect];
    setRoundResults(newResults);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentRound + 1 >= totalRounds) {
        const finalScore = isCorrect ? score + 1 : score;
        setFinished(true);
        recordResult({
          dayNumber: 0,
          score: finalScore,
          maxScore: totalRounds,
          completed: finalScore >= 3,
          details: { roundResults: newResults },
        });
      } else {
        setCurrentRound(prev => prev + 1);
        setSelectedWord(null);
        setRevealed(false);
      }
    }, 2000);
  }, [revealed, finished, round, roundResults, currentRound, totalRounds, score, recordResult]);

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Blindspot</h2>
          <p className="text-surface-200 text-sm mt-1">Find the wrong word</p>
        </div>

        {/* Round-by-round recap */}
        <div className="space-y-2">
          {puzzle.rounds.map((r, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-sm ${
                roundResults[i]
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold ${roundResults[i] ? 'text-green-400' : 'text-red-400'}`}>
                  {roundResults[i] ? '\u2713' : '\u2717'}
                </span>
                <span className="text-xs text-surface-200">{r.category}</span>
              </div>
              <p className="text-surface-200">
                <span className="line-through text-red-400">{r.wrongWord}</span>
                {' \u2192 '}
                <span className="text-green-400">{r.correctWord}</span>
              </p>
            </div>
          ))}
        </div>

        <ResultModal
          gameId="blindspot"
          score={score}
          maxScore={totalRounds}
          stats={stats}
          message={
            score === 5
              ? 'Perfect eye! Nothing gets past you.'
              : score >= 3
                ? 'Sharp! You caught most of them.'
                : 'Tricky one. Try again tomorrow!'
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Blindspot</h2>
        <p className="text-surface-200 text-sm mt-1">
          Tap the word that doesn't belong
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
            className={`w-8 h-1.5 rounded-full transition-colors ${
              i < currentRound
                ? roundResults[i]
                  ? 'bg-green-500'
                  : 'bg-red-500'
                : i === currentRound
                  ? 'bg-brand-500'
                  : 'bg-surface-700'
            }`}
          />
        ))}
      </div>

      {/* Round info */}
      <div className="flex items-center justify-between text-xs text-surface-200">
        <span>{round.category}</span>
        <span>{currentRound + 1} of {totalRounds}</span>
      </div>

      {/* The statement with tappable words */}
      <div className="bg-surface-900 border border-surface-700 rounded-2xl p-6">
        <p className="text-lg leading-relaxed text-center">
          {words.map((w, i) => {
            const isWrong = w.word.toLowerCase() === round.wrongWord.toLowerCase();
            const isSelected = w.raw === selectedWord;

            let className = 'px-0.5 py-0.5 rounded cursor-pointer transition-colors inline ';

            if (revealed) {
              if (isWrong) {
                className += 'bg-red-500/30 text-red-300 line-through';
              } else if (isSelected && !isWrong) {
                className += 'bg-yellow-500/30 text-yellow-300';
              } else {
                className += 'text-surface-200';
              }
            } else {
              className += 'hover:bg-surface-700 text-white';
            }

            return (
              <span key={i}>
                <span
                  className={className}
                  onClick={() => handleWordTap(w.word, w.raw)}
                >
                  {w.raw}
                </span>
                {' '}
              </span>
            );
          })}
        </p>

        {/* Reveal correction */}
        {revealed && (
          <div className="mt-4 pt-4 border-t border-surface-700 text-center">
            <p className="text-sm">
              <span className="line-through text-red-400">{round.wrongWord}</span>
              {' \u2192 '}
              <span className="text-green-400 font-medium">{round.correctWord}</span>
            </p>
            {selectedWord && words.find(w => w.raw === selectedWord)?.word.toLowerCase() === round.wrongWord.toLowerCase() ? (
              <p className="text-green-400 text-xs mt-1 font-medium">Correct!</p>
            ) : (
              <p className="text-red-400 text-xs mt-1 font-medium">Not quite — the wrong word was "{round.wrongWord}"</p>
            )}
          </div>
        )}
      </div>

      {/* Score so far */}
      <div className="flex justify-center gap-1.5">
        {roundResults.map((correct, i) => (
          <span key={i} className="text-lg">
            {correct ? '\uD83D\uDFE9' : '\uD83D\uDFE5'}
          </span>
        ))}
      </div>
    </div>
  );
}
