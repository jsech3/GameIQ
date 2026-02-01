import { useState, useCallback, useRef } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBank from './puzzles.json';
import { TempoPuzzle, TempoEvent } from '../../types';

export function Tempo() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<TempoPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('tempo');

  // Shuffle events deterministically from puzzle data (not sorted)
  const [shuffled] = useState<TempoEvent[]>(() => {
    const arr = [...puzzle.events];
    // Fisher-Yates with seeded index based on puzzle id
    let seed = puzzle.id * 9973;
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  const [order, setOrder] = useState<TempoEvent[]>(shuffled);
  const [submitted, setSubmitted] = useState(alreadyPlayed);
  const [score, setScore] = useState(stats.todayResult?.score ?? 0);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOver.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragItem.current, 1);
    newOrder.splice(dragOver.current, 0, moved);
    setOrder(newOrder);
    dragItem.current = null;
    dragOver.current = null;
  };

  // Touch drag support
  const touchStartY = useRef<number>(0);
  const touchIdx = useRef<number | null>(null);

  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchIdx.current = idx;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchIdx.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const diff = endY - touchStartY.current;
    const threshold = 40;

    if (Math.abs(diff) > threshold) {
      const direction = diff > 0 ? 1 : -1;
      const fromIdx = touchIdx.current;
      const toIdx = Math.max(0, Math.min(order.length - 1, fromIdx + direction));
      if (fromIdx !== toIdx) {
        const newOrder = [...order];
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        setOrder(newOrder);
      }
    }
    touchIdx.current = null;
  };

  const moveItem = (fromIdx: number, direction: -1 | 1) => {
    const toIdx = fromIdx + direction;
    if (toIdx < 0 || toIdx >= order.length) return;
    const newOrder = [...order];
    [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
    setOrder(newOrder);
  };

  const handleSubmit = useCallback(() => {
    const sorted = [...puzzle.events].sort((a, b) => a.year - b.year);
    let correct = 0;
    order.forEach((ev, i) => {
      if (ev.year === sorted[i].year) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    recordResult({
      dayNumber: 0,
      score: correct,
      maxScore: 5,
      completed: correct === 5,
      details: { order: order.map(e => e.year) },
    });
  }, [order, puzzle.events, recordResult]);

  const sorted = [...puzzle.events].sort((a, b) => a.year - b.year);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Tempo</h2>
        <p className="text-surface-200 text-sm mt-1">
          Put these events in chronological order
        </p>
        <div className="inline-block mt-2 px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-200">
          {puzzle.theme} &middot; #{puzzleNumber}
        </div>
      </div>

      <div className="space-y-2">
        {(submitted ? sorted : order).map((event, idx) => {
          const isCorrect = submitted && event.year === sorted[idx]?.year;
          const isWrong = submitted && !isCorrect;

          return (
            <div
              key={event.text}
              draggable={!submitted}
              onDragStart={() => handleDragStart(idx)}
              onDragEnter={() => handleDragEnter(idx)}
              onDragEnd={handleDragEnd}
              onDragOver={e => e.preventDefault()}
              onTouchStart={e => handleTouchStart(idx, e)}
              onTouchEnd={handleTouchEnd}
              className={`relative flex items-center gap-3 p-4 rounded-xl border transition-all select-none ${
                submitted
                  ? isCorrect
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                  : 'bg-surface-900 border-surface-700 cursor-grab active:cursor-grabbing hover:border-brand-600'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                submitted
                  ? isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  : 'bg-surface-700 text-surface-200'
              }`}>
                {idx + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{event.text}</p>
                {submitted && (
                  <p className="text-xs text-surface-200 mt-0.5">{event.year}</p>
                )}
              </div>

              {!submitted && (
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveItem(idx, -1)}
                    disabled={idx === 0}
                    className="w-6 h-6 rounded bg-surface-800 hover:bg-surface-700 text-surface-200 disabled:opacity-20 text-xs flex items-center justify-center"
                  >
                    &#9650;
                  </button>
                  <button
                    onClick={() => moveItem(idx, 1)}
                    disabled={idx === order.length - 1}
                    className="w-6 h-6 rounded bg-surface-800 hover:bg-surface-700 text-surface-200 disabled:opacity-20 text-xs flex items-center justify-center"
                  >
                    &#9660;
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold text-sm transition-colors"
        >
          Lock In Answer
        </button>
      )}

      {submitted && (
        <ResultModal
          gameId="tempo"
          score={score}
          maxScore={5}
          stats={stats}
          message={
            score === 5
              ? 'Perfect! You nailed the order.'
              : score >= 3
                ? 'Solid! Most in the right spot.'
                : 'Tough one. Try again tomorrow!'
          }
        />
      )}
    </div>
  );
}
