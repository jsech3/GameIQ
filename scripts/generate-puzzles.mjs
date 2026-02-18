/**
 * Puzzle generation script for GameIQ.
 *
 * Calls the Anthropic API to generate fresh puzzles for each game,
 * then appends them to the existing puzzle banks and trims old entries
 * to keep each bank at exactly 365 puzzles (rolling window).
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 *
 * Usage:
 *   node scripts/generate-puzzles.mjs            # generate for all games
 *   node scripts/generate-puzzles.mjs pricecheck  # generate for one game
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_DIR = join(__dirname, '..', 'src', 'games');
const BANK_SIZE = 365;
const BATCH_SIZE = 30; // generate 30 new puzzles per run (covers ~1 month)

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required');
  process.exit(1);
}

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.content[0].text;

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  return JSON.parse(jsonMatch[1].trim());
}

// ── Game-specific prompts ──────────────────────────────────────────

const PROMPTS = {
  pricecheck: (startId, existingItems) => `Generate exactly ${BATCH_SIZE} Pricecheck puzzles as a JSON array. Start IDs at ${startId}.

Each puzzle: { "id": N, "rounds": [5 rounds] }
Each round: { "category": "...", "item": "...", "shownValue": N, "actualValue": N, "unit": "..." }

Rules:
- 5 rounds per puzzle, no duplicate categories within a puzzle
- Categories: Rent, Salary, Food, Tech, Travel, Sports, Science, History, Geography, Entertainment, Animals, Music, Space, Health, Architecture, Vehicles
- actualValue = real-world accurate, shownValue = deliberately off by 5-80%
- ~50% Higher (actual > shown), ~50% Lower overall
- All integers, item descriptions under 60 chars
- Units: $, miles, years, lbs, °F, mph, %, ft, calories, grams, mg, etc.
- Fun, interesting real-world facts
- DO NOT reuse these items: ${existingItems.slice(-50).join(', ')}

Return ONLY the JSON array, no explanation.`,

  trend: (startId, existingTitles) => `Generate exactly ${BATCH_SIZE} Trend puzzles as a JSON array. Start IDs at ${startId}.

Each puzzle: { "id": N, "rounds": [5 rounds] }
Each round: { "category": "...", "title": "...", "data": [5 numbers], "hidden": [3 numbers], "answer": "up"|"down"|"flat", "source": "..." }

Rules:
- data = 5 visible time-series points, hidden = 3 continuation points
- answer reflects the trend of hidden data: "up" (increasing), "down" (decreasing), "flat" (within ~5%)
- Roughly equal "up", "down", "flat" distribution
- Categories: Economics, Technology, Climate, Finance, Energy, Social Media, Health, Sports, Demographics, Transportation, Education, Entertainment, Agriculture, Space
- source = plausible real-world data source
- Data values should be realistic
- DO NOT reuse these titles: ${existingTitles.slice(-50).join(', ')}

Return ONLY the JSON array, no explanation.`,

  rank: (startId, existingQuestions) => `Generate exactly ${BATCH_SIZE} Rank puzzles as a JSON array. Start IDs at ${startId}.

Each puzzle (NO rounds array): { "id": N, "category": "...", "question": "...", "items": [5 items] }
Each item: { "name": "...", "value": N }

Rules:
- 5 items per puzzle listed in CORRECT order (highest/largest first)
- question tells what metric and direction (e.g. "Order these X by Y (highest first)")
- Values must be real-world accurate and distinct enough for unambiguous ordering
- Categories: Geography, Space, Movies, Nature, Economics, Sports, Music, History, Food, Science, Technology, Architecture, Animals, Health, Transportation
- DO NOT reuse these questions: ${existingQuestions.slice(-50).join(', ')}

Return ONLY the JSON array, no explanation.`,

  crossfire: (startId, existingWords) => `Generate exactly ${BATCH_SIZE} Crossfire puzzles as a JSON array. Start IDs at ${startId}.

Each puzzle: { "id": N, "rounds": [5 rounds] }
Each round: { "clue1": { "domain": "...", "hint": "..." }, "clue2": { "domain": "...", "hint": "..." }, "answer": "WORD", "acceptedAnswers": ["WORD"] }

Rules:
- Each answer is an English word with two genuinely distinct meanings
- clue1 and clue2 give hints from different domains — don't use the answer word in hints
- answer in ALL CAPS
- Common English words only (not obscure)
- No duplicate answers within a puzzle
- Domains: Animals, Music, Sports, Food, Science, Weather, Cards, Military, Anatomy, Fashion, Maritime, Construction, Banking, Theater, Nature, Technology, etc.
- DO NOT reuse these words: ${existingWords.slice(-100).join(', ')}

Return ONLY the JSON array, no explanation.`,
};

// ── Extract existing items for dedup ───────────────────────────────

function getExistingKeys(gameId, puzzles) {
  switch (gameId) {
    case 'pricecheck':
      return puzzles.flatMap(p => p.rounds.map(r => r.item));
    case 'trend':
      return puzzles.flatMap(p => p.rounds.map(r => r.title));
    case 'rank':
      return puzzles.map(p => p.question);
    case 'crossfire':
      return puzzles.flatMap(p => p.rounds.map(r => r.answer));
    default:
      return [];
  }
}

// ── Main ───────────────────────────────────────────────────────────

async function generateForGame(gameId) {
  const filePath = join(GAMES_DIR, gameId, 'puzzles.json');
  const existing = JSON.parse(readFileSync(filePath, 'utf-8'));
  const existingKeys = getExistingKeys(gameId, existing);
  const startId = existing.length + 1;

  console.log(`[${gameId}] Current: ${existing.length} puzzles. Generating ${BATCH_SIZE} more...`);

  const prompt = PROMPTS[gameId](startId, existingKeys);
  const newPuzzles = await callClaude(prompt);

  if (!Array.isArray(newPuzzles) || newPuzzles.length === 0) {
    throw new Error(`[${gameId}] Claude returned invalid data`);
  }

  console.log(`[${gameId}] Generated ${newPuzzles.length} new puzzles`);

  // Append new puzzles
  const combined = [...existing, ...newPuzzles];

  // Trim to BANK_SIZE (keep the newest ones, drop the oldest)
  const trimmed = combined.length > BANK_SIZE
    ? combined.slice(combined.length - BANK_SIZE)
    : combined;

  // Re-index IDs sequentially
  trimmed.forEach((p, i) => { p.id = i + 1; });

  writeFileSync(filePath, JSON.stringify(trimmed, null, 2) + '\n');
  console.log(`[${gameId}] Saved ${trimmed.length} puzzles to ${filePath}`);
}

// Run for specified game or all games
const targetGame = process.argv[2];
const games = targetGame ? [targetGame] : ['pricecheck', 'trend', 'rank', 'crossfire'];

for (const game of games) {
  try {
    await generateForGame(game);
  } catch (err) {
    console.error(`[${game}] Error: ${err.message}`);
    process.exit(1);
  }
}

console.log('Done!');
