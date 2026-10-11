import { runDrawEngineTests } from './drawEngine.js';
import { runTelegramIntegrationTests } from './telegramIntegration.js';
import { runMiniAppInteractiveTests } from './miniAppCapacityResponsive.js';
import { runAdminNotificationSecurityTests } from './adminNotificationSecurity.js';
import { runTelegramBotComprehensiveTests } from './telegramBotComprehensive.js';

async function main() {
  console.log('====================================================');
  console.log('   DRAWE SAAS — FULL TEST SUITE VERIFICATION    ');
  console.log('====================================================\n');

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  // 1. Draw Engine Unit Tests
  console.log('--- 1. DRAW ENGINE & FORMATTING UNIT TESTS ---');
  const drawResults = runDrawEngineTests();
  for (const r of drawResults) {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      totalFailed++;
      console.error(`  [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 2. Telegram Integration & Security Tests (11 Requirements)
  console.log('\n--- 2. TELEGRAM INTEGRATION & BUSINESS RULES TESTS ---');
  const telegramResults = await runTelegramIntegrationTests();
  for (const r of telegramResults) {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      totalFailed++;
      console.error(`  [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 3. Mini App Interactive & Viewport Tests
  console.log('\n--- 3. TELEGRAM MINI APP CAPACITY & VIEWPORT TESTS ---');
  const miniAppResults = await runMiniAppInteractiveTests();
  for (const r of miniAppResults) {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      totalFailed++;
      console.error(`  [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 4. Admin Notification & Security Isolation Tests
  console.log('\n--- 4. ADMIN NOTIFICATION & TENANT ISOLATION TESTS ---');
  const adminResults = await runAdminNotificationSecurityTests();
  for (const r of adminResults) {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      totalFailed++;
      console.error(`  [FAIL] ${r.name}: ${r.message}`);
    }
  }

  // 5. Telegram Bot Commands & Deduplication Comprehensive Tests
  console.log('\n--- 5. TELEGRAM BOT COMMANDS & DEDUPLICATION COMPREHENSIVE TESTS ---');
  const botCompResults = await runTelegramBotComprehensiveTests();
  for (const r of botCompResults) {
    totalTests++;
    if (r.passed) {
      totalPassed++;
      console.log(`  [PASS] ${r.name}`);
    } else {
      totalFailed++;
      console.error(`  [FAIL] ${r.name}: ${r.message}`);
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL: ${totalTests} | PASSED: ${totalPassed} | FAILED: ${totalFailed}`);
  console.log('====================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
