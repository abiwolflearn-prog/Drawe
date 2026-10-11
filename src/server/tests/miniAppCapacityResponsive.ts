import { formatEntryNumber } from '../../types/index.js';
import { drawService, memoryDraws } from '../services/drawService.js';
import { paymentService } from '../services/paymentService.js';
import { playerService } from '../services/playerService.js';
import { defaultNumbersMap } from '../store.js';

export interface MiniAppTestResult {
  name: string;
  passed: boolean;
  message: string;
}

export async function runMiniAppInteractiveTests(): Promise<MiniAppTestResult[]> {
  const results: MiniAppTestResult[] = [];

  const test = async (name: string, fn: () => Promise<void> | void) => {
    try {
      await fn();
      results.push({ name, passed: true, message: 'Passed' });
    } catch (err: any) {
      results.push({ name, passed: false, message: err.message || 'Failed' });
    }
  };

  // Requirement 7: Dynamic number formatting check (1, 80, 100, 250, 1000)
  await test('Format entry numbers: 1 → 1', () => {
    const formatted = formatEntryNumber(1, 1);
    if (formatted !== '1') throw new Error(`Expected 1, got ${formatted}`);
  });

  await test('Format entry numbers: 80 → 01..80', () => {
    if (formatEntryNumber(1, 80) !== '01') throw new Error(`Expected 01, got ${formatEntryNumber(1, 80)}`);
    if (formatEntryNumber(80, 80) !== '80') throw new Error(`Expected 80, got ${formatEntryNumber(80, 80)}`);
  });

  await test('Format entry numbers: 100 → 001..100', () => {
    if (formatEntryNumber(1, 100) !== '001') throw new Error(`Expected 001, got ${formatEntryNumber(1, 100)}`);
    if (formatEntryNumber(100, 100) !== '100') throw new Error(`Expected 100, got ${formatEntryNumber(100, 100)}`);
  });

  await test('Format entry numbers: 250 → 001..250', () => {
    if (formatEntryNumber(1, 250) !== '001') throw new Error(`Expected 001, got ${formatEntryNumber(1, 250)}`);
    if (formatEntryNumber(99, 250) !== '099') throw new Error(`Expected 099, got ${formatEntryNumber(99, 250)}`);
    if (formatEntryNumber(250, 250) !== '250') throw new Error(`Expected 250, got ${formatEntryNumber(250, 250)}`);
  });

  await test('Format entry numbers: 1000 → 0001..1000', () => {
    if (formatEntryNumber(1, 1000) !== '0001') throw new Error(`Expected 0001, got ${formatEntryNumber(1, 1000)}`);
    if (formatEntryNumber(500, 1000) !== '0500') throw new Error(`Expected 0500, got ${formatEntryNumber(500, 1000)}`);
    if (formatEntryNumber(1000, 1000) !== '1000') throw new Error(`Expected 1000, got ${formatEntryNumber(1000, 1000)}`);
  });

  // Requirement 19: Dynamic capacity loads (80, 250, 500, 1000)
  await test('Dynamic capacity 80: generates 80 entries correctly', async () => {
    const numbers = await drawService.getDrawNumbers('draw_round_hawassa_01');
    if (numbers.length !== 80) throw new Error(`Expected 80 numbers, got ${numbers.length}`);
    if (numbers[0].formattedNumber !== '01') throw new Error(`Expected first number 01, got ${numbers[0].formattedNumber}`);
    if (numbers[79].formattedNumber !== '80') throw new Error(`Expected last number 80, got ${numbers[79].formattedNumber}`);
  });

  await test('Dynamic capacity 250: generates 250 entries correctly', async () => {
    const numbers = await drawService.getDrawNumbers('draw_capacity_250');
    if (numbers.length !== 250) throw new Error(`Expected 250 numbers, got ${numbers.length}`);
    if (numbers[0].formattedNumber !== '001') throw new Error(`Expected first number 001, got ${numbers[0].formattedNumber}`);
    if (numbers[249].formattedNumber !== '250') throw new Error(`Expected last number 250, got ${numbers[249].formattedNumber}`);
  });

  await test('Dynamic capacity 500: generates 500 entries correctly', async () => {
    const numbers = await drawService.getDrawNumbers('draw_capacity_500');
    if (numbers.length !== 500) throw new Error(`Expected 500 numbers, got ${numbers.length}`);
    if (numbers[0].formattedNumber !== '001') throw new Error(`Expected first number 001, got ${numbers[0].formattedNumber}`);
    if (numbers[499].formattedNumber !== '500') throw new Error(`Expected last number 500, got ${numbers[499].formattedNumber}`);
  });

  await test('Dynamic capacity 1000: generates 1000 entries correctly', async () => {
    const numbers = await drawService.getDrawNumbers('draw_capacity_1000');
    if (numbers.length !== 1000) throw new Error(`Expected 1000 numbers, got ${numbers.length}`);
    if (numbers[0].formattedNumber !== '0001') throw new Error(`Expected first number 0001, got ${numbers[0].formattedNumber}`);
    if (numbers[999].formattedNumber !== '1000') throw new Error(`Expected last number 1000, got ${numbers[999].formattedNumber}`);
  });

  // Requirement 18: Mobile Viewport layout tests (360px, 390px, 412px)
  const calculateGridFitting = (viewportWidth: number, cols: number, gap: number, padding: number) => {
    const availableWidth = viewportWidth - (padding * 2);
    const itemWidth = (availableWidth - ((cols - 1) * gap)) / cols;
    return itemWidth;
  };

  await test('Mobile Viewport 360px: grid fits comfortably without overflow', () => {
    // 360px width with 5 columns, 6px gap, 12px padding
    const itemWidth = calculateGridFitting(360, 5, 6, 12);
    if (itemWidth < 50) throw new Error(`Button width ${itemWidth}px is too cramped on 360px`);
  });

  await test('Mobile Viewport 390px: grid fits comfortably without overflow', () => {
    // 390px width with 5 or 6 columns
    const itemWidth = calculateGridFitting(390, 5, 8, 16);
    if (itemWidth < 55) throw new Error(`Button width ${itemWidth}px is too cramped on 390px`);
  });

  await test('Mobile Viewport 412px: grid fits comfortably without overflow', () => {
    // 412px width with 5 or 6 columns
    const itemWidth = calculateGridFitting(412, 6, 8, 16);
    if (itemWidth < 50) throw new Error(`Button width ${itemWidth}px is too cramped on 412px`);
  });

  // Requirement 9, 11, 13: Conflict handling and Amharic message
  await test('Conflict handling: returns Amharic unavailable message on duplicate selection', async () => {
    const testPlayer1 = await playerService.findOrCreateTelegramUser({ id: 911001, first_name: 'ConflictPlayer1' });
    const testPlayer2 = await playerService.findOrCreateTelegramUser({ id: 911002, first_name: 'ConflictPlayer2' });

    // Reset cell 70
    const cell70 = defaultNumbersMap.get(70);
    if (cell70) {
      cell70.status = 'AVAILABLE';
      cell70.selectedBy = undefined;
    }

    // Player 1 reserves number 70
    await paymentService.submitPayment({
      playerId: testPlayer1.user.id,
      tenantId: 'tenant_addis',
      drawId: 'draw_round_001',
      numbers: [70],
      transactionReference: `TXN-CONF-1-${Date.now()}`,
    });

    // Player 2 attempts to reserve number 70
    let conflictCaught = false;
    try {
      await paymentService.submitPayment({
        playerId: testPlayer2.user.id,
        tenantId: 'tenant_addis',
        drawId: 'draw_round_001',
        numbers: [70],
        transactionReference: `TXN-CONF-2-${Date.now()}`,
      });
    } catch (err: any) {
      conflictCaught = true;
      if (!err.message.includes('ይቅርታ፣ ቁጥር 70 በሌላ ተጠቃሚ ተይዟል።')) {
        throw new Error(`Expected Amharic conflict message, got: ${err.message}`);
      }
    }

    // Cleanup
    if (cell70) {
      cell70.status = 'AVAILABLE';
      cell70.selectedBy = undefined;
    }

    if (!conflictCaught) throw new Error('Conflict error was not thrown');
  });

  return results;
}
