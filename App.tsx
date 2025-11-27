import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import { AuthState } from './types';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });

  const handleLogin = (email: string) => {
    setAuth({
      isAuthenticated: true,
      user: {
        id: '1',
        email: email,
        name: 'John Doe'
      }
    });
  };

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      user: null
    });
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          auth.isAuthenticated ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />
        
        <Route path="/" element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
            <Layout user={auth.user} onLogout={handleLogout}>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/upload" element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
             <Layout user={auth.user} onLogout={handleLogout}>
              <Upload />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/review" element={
          <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
             <Layout user={auth.user} onLogout={handleLogout}>
              <Review />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </HashRouter>
  );
};

export default App;