// Epoch: Feb 1, 2026 UTC — day 0
const EPOCH = Date.UTC(2026, 1, 1);

export function getDayNumber(): number {
  const now = new Date();
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((utcNow - EPOCH) / 86_400_000);
}

export function getPuzzleIndex(dayNumber: number, bankSize: number): number {
  return ((dayNumber % bankSize) + bankSize) % bankSize;
}
