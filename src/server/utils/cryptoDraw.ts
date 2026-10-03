import crypto from 'crypto';

export interface SeedCommitment {
  serverSeed: string;
  serverSeedHash: string;
}

/**
 * Generates a cryptographically secure 256-bit server seed and its SHA-256 public commitment hash.
 */
export function generateSeedCommitment(): SeedCommitment {
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');
  return { serverSeed, serverSeedHash };
}

/**
 * Deterministically calculates a winning number between 1 and capacity using HMAC-SHA256.
 * Formula: (HMAC_SHA256(serverSeed, drawId) % capacity) + 1
 */
export function calculateWinningNumber(serverSeed: string, drawId: string, capacity: number = 80): number {
  if (capacity < 1) capacity = 1;
  if (capacity > 1000) capacity = 1000;

  const hmac = crypto.createHmac('sha256', serverSeed);
  hmac.update(drawId);
  const hash = hmac.digest('hex');

  // Take first 8 characters (32 bits) for high uniform precision
  const numericValue = parseInt(hash.substring(0, 8), 16);
  return (numericValue % capacity) + 1;
}

/**
 * Selects multiple unique winning numbers for configured winner positions.
 */
export function selectMultipleWinners(
  serverSeed: string,
  drawId: string,
  capacity: number,
  winnerCount: number,
  eligibleConfirmedNumbers: number[]
): number[] {
  if (eligibleConfirmedNumbers.length === 0) {
    // If no confirmed selections, pick from entire board range
    const winners: number[] = [];
    for (let pos = 1; pos <= winnerCount; pos++) {
      const seedSalt = `${serverSeed}:pos_${pos}`;
      let num = calculateWinningNumber(seedSalt, drawId, capacity);
      while (winners.includes(num)) {
        num = (num % capacity) + 1;
      }
      winners.push(num);
    }
    return winners;
  }

  // Pick unique winners from eligible confirmed player numbers
  const winners: number[] = [];
  const pool = [...eligibleConfirmedNumbers];

  for (let pos = 1; pos <= winnerCount; pos++) {
    if (pool.length === 0) break;
    const seedSalt = `${serverSeed}:pos_${pos}`;
    const winIndex = calculateWinningNumber(seedSalt, drawId, pool.length) - 1;
    const winningNum = pool[winIndex];
    winners.push(winningNum);
    pool.splice(winIndex, 1); // Ensure unique winning entries
  }

  return winners;
}

/**
 * Verifies that a revealed server seed matches its published SHA-256 hash commitment.
 */
export function verifyServerSeedCommitment(revealedSeed: string, publishedHash: string): boolean {
  const calculatedHash = crypto.createHash('sha256').update(revealedSeed).digest('hex');
  return calculatedHash.toLowerCase() === publishedHash.toLowerCase();
}
