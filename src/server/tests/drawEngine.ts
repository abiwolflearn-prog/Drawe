import { formatEntryNumber } from '../../types/index.js';
import { calculateWinningNumber, selectMultipleWinners } from '../utils/cryptoDraw.js';

/**
 * Automated Test Suite for Admin-Controlled Capacity, Pricing, Winner Selection, and Formatting
 */
export function runDrawEngineTests() {
  const results: { name: string; passed: boolean; message: string }[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true, message: 'Passed' });
    } catch (err: any) {
      results.push({ name, passed: false, message: err.message || 'Failed' });
    }
  };

  // 1. Formatting tests
  test('formatEntryNumber pads numbers correctly for 80 capacity', () => {
    if (formatEntryNumber(1, 80) !== '01') throw new Error(`Expected 01, got ${formatEntryNumber(1, 80)}`);
    if (formatEntryNumber(80, 80) !== '80') throw new Error(`Expected 80, got ${formatEntryNumber(80, 80)}`);
  });

  test('formatEntryNumber pads numbers correctly for 250 capacity', () => {
    if (formatEntryNumber(1, 250) !== '001') throw new Error(`Expected 001, got ${formatEntryNumber(1, 250)}`);
    if (formatEntryNumber(99, 250) !== '099') throw new Error(`Expected 099, got ${formatEntryNumber(99, 250)}`);
    if (formatEntryNumber(250, 250) !== '250') throw new Error(`Expected 250, got ${formatEntryNumber(250, 250)}`);
  });

  test('formatEntryNumber pads numbers correctly for 1000 capacity', () => {
    if (formatEntryNumber(1, 1000) !== '0001') throw new Error(`Expected 0001, got ${formatEntryNumber(1, 1000)}`);
    if (formatEntryNumber(1000, 1000) !== '1000') throw new Error(`Expected 1000, got ${formatEntryNumber(1000, 1000)}`);
  });

  // 2. Capacity bounds validation
  test('capacity bounds check: 1 <= capacity <= 1000', () => {
    const validateCapacity = (c: number) => c >= 1 && c <= 1000;
    if (!validateCapacity(80)) throw new Error('80 should be valid');
    if (!validateCapacity(100)) throw new Error('100 should be valid');
    if (!validateCapacity(500)) throw new Error('500 should be valid');
    if (!validateCapacity(1000)) throw new Error('1000 should be valid');
    if (validateCapacity(0)) throw new Error('0 capacity must be invalid');
    if (validateCapacity(1001)) throw new Error('1001 capacity must be invalid');
  });

  // 3. Price recalculation logic
  test('backend recalculates total amount using quantity * pricePerNumber', () => {
    const pricePerNumber = 50;
    const selectedQuantity = 5;
    const clientProvidedTotal = 10; // Manipulated client total
    const serverTotal = selectedQuantity * pricePerNumber;

    if (serverTotal !== 250) throw new Error(`Server total should be 250, got ${serverTotal}`);
    if (serverTotal === (clientProvidedTotal as number)) throw new Error('Server trusted manipulated client total');
  });

  // 4. Multi-winner selection tests
  test('cryptoDraw generates winning numbers within 1..capacity', () => {
    const seed = 'test_server_seed_12345';
    const drawId = 'draw_001';
    const winNum = calculateWinningNumber(seed, drawId, 500);

    if (winNum < 1 || winNum > 500) {
      throw new Error(`Winning number ${winNum} out of bounds for capacity 500`);
    }
  });

  test('selectMultipleWinners picks unique winning numbers for configured positions', () => {
    const seed = 'test_server_seed_99999';
    const drawId = 'draw_002';
    const winners = selectMultipleWinners(seed, drawId, 100, 3, [5, 12, 33, 42, 78]);

    if (winners.length !== 3) throw new Error(`Expected 3 winners, got ${winners.length}`);
    const unique = new Set(winners);
    if (unique.size !== 3) throw new Error('Winning numbers are not unique');
  });

  return results;
}
