/**
 * Validates all puzzle bank JSON files for structural correctness.
 * Run after generation to catch issues before committing.
 *
 * Usage: node scripts/validate-puzzles.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_DIR = join(__dirname, '..', 'src', 'games');

let errors = 0;

function fail(game, msg) {
  console.error(`  FAIL [${game}]: ${msg}`);
  errors++;
}

function info(game, msg) {
  console.log(`  OK   [${game}]: ${msg}`);
}

// ── Pricecheck ─────────────────────────────────────────────────────

function validatePricecheck() {
  const data = JSON.parse(readFileSync(join(GAMES_DIR, 'pricecheck', 'puzzles.json'), 'utf-8'));
  if (!Array.isArray(data)) return fail('pricecheck', 'Not an array');
  if (data.length < 30) return fail('pricecheck', `Only ${data.length} puzzles (need >= 30)`);

  let higher = 0, lower = 0;
  for (const p of data) {
    if (!p.rounds || p.rounds.length !== 5) {
      fail('pricecheck', `Puzzle ${p.id} has ${p.rounds?.length ?? 0} rounds (need 5)`);
      continue;
    }
    for (const r of p.rounds) {
      if (!r.category || !r.item || r.shownValue == null || r.actualValue == null || r.unit == null) {
        fail('pricecheck', `Puzzle ${p.id} has incomplete round: ${JSON.stringify(r)}`);
      }
      if (r.shownValue === r.actualValue) {
        fail('pricecheck', `Puzzle ${p.id}: shownValue === actualValue for "${r.item}"`);
      }
      if (r.actualValue > r.shownValue) higher++;
      else lower++;
    }
  }

  info('pricecheck', `${data.length} puzzles, ${higher} higher / ${lower} lower`);
}

// ── Trend ──────────────────────────────────────────────────────────

function validateTrend() {
  const data = JSON.parse(readFileSync(join(GAMES_DIR, 'trend', 'puzzles.json'), 'utf-8'));
  if (!Array.isArray(data)) return fail('trend', 'Not an array');
  if (data.length < 30) return fail('trend', `Only ${data.length} puzzles (need >= 30)`);

  const answers = { up: 0, down: 0, flat: 0 };
  for (const p of data) {
    if (!p.rounds || p.rounds.length !== 5) {
      fail('trend', `Puzzle ${p.id} has ${p.rounds?.length ?? 0} rounds (need 5)`);
      continue;
    }
    for (const r of p.rounds) {
      if (!r.category || !r.title || !r.data || !r.hidden || !r.answer || !r.source) {
        fail('trend', `Puzzle ${p.id} has incomplete round`);
      }
      if (r.data?.length !== 5) fail('trend', `Puzzle ${p.id} "${r.title}": data has ${r.data?.length} points (need 5)`);
      if (r.hidden?.length !== 3) fail('trend', `Puzzle ${p.id} "${r.title}": hidden has ${r.hidden?.length} points (need 3)`);
      if (!['up', 'down', 'flat'].includes(r.answer)) fail('trend', `Puzzle ${p.id}: invalid answer "${r.answer}"`);
      answers[r.answer]++;
    }
  }

  info('trend', `${data.length} puzzles — up: ${answers.up}, down: ${answers.down}, flat: ${answers.flat}`);
}

// ── Rank ───────────────────────────────────────────────────────────

function validateRank() {
  const data = JSON.parse(readFileSync(join(GAMES_DIR, 'rank', 'puzzles.json'), 'utf-8'));
  if (!Array.isArray(data)) return fail('rank', 'Not an array');
  if (data.length < 30) return fail('rank', `Only ${data.length} puzzles (need >= 30)`);

  for (const p of data) {
    if (!p.items || p.items.length !== 5) {
      fail('rank', `Puzzle ${p.id} has ${p.items?.length ?? 0} items (need 5)`);
      continue;
    }
    if (!p.category || !p.question) {
      fail('rank', `Puzzle ${p.id} missing category or question`);
    }
    // Verify items are in descending order by value
    for (let i = 1; i < p.items.length; i++) {
      if (p.items[i].value >= p.items[i - 1].value) {
        fail('rank', `Puzzle ${p.id} "${p.question}": items not in descending order at position ${i}`);
        break;
      }
    }
  }

  info('rank', `${data.length} puzzles`);
}

// ── Crossfire ──────────────────────────────────────────────────────

function validateCrossfire() {
  const data = JSON.parse(readFileSync(join(GAMES_DIR, 'crossfire', 'puzzles.json'), 'utf-8'));
  if (!Array.isArray(data)) return fail('crossfire', 'Not an array');
  if (data.length < 30) return fail('crossfire', `Only ${data.length} puzzles (need >= 30)`);

  const allWords = new Set();
  for (const p of data) {
    if (!p.rounds || p.rounds.length !== 5) {
      fail('crossfire', `Puzzle ${p.id} has ${p.rounds?.length ?? 0} rounds (need 5)`);
      continue;
    }
    const puzzleWords = new Set();
    for (const r of p.rounds) {
      if (!r.clue1?.domain || !r.clue1?.hint || !r.clue2?.domain || !r.clue2?.hint || !r.answer) {
        fail('crossfire', `Puzzle ${p.id} has incomplete round`);
      }
      if (puzzleWords.has(r.answer)) {
        fail('crossfire', `Puzzle ${p.id}: duplicate answer "${r.answer}" within puzzle`);
      }
      puzzleWords.add(r.answer);
      allWords.add(r.answer);
    }
  }

  info('crossfire', `${data.length} puzzles, ${allWords.size} unique words`);
}

// ── Run all ────────────────────────────────────────────────────────

console.log('Validating puzzle banks...\n');
validatePricecheck();
validateTrend();
validateRank();
validateCrossfire();

console.log(`\n${errors === 0 ? 'All validations passed!' : `${errors} error(s) found.`}`);
if (errors > 0) process.exit(1);
