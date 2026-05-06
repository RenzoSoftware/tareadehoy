/**
 * @fileoverview Navbar - Barra superior con soporte de tema claro/oscuro
 */

import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ user }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className="h-14 flex items-center justify-between px-6 z-10 shrink-0 transition-colors duration-200"
      style={{
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        borderBottom: `1px solid ${isDark ? '#334155' : '#E2E8F0'}`,
        boxShadow: isDark
          ? '0 1px 0 0 #334155'
          : '0 1px 0 0 #E2E8F0, 0 4px 16px -4px rgba(30,58,138,0.05)',
      }}
    >
      {/* Izquierda */}
      <div className="flex items-center gap-3">
        <h2
          className="text-sm font-black tracking-tight"
          style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
        >
          Panel de Control
        </h2>
        <span
          className="px-2.5 py-1 text-[9px] font-black rounded-full uppercase tracking-wider text-white hidden sm:inline"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
        >
          BOTICA NOVA SALUD
        </span>
      </div>

      {/* Derecha */}
      <div className="flex items-center gap-2">
        {/* Toggle tema */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isDark ? '#334155' : '#F1F5F9',
            color: isDark ? '#F59E0B' : '#3B82F6',
          }}
          aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
        </button>

        {/* Notificaciones */}
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{
            backgroundColor: isDark ? '#334155' : '#F1F5F9',
            color: isDark ? '#94A3B8' : '#64748B',
          }}
          aria-label="Notificaciones"
        >
          <Bell size={15} aria-hidden="true" />
        </button>

        {/* Separador */}
        <div
          className="w-px h-6 mx-1"
          style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }}
          aria-hidden="true"
        />

        {/* Info usuario */}
        <div className="text-right hidden sm:block">
          <p
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: isDark ? '#475569' : '#94A3B8' }}
          >
            Usuario
          </p>
          <p
            className="text-xs font-black leading-tight"
            style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
          >
            {user.username}
          </p>
        </div>

        {/* Avatar */}
        <div
          className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-black text-xs cursor-pointer hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
          aria-label={`Usuario: ${user.username}`}
          role="img"
        >
          {user.username.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
