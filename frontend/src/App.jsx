import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/routes/RouteGuards';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { FeedPage } from './pages/feed/FeedPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ConnectionsPage } from './pages/connections/ConnectionsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Global toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              borderRadius: '10px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              padding: '10px 16px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public-only routes (redirect to home if logged in) */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />

          {/* Protected routes (redirect to login if not authenticated) */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedRoute>
                <ConnectionsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
