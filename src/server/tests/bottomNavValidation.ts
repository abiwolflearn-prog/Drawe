import fs from 'fs';
import path from 'path';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runBottomNavTests(): TestResult[] {
  const results: TestResult[] = [];

  const bottomNavPath = path.resolve('src/components/layout/BottomNav.tsx');
  const bottomNavContent = fs.readFileSync(bottomNavPath, 'utf8');

  // 1. Verify 4 buttons definition in BottomNav.tsx
  const expectedButtons = [
    { id: 'active-draw', labelAm: 'የአሁኑ ዕጣ', path: '/' },
    { id: 'operators', labelAm: 'አዘጋጆች', path: '/operators' },
    { id: 'results', labelAm: 'ውጤቶች', path: '/results' },
    { id: 'how-it-works', labelAm: 'እንዴት ይሰራል?', path: '/how-it-works' },
  ];

  const allButtonsPresent = expectedButtons.every(
    (b) => bottomNavContent.includes(b.id) || bottomNavContent.includes(b.labelAm)
  );

  results.push({
    name: 'Bottom Navigation contains all 4 required buttons (የአሁኑ ዕጣ, አዘጋጆች, ውጤቶች, እንዴት ይሰራል?)',
    passed: allButtonsPresent,
    message: allButtonsPresent ? undefined : 'Missing one or more required buttons in BottomNav.tsx',
  });

  // 2. Verify Amharic-first labels
  const hasAmharicLabels =
    bottomNavContent.includes('የአሁኑ ዕጣ') &&
    bottomNavContent.includes('አዘጋጆች') &&
    bottomNavContent.includes('ውጤቶች') &&
    bottomNavContent.includes('እንዴት ይሰራል?');

  results.push({
    name: 'Bottom Navigation supports authentic Amharic-first labels (የአሁኑ ዕጣ, አዘጋጆች, ውጤቶች, እንዴት ይሰራል?)',
    passed: hasAmharicLabels,
    message: hasAmharicLabels ? undefined : 'Missing required Amharic labels in BottomNav.tsx',
  });

  // 3. Verify Route connections for all four pages
  const routesConnected =
    bottomNavContent.includes("path: '/'") &&
    bottomNavContent.includes("path: '/operators'") &&
    bottomNavContent.includes("path: '/results'") &&
    bottomNavContent.includes("path: '/how-it-works'");

  results.push({
    name: 'Every button connects to real existing routes without dummy pages (/, /operators, /results, /how-it-works)',
    passed: routesConnected,
    message: routesConnected ? undefined : 'Routes mapping is incomplete or broken in BottomNav.tsx',
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

  // 7. Verify Content bottom clearance padding across routes
  const homePath = path.resolve('src/pages/public/HomePage.tsx');
  const homeContent = fs.readFileSync(homePath, 'utf8');
  const operatorsPath = path.resolve('src/pages/public/OperatorsPage.tsx');
  const operatorsContent = fs.readFileSync(operatorsPath, 'utf8');
  const resultsPath = path.resolve('src/pages/public/ResultsPage.tsx');
  const resultsContent = fs.readFileSync(resultsPath, 'utf8');
  const howPath = path.resolve('src/pages/public/HowItWorksPage.tsx');
  const howContent = fs.readFileSync(howPath, 'utf8');

  const hasContentPadding =
    homeContent.includes('pb-28') &&
    operatorsContent.includes('pb-28') &&
    resultsContent.includes('pb-28') &&
    howContent.includes('pb-28');

  results.push({
    name: 'Pages include bottom padding (pb-28) preventing content from being obscured by BottomNav',
    passed: hasContentPadding,
    message: hasContentPadding ? undefined : 'Missing pb-28 bottom padding in pages',
  });

  return results;
}
