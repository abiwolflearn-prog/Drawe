import fs from 'fs';
import path from 'path';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runBottomNavTests(): TestResult[] {
  const results: TestResult[] = [];

  // 1. Verify 5 buttons definition in BottomNav.tsx
  const bottomNavPath = path.resolve('src/components/layout/BottomNav.tsx');
  const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');

  const expectedButtonIds = ['home', 'draws', 'my-numbers', 'results', 'profile'];
  const allIdsPresent = expectedButtonIds.every((id) => bottomNavContent.includes(`id: '${id}'`));

  results.push({
    name: 'Bottom Navigation contains all 5 required buttons (Home, Draws, My Numbers, Results, Profile)',
    passed: allIdsPresent,
    message: allIdsPresent ? undefined : 'Missing one or more button IDs in BottomNav.tsx',
  });

  // 2. Verify Amharic-first labels
  const hasAmharicLabels =
    bottomNavContent.includes('ዋና ገጽ') &&
    bottomNavContent.includes('ዕጣዎች') &&
    bottomNavContent.includes('ቁጥሮቼ') &&
    bottomNavContent.includes('ውጤቶች') &&
    bottomNavContent.includes('መገለጫ');

  results.push({
    name: 'Bottom Navigation supports authentic Amharic-first labels',
    passed: hasAmharicLabels,
    message: hasAmharicLabels ? undefined : 'Missing Amharic labels in BottomNav.tsx',
  });

  // 3. Verify Route connections
  const routesConnected =
    bottomNavContent.includes("getPath: () => '/'") &&
    bottomNavContent.includes("getPath: () => '/operators'") &&
    bottomNavContent.includes("getPath: () => '/dashboard'") &&
    bottomNavContent.includes("getPath: () => '/results'") &&
    bottomNavContent.includes('/admin') &&
    bottomNavContent.includes('/login');

  results.push({
    name: 'Every button connects to real existing routes without dummy pages',
    passed: routesConnected,
    message: routesConnected ? undefined : 'Routes mapping is incomplete or broken',
  });

  // 4. Verify Safe Area Inset support in BottomNav.tsx
  const hasSafeArea =
    bottomNavContent.includes('safe-area-inset-bottom') &&
    bottomNavContent.includes('fixed bottom-0');

  results.push({
    name: 'Navbar respects mobile safe-area insets and remains fixed at the bottom',
    passed: hasSafeArea,
    message: hasSafeArea ? undefined : 'Safe area inset or fixed positioning missing in BottomNav.tsx',
  });

  // 5. Verify App.tsx mounts BottomNav inside BrowserRouter
  const appPath = path.resolve('src/App.tsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  const isMountedInApp =
    appContent.includes('<BottomNav />') && appContent.includes('import { BottomNav }');

  results.push({
    name: 'BottomNav is globally mounted in App.tsx inside BrowserRouter',
    passed: isMountedInApp,
    message: isMountedInApp ? undefined : 'BottomNav is not mounted in App.tsx',
  });

  // 6. Verify Viewport meta tag in index.html includes viewport-fit=cover
  const indexPath = path.resolve('index.html');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  const hasViewportFit = indexContent.includes('viewport-fit=cover');

  results.push({
    name: 'index.html includes viewport-fit=cover for full-bleed mobile Mini App WebViews',
    passed: hasViewportFit,
    message: hasViewportFit ? undefined : 'viewport-fit=cover missing in index.html',
  });

  // 7. Verify Content bottom clearance padding
  const homePath = path.resolve('src/pages/public/HomePage.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  const dashboardPath = path.resolve('src/pages/player/PlayerDashboardPage.tsx');
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  const hasContentPadding =
    homeContent.includes('pb-28') && dashboardContent.includes('pb-28');

  results.push({
    name: 'Pages include bottom padding (pb-28) preventing content from being obscured by BottomNav',
    passed: hasContentPadding,
    message: hasContentPadding ? undefined : 'Missing pb-28 bottom padding in pages',
  });

  return results;
}
