import { useState, useCallback, useRef, useMemo } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBank from './puzzles.json';
import { RankPuzzle, RankItem } from './types';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function DraggableItem({
  item,
  index,
  correctPosition,
  revealed,
  isCorrect,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
}: {
  item: RankItem;
  index: number;
  correctPosition: number;
  revealed: boolean;
  isCorrect: boolean;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: () => void;
  isDragging: boolean;
  isDragOver: boolean;
}) {
  const touchStartY = useRef(0);
  const [isTouching, setIsTouching] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsTouching(true);
    onDragStart(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching) return;
    const currentY = e.touches[0].clientY;
    const element = document.elementFromPoint(
      e.touches[0].clientX,
      currentY
    ) as HTMLElement;
    const itemElement = element?.closest('[data-item-index]');
    if (itemElement) {
      const targetIndex = parseInt(
        itemElement.getAttribute('data-item-index') || '0'
      );
      onDragOver(targetIndex);
    }
  };

  const handleTouchEnd = () => {
    setIsTouching(false);
    onDrop();
  };

  let className =
    'relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 select-none ';

  if (revealed) {
    if (isCorrect) {
      className += 'bg-green-500/10 border-green-500/50 ';
    } else {
      className += 'bg-red-500/10 border-red-500/50 ';
    }
  } else if (isDragging) {
    className += 'bg-brand-600/20 border-brand-500 scale-105 shadow-lg z-10 ';
  } else if (isDragOver) {
    className += 'bg-surface-700 border-brand-600 ';
  } else {
    className +=
      'bg-surface-800 border-surface-700 hover:border-surface-600 cursor-grab active:cursor-grabbing ';
  }

  return (
    <div
      data-item-index={index}
      draggable={!revealed}
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(index);
      }}
      onDrop={onDrop}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
          revealed
            ? isCorrect
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
            : 'bg-surface-700 text-surface-200'
        }`}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <span className="font-medium">{item.name}</span>
        {revealed && (
          <span className="ml-2 text-xs text-surface-200 animate-fade-in">
            ({item.value.toLocaleString()})
          </span>
        )}
      </div>
      {!revealed && (
        <div className="text-surface-700">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
      )}
      {revealed && !isCorrect && (
        <div className="text-xs text-surface-200 animate-fade-in">
          #{correctPosition + 1}
        </div>
      )}
    </div>
  );
}

export function Rank() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<RankPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('rank');

  // Shuffle items only once on initial load
  const [items, setItems] = useState<RankItem[]>(() => {
    if (alreadyPlayed && stats.todayResult?.details?.userOrder) {
      const savedOrder = stats.todayResult.details.userOrder as string[];
      return savedOrder.map(
        (name) => puzzle.items.find((item) => item.name === name)!
      );
    }
    return shuffleArray([...puzzle.items]);
  });

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(alreadyPlayed);
  const [score, setScore] = useState(
    alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0
  );

  // Calculate correct order (sorted by value descending)
  const correctOrder = useMemo(
    () => [...puzzle.items].sort((a, b) => b.value - a.value),
    [puzzle.items]
  );

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback(() => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(dragIndex, 1);
      newItems.splice(dragOverIndex, 0, draggedItem);
      setItems(newItems);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex, dragOverIndex, items]);

  const handleSubmit = useCallback(() => {
    if (revealed) return;

    // Calculate score (number of items in correct position)
    let correctCount = 0;
    items.forEach((item, index) => {
      if (item.name === correctOrder[index].name) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setRevealed(true);

    recordResult({
      dayNumber: 0,
      score: correctCount,
      maxScore: 5,
      completed: correctCount >= 3,
      details: {
        userOrder: items.map((item) => item.name),
        correctOrder: correctOrder.map((item) => item.name),
      },
    });
  }, [items, correctOrder, revealed, recordResult]);

  // Check if item is in correct position
  const isItemCorrect = useCallback(
    (index: number) => {
      return items[index].name === correctOrder[index].name;
    },
    [items, correctOrder]
  );

  // Get correct position for an item
  const getCorrectPosition = useCallback(
    (item: RankItem) => {
      return correctOrder.findIndex((i) => i.name === item.name);
    },
    [correctOrder]
  );

  // Generate share emoji
  const shareEmoji = useMemo(() => {
    return items
      .map((item, index) =>
        item.name === correctOrder[index].name ? '\u2B06\uFE0F' : '\u2B07\uFE0F'
      )
      .join('');
  }, [items, correctOrder]);

  if (revealed) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold">Rank</h2>
          <p className="text-surface-200 text-sm mt-1">Order items correctly</p>
        </div>

        {/* Question */}
        <div className="text-center animate-fade-in-up">
          <span className="text-xs text-surface-200 bg-surface-800 px-2 py-1 rounded-full">
            {puzzle.category}
          </span>
          <p className="text-lg font-medium mt-2">{puzzle.question}</p>
        </div>

        {/* Revealed items */}
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={item.name}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <DraggableItem
                item={item}
                index={index}
                correctPosition={getCorrectPosition(item)}
                revealed={true}
                isCorrect={isItemCorrect(index)}
                onDragStart={() => {}}
                onDragOver={() => {}}
                onDrop={() => {}}
                isDragging={false}
                isDragOver={false}
              />
            </div>
          ))}
        </div>

        {/* Correct order reference */}
        <div className="bg-surface-900 border border-surface-700 rounded-xl p-4 animate-fade-in-up">
          <p className="text-xs text-surface-200 mb-2">Correct order:</p>
          <div className="space-y-1">
            {correctOrder.map((item, index) => (
              <div key={item.name} className="text-sm flex justify-between">
                <span>
                  {index + 1}. {item.name}
                </span>
                <span className="text-surface-200">
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ResultModal
          gameId="rank"
          score={score}
          maxScore={5}
          stats={stats}
          message={
            score === 5
              ? 'Perfect ranking! You nailed it.'
              : score >= 3
              ? 'Nice work! Most items in the right spot.'
              : 'Tricky ordering. Try again tomorrow!'
          }
          onRestart={() => {
            setItems(shuffleArray([...puzzle.items]));
            setDragIndex(null);
            setDragOverIndex(null);
            setRevealed(false);
            setScore(0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold">Rank</h2>
        <p className="text-surface-200 text-sm mt-1">Drag to reorder</p>
        <div className="inline-block mt-2 px-3 py-1 bg-surface-800 rounded-full text-xs text-surface-200">
          #{puzzleNumber}
        </div>
      </div>

      {/* Question */}
      <div className="text-center">
        <span className="text-xs text-surface-200 bg-surface-800 px-2 py-1 rounded-full">
          {puzzle.category}
        </span>
        <p className="text-lg font-medium mt-2">{puzzle.question}</p>
      </div>

      {/* Draggable items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <DraggableItem
            key={item.name}
            item={item}
            index={index}
            correctPosition={0}
            revealed={false}
            isCorrect={false}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={dragIndex === index}
            isDragOver={dragOverIndex === index && dragIndex !== index}
          />
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 font-semibold text-sm btn-tap transition-all"
      >
        Lock In Ranking
      </button>

      <p className="text-center text-xs text-surface-700">
        Drag items up or down to reorder
      </p>
    </div>
  );
}
