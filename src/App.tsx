import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './i18n/index.js';
import { AuthProvider } from './context/AuthContext.js';
import { DrawProvider } from './context/DrawContext.js';

import { HomePage } from './pages/public/HomePage.js';
import { HowItWorksPage } from './pages/public/HowItWorksPage.js';
import { ResultsPage } from './pages/public/ResultsPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';

import { PlayerDashboardPage } from './pages/player/PlayerDashboardPage.js';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage.js';
import { AdminDrawsPage } from './pages/admin/AdminDrawsPage.js';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage.js';

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <DrawProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Player Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Player Routes */}
              <Route path="/dashboard" element={<PlayerDashboardPage />} />

              {/* Admin Control Routes */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/payments" element={<AdminPaymentsPage />} />
              <Route path="/admin/draws" element={<AdminDrawsPage />} />
              <Route path="/admin/board" element={<HomePage />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </DrawProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
