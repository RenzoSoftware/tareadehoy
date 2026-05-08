/**
 * @fileoverview App - Raíz de la aplicación
 * Integra ThemeProvider, UserProvider, Router y layout principal.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Productos from './pages/Productos';
import Clientes from './pages/Clientes';
import Categorias from './pages/Categorias';
import Cargos from './pages/Cargos';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// ── Ruta protegida por rol ──────────────────────────────────────
const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.cargo)) return <Navigate to="/" />;
  return children;
};

// ── Layout autenticado ──────────────────────────────────────────
const AppLayout = ({ user, onLogout }) => {
  const { isDark } = useTheme();

  return (
    <Router>
      <div
        className="flex h-screen overflow-hidden font-sans transition-colors duration-200"
        style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}
      >
        <Sidebar onLogout={onLogout} user={user} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar user={user} />
          <main
            className="flex-1 overflow-y-auto p-6 custom-scrollbar transition-colors duration-200"
            style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}
          >
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/ventas"    element={<Ventas user={user} />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/clientes"  element={<Clientes />} />
              
              {/* Rutas de administración */}
              <Route 
                path="/admin/categorias" 
                element={
                  <ProtectedRoute user={user} allowedRoles={['Administrador']}>
                    <Categorias />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/cargos" 
                element={
                  <ProtectedRoute user={user} allowedRoles={['Administrador']}>
                    <Cargos />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*"          element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

// ── Raíz ────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <ThemeProvider>
      {!user
        ? <Login onLogin={handleLogin} />
        : <AppLayout user={user} onLogout={handleLogout} />
      }
    </ThemeProvider>
  );
}

export default App;
