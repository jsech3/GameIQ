import { useState, useCallback, useMemo } from 'react';
import { useDailyPuzzle } from '../../hooks/useDailyPuzzle';
import { useGameState } from '../../hooks/useGameState';
import { ResultModal } from '../../components/ResultModal';
import puzzleBankRaw from './puzzles.json';
import { TrendPuzzle, TrendRound } from './types';

const puzzleBank = puzzleBankRaw as TrendPuzzle[];

type Direction = 'up' | 'down' | 'flat';

const DIRECTION_EMOJI: Record<Direction, string> = {
  up: '\uD83D\uDCC8',
  down: '\uD83D\uDCC9',
  flat: '\u2796',
};

function MiniChart({
  data,
  hidden,
  showHidden,
  highlight,
}: {
  data: number[];
  hidden: number[];
  showHidden: boolean;
  highlight?: 'correct' | 'wrong' | null;
}) {
  const allData = showHidden ? [...data, ...hidden] : data;
  const maxVal = Math.max(...allData);
  const minVal = Math.min(...allData);
  const range = maxVal - minVal || 1;

  const chartWidth = 280;
  const chartHeight = 120;
  const padding = 20;

  const getX = (i: number) =>
    padding + (i / (allData.length - 1)) * (chartWidth - padding * 2);
  const getY = (val: number) =>
    chartHeight - padding - ((val - minVal) / range) * (chartHeight - padding * 2);

  const visiblePoints = data.map((val, i) => ({ x: getX(i), y: getY(val), val }));
  const hiddenPoints = hidden.map((val, i) => ({
    x: getX(data.length + i),
    y: getY(val),
    val,
  }));

  const visiblePath = visiblePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const hiddenPath =
    showHidden && hiddenPoints.length > 0
      ? `M ${visiblePoints[visiblePoints.length - 1].x} ${visiblePoints[visiblePoints.length - 1].y} ` +
        hiddenPoints.map((p) => `L ${p.x} ${p.y}`).join(' ')
      : '';

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className={`w-full max-w-[280px] mx-auto transition-all duration-300 ${
        highlight === 'correct' ? 'correct-glow' : ''
      } ${highlight === 'wrong' ? 'wrong-shake' : ''}`}
    >
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padding}
          y1={chartHeight - padding - pct * (chartHeight - padding * 2)}
          x2={chartWidth - padding}
          y2={chartHeight - padding - pct * (chartHeight - padding * 2)}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      ))}

      {/* Divider line */}
      <line
        x1={getX(data.length - 1)}
        y1={padding}
        x2={getX(data.length - 1)}
        y2={chartHeight - padding}
        stroke="#6366f1"
        strokeWidth="2"
        strokeDasharray="6,4"
        opacity={showHidden ? 0.5 : 1}
      />

      {/* Visible data line */}
      <path
        d={visiblePath}
        fill="none"
        stroke="#6366f1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-500"
      />

      {/* Hidden data line */}
      {showHidden && (
        <path
          d={hiddenPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-fade-in"
          style={{ animationDuration: '0.5s' }}
        />
      )}

      {/* Visible points */}
      {visiblePoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="5"
          fill="#6366f1"
          className="transition-all duration-300"
        />
      ))}

      {/* Hidden points */}
      {showHidden &&
        hiddenPoints.map((p, i) => (
          <circle
            key={`h-${i}`}
            cx={p.x}
            cy={p.y}
            r="5"
            fill="#22c55e"
            className="animate-scale-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}

      {/* Question mark area */}
      {!showHidden && (
        <g className="animate-pulse">
          <rect
            x={getX(data.length - 1) + 10}
            y={padding}
            width={chartWidth - padding - getX(data.length - 1) - 10}
            height={chartHeight - padding * 2}
            fill="#1e293b"
            rx="8"
          />
          <text
            x={(getX(data.length - 1) + chartWidth - padding) / 2 + 5}
            y={chartHeight / 2 + 8}
            textAnchor="middle"
            fill="#64748b"
            fontSize="24"
            fontWeight="bold"
          >
            ?
          </text>
        </g>
      )}
    </svg>
  );
}

function DirectionButton({
  direction,
  selected,
  correct,
  revealed,
  onClick,
}: {
  direction: Direction;
  selected: boolean;
  correct: boolean;
  revealed: boolean;
  onClick: () => void;
}) {
  let className =
    'flex-1 py-4 rounded-xl font-semibold text-lg transition-all duration-200 btn-tap ';

  if (revealed) {
    if (correct) {
      className += 'bg-green-500/20 border-2 border-green-500 text-green-400';
    } else if (selected) {
      className += 'bg-red-500/20 border-2 border-red-500 text-red-400';
    } else {
      className += 'bg-surface-800 border-2 border-transparent text-surface-700';
    }
  } else if (selected) {
    className += 'bg-brand-600 border-2 border-brand-500 text-white scale-105';
  } else {
    className +=
      'bg-surface-800 border-2 border-surface-700 text-white hover:border-brand-600 hover:bg-surface-700';
  }

  return (
    <button onClick={onClick} disabled={revealed} className={className}>
      <span className="text-2xl">{DIRECTION_EMOJI[direction]}</span>
      <span className="block text-xs mt-1 capitalize">{direction}</span>
    </button>
  );
}

export function Trend() {
  const { puzzle, puzzleNumber } = useDailyPuzzle<TrendPuzzle>(puzzleBank);
  const { stats, alreadyPlayed, recordResult } = useGameState('trend');

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(alreadyPlayed ? (stats.todayResult?.score ?? 0) : 0);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(alreadyPlayed);
  const [roundResults, setRoundResults] = useState<boolean[]>(
    alreadyPlayed ? ((stats.todayResult?.details?.roundResults as boolean[]) ?? []) : []
  );
  const [animatingResult, setAnimatingResult] = useState<'correct' | 'wrong' | null>(null);
  const [roundKey, setRoundKey] = useState(0);

  const round = puzzle.rounds[currentRound];
  const totalRounds = puzzle.rounds.length;

  const handleDirectionSelect = useCallback(
    (direction: Direction) => {
      if (revealed || finished) return;
      setSelectedDirection(direction);
    },
    [revealed, finished]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedDirection || revealed || finished) return;

    setRevealed(true);
    const isCorrect = selectedDirection === round.answer;
    const newResults = [...roundResults, isCorrect];
    setRoundResults(newResults);
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
          details: { roundResults: newResults },
        });
      } else {
        setCurrentRound((prev) => prev + 1);
        setSelectedDirection(null);
        setRevealed(false);
        setRoundKey((prev) => prev + 1);
      }
    }, 2500);
  }, [
    selectedDirection,
    revealed,
    finished,
    round,
    roundResults,
    currentRound,
    totalRounds,
    score,
    recordResult,
  ]);

  const shareEmoji = useMemo(() => {
    return roundResults.map((correct) => (correct ? '\uD83D\uDCC8' : '\uD83D\uDCC9')).join('');
  }, [roundResults]);

  if (finished) {
    return (
      <div className="space-y-6">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold">Trend</h2>
          <p className="text-surface-200 text-sm mt-1">Predict the direction</p>
        </div>

        {/* Round-by-round recap */}
        <div className="space-y-2">
          {puzzle.rounds.map((r, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-sm animate-fade-in-up ${
                roundResults[i]
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-surface-200">{r.category}</span>
                <span
                  className={`text-xs font-bold ${
                    roundResults[i] ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {roundResults[i] ? '\u2713' : '\u2717'}
                </span>
              </div>
              <p className="text-white font-medium">{r.title}</p>
              <p className="text-xs text-surface-200 mt-1">
                Answer: {DIRECTION_EMOJI[r.answer]} {r.answer}
              </p>
            </div>
          ))}
        </div>

        <ResultModal
          gameId="trend"
          score={score}
          maxScore={totalRounds}
          stats={stats}
          message={
            score === 5
              ? 'Trend master! Perfect predictions.'
              : score >= 3
              ? 'Good instincts! You read the data well.'
              : 'Tricky trends today. Try again tomorrow!'
          }
          onRestart={() => {
            setCurrentRound(0);
            setScore(0);
            setSelectedDirection(null);
            setRevealed(false);
            setFinished(false);
            setRoundResults([]);
            setAnimatingResult(null);
            setRoundKey(prev => prev + 1);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold">Trend</h2>
        <p className="text-surface-200 text-sm mt-1">Predict where the data goes next</p>
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

      {/* Round info */}
      <div
        key={`round-info-${roundKey}`}
        className="text-center round-enter"
      >
        <span className="text-xs text-surface-200 bg-surface-800 px-2 py-1 rounded-full">
          {round.category}
        </span>
        <h3 className="text-lg font-semibold mt-2">{round.title}</h3>
      </div>

      {/* Chart */}
      <div
        key={`chart-${roundKey}`}
        className={`bg-surface-900 border border-surface-700 rounded-2xl p-4 round-enter ${
          animatingResult === 'correct' ? 'border-green-500/50' : ''
        } ${animatingResult === 'wrong' ? 'border-red-500/50' : ''}`}
      >
        <MiniChart
          data={round.data}
          hidden={round.hidden}
          showHidden={revealed}
          highlight={animatingResult}
        />

        {revealed && (
          <div className="mt-3 text-center animate-fade-in-up">
            <p className="text-xs text-surface-200">
              Source: {round.source}
            </p>
          </div>
        )}
      </div>

      {/* Direction buttons */}
      <div className="flex gap-3">
        {(['up', 'down', 'flat'] as Direction[]).map((dir) => (
          <DirectionButton
            key={dir}
            direction={dir}
            selected={selectedDirection === dir}
            correct={round.answer === dir}
            revealed={revealed}
            onClick={() => handleDirectionSelect(dir)}
          />
        ))}
      </div>

      {/* Submit button */}
      {!revealed && (
        <button
          onClick={handleSubmit}
          disabled={!selectedDirection}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all btn-tap ${
            selectedDirection
              ? 'bg-brand-600 hover:bg-brand-700 text-white'
              : 'bg-surface-800 text-surface-700 cursor-not-allowed'
          }`}
        >
          Lock In
        </button>
      )}

      {/* Result feedback */}
      {revealed && (
        <div
          className={`text-center py-3 rounded-xl animate-fade-in-up ${
            selectedDirection === round.answer
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {selectedDirection === round.answer ? (
            <span className="flex items-center justify-center gap-2">
              <span>{'\u2713'}</span> Correct! The trend went {round.answer}.
            </span>
          ) : (
            <span>
              The trend actually went {round.answer} {DIRECTION_EMOJI[round.answer]}
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
            {correct ? '\uD83D\uDFE9' : '\uD83D\uDFE5'}
          </span>
        ))}
      </div>
    </div>
  );
}
