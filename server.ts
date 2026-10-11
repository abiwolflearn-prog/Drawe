import express, { Request, Response } from 'express';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './src/db/connect.js';
import { initializeSocketIO } from './src/server/socket.js';
import { runDrawEngineTests } from './src/server/tests/drawEngine.js';
import { runTelegramIntegrationTests } from './src/server/tests/telegramIntegration.js';
import { runMiniAppInteractiveTests } from './src/server/tests/miniAppCapacityResponsive.js';
import { runTelegramBotComprehensiveTests } from './src/server/tests/telegramBotComprehensive.js';

import authRouter from './src/server/routes/auth.js';
import drawsRouter from './src/server/routes/draws.js';
import paymentsRouter from './src/server/routes/payments.js';
import adminRouter from './src/server/routes/admin.js';
import superAdminRouter from './src/server/routes/superAdmin.js';
import telegramRouter from './src/server/routes/telegram.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  const PORT = Number(process.env.PORT) || 3000;

  // Initialize Real-Time Socket.IO
  initializeSocketIO(httpServer);

  // Run Draw Engine Automated Tests
  const testResults = runDrawEngineTests();
  const passedCount = testResults.filter((r: any) => r.passed).length;
  console.log(`[Test Suite] Draw Engine Tests: ${passedCount}/${testResults.length} PASSED`);

  // Run Telegram Integration Tests
  runTelegramIntegrationTests().then((tgTests) => {
    const tgPassed = tgTests.filter((r: any) => r.passed).length;
    console.log(`[Test Suite] Telegram Integration Tests: ${tgPassed}/${tgTests.length} PASSED`);
    tgTests.forEach(t => {
      console.log(`  ${t.passed ? '✓' : '✗'} ${t.name}: ${t.message}`);
    });
  }).catch((err) => {
    console.error('[Test Suite] Telegram Integration Tests error:', err);
  });

  // Run Telegram Mini App Interactive Tests
  runMiniAppInteractiveTests().then((miniAppTests) => {
    const miniAppPassed = miniAppTests.filter((r: any) => r.passed).length;
    console.log(`[Test Suite] Mini App Interactive Tests: ${miniAppPassed}/${miniAppTests.length} PASSED`);
    miniAppTests.forEach(t => {
      console.log(`  ${t.passed ? '✓' : '✗'} ${t.name}: ${t.message}`);
    });
  }).catch((err) => {
    console.error('[Test Suite] Mini App Interactive Tests error:', err);
  });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect Database
  await connectDB();

  // Health Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Adey Draw Platform API with Socket.IO Real-Time Sync',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Telegram Integration & Mini App Tests Endpoint
  app.get('/api/tests/telegram', async (req: Request, res: Response) => {
    const drawTests = runDrawEngineTests();
    const tgTests = await runTelegramIntegrationTests();
    const miniAppTests = await runMiniAppInteractiveTests();
    const botCompTests = await runTelegramBotComprehensiveTests();

    const totalPassed =
      drawTests.filter(t => t.passed).length +
      tgTests.filter(t => t.passed).length +
      miniAppTests.filter(t => t.passed).length +
      botCompTests.filter(t => t.passed).length;
    const totalCount = drawTests.length + tgTests.length + miniAppTests.length + botCompTests.length;

    res.json({
      status: totalPassed === totalCount ? 'ALL_PASSED' : 'SOME_FAILED',
      summary: `${totalPassed}/${totalCount} tests passed`,
      drawEngineTests: drawTests,
      telegramIntegrationTests: tgTests,
      miniAppInteractiveTests: miniAppTests,
      telegramBotComprehensiveTests: botCompTests,
    });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/draws', drawsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/super-admin', superAdminRouter);
  app.use('/api/telegram', telegramRouter);

  // Vite Integration in Development
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] 01-80 Number Draw Platform running on http://0.0.0.0:${PORT} with Socket.IO`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
