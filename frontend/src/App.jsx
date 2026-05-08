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
import Configuracion from './pages/Configuracion';

// Almacén
import Inventario from './pages/almacen/Inventario';
import Proveedores from './pages/almacen/Proveedores';
import Compras from './pages/almacen/Compras';

// Reportes
import ReporteVentas from './pages/reportes/ReporteVentas';
import ReporteStock from './pages/reportes/ReporteStock';
import Vencimientos from './pages/reportes/Vencimientos';

// Administración
import Usuarios from './pages/administracion/Usuarios';
import Caja from './pages/administracion/Caja';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// ── Layout autenticado ──────────────────────────────────────────
const AppLayout = ({ user, onLogout }) => {
  const { isDark } = useTheme();

  return (
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
            
            {/* Almacén */}
            <Route path="/inventario"  element={<Inventario />} />
            <Route path="/proveedores" element={<Proveedores />} />
            <Route path="/compras"     element={<Compras />} />

            {/* Reportes */}
            <Route path="/reportes/ventas"       element={<ReporteVentas />} />
            <Route path="/reportes/stock"        element={<ReporteStock />} />
            <Route path="/reportes/vencimientos" element={<Vencimientos />} />

            {/* Administración */}
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/caja"     element={<Caja />} />

            <Route path="/configuracion" element={<Configuracion user={user} onLogout={onLogout} />} />
            <Route path="*"          element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
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
      <Router>
        {!user
          ? <Login onLogin={handleLogin} />
          : <AppLayout user={user} onLogout={handleLogout} />
        }
      </Router>
    </ThemeProvider>
  );
}

export default App;
