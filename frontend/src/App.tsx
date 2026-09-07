/**
 * App.tsx — Root router.
 * Protected routes require a valid JWT in localStorage.
 * Unauthenticated users are redirected to /login.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratePage } from './pages/GeneratePage';
import { DebugPage } from './pages/DebugPage';
import { ExplainPage } from './pages/ExplainPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

/** Checks if user is logged in (JWT present in localStorage). */
function isAuthenticated(): boolean {
  try {
    const stored = localStorage.getItem('auth_user');
    return !!stored;
  } catch {
    return false;
  }
}

/** Wrapper that redirects to /login if not authenticated. */
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — wrapped in RequireAuth + AppLayout */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="generate"  element={<GeneratePage />} />
          <Route path="debug"     element={<DebugPage />} />
          <Route path="explain"   element={<ExplainPage />} />
          <Route path="history"   element={<HistoryPage />} />
          <Route path="settings"  element={<SettingsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
