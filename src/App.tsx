import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { CategoryPage } from './pages/CategoryPage';
import { ToolPage } from './pages/ToolPage';

import { RedirectHandler } from './pages/RedirectHandler';
import { AuthProvider } from './context/AuthContext';
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
        <span className="text-xs font-medium text-[#64748B]">Loading Zenvio FXO...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Standalone Dynamic QR Redirect Route */}
            <Route path="/r/:code" element={<RedirectHandler />} />

            {/* Main App Routes */}
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tools" element={<AllToolsPage />} />
              <Route path="tools/:slug" element={<ToolPage />} />
              <Route path="category/:categoryId" element={<CategoryPage />} />
              <Route path="auth/sign-in" element={<SignInPage />} />
              <Route path="auth/sign-up" element={<SignUpPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
