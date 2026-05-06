/**
 * @fileoverview Sidebar - Navegación lateral con configuración de usuario y tema
 * Paleta fija: #1E3A8A (primario), #3B82F6 (azul), #60A5FA/#93C5FD (claros)
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  LogOut, Activity, Settings, ChevronDown, ChevronUp,
  Sun, Moon, Bell, Key, User,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';

function cn(...inputs) { return twMerge(clsx(inputs)); }

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  path: '/' },
  { icon: ShoppingCart,    label: 'Ventas',      path: '/ventas' },
  { icon: Package,         label: 'Productos',   path: '/productos' },
  { icon: Users,           label: 'Clientes',    path: '/clientes' },
];

const Sidebar = ({ onLogout, user }) => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Colores del sidebar (siempre oscuro independiente del tema)
  const S = {
    bg:       'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)',
    border:   'rgba(255,255,255,0.06)',
    active:   'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(30,58,138,0.35))',
    activeBorder: '#60A5FA',
    hover:    'rgba(255,255,255,0.05)',
    text:     '#94A3B8',
    textHover:'#F1F5F9',
    textActive:'#FFFFFF',
    iconActive:'#60A5FA',
    iconMuted: '#475569',
    settingsBg:'rgba(255,255,255,0.04)',
  };

  return (
    <aside
      className="w-64 flex flex-col z-20 shrink-0 select-none"
      style={{ background: S.bg }}
      aria-label="Navegación principal"
    >
      {/* ── Logo ── */}
      <div
        className="px-5 py-6 flex items-center gap-3"
        style={{ borderBottom: `1px solid ${S.border}` }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
        >
          <Activity className="text-white" size={18} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-sm font-black text-white leading-none tracking-widest">PHARMA</h1>
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: '#60A5FA' }}>
            NOVA SALUD
          </span>
        </div>
      </div>

      {/* ── Menú principal ── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5" role="navigation">
        <p className="px-3 text-[9px] font-black uppercase tracking-[0.2em] mb-3" style={{ color: '#475569' }}>
          Menú Principal
        </p>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative"
              style={{
                background: isActive ? S.active : 'transparent',
                borderLeft: isActive ? `3px solid ${S.activeBorder}` : '3px solid transparent',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = S.hover; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <item.icon
                size={17}
                style={{ color: isActive ? S.iconActive : S.iconMuted }}
                className="shrink-0 transition-colors group-hover:!text-blue-300"
                aria-hidden="true"
              />
              <span
                className="text-sm font-semibold transition-colors group-hover:!text-white"
                style={{ color: isActive ? S.textActive : S.text }}
              >
                {item.label}
              </span>
              {isActive && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: S.activeBorder }}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Configuración de usuario ── */}
      <div
        className="px-3 pb-4"
        style={{ borderTop: `1px solid ${S.border}` }}
      >
        {/* Botón de configuración */}
        <button
          onClick={() => setSettingsOpen(o => !o)}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 mt-3"
          style={{ background: settingsOpen ? S.settingsBg : 'transparent' }}
          onMouseEnter={e => { if (!settingsOpen) e.currentTarget.style.background = S.hover; }}
          onMouseLeave={e => { if (!settingsOpen) e.currentTarget.style.background = settingsOpen ? S.settingsBg : 'transparent'; }}
          aria-expanded={settingsOpen}
          aria-label="Configuración de usuario"
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.username || 'Usuario'}</p>
            <p className="text-[9px] font-medium truncate" style={{ color: '#475569' }}>
              {user?.rol || 'Administrador'}
            </p>
          </div>
          {settingsOpen
            ? <ChevronUp size={14} style={{ color: '#475569' }} aria-hidden="true" />
            : <ChevronDown size={14} style={{ color: '#475569' }} aria-hidden="true" />
          }
        </button>

        {/* Panel de configuración desplegable */}
        {settingsOpen && (
          <div
            className="mt-1 rounded-xl overflow-hidden slide-in"
            style={{ background: S.settingsBg, border: `1px solid ${S.border}` }}
          >
            {/* Info usuario */}
            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${S.border}` }}>
              <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#475569' }}>
                Cuenta
              </p>
              <p className="text-xs font-bold text-white">{user?.username}</p>
              <p className="text-[10px]" style={{ color: '#475569' }}>
                {user?.email || 'sin email registrado'}
              </p>
            </div>

            {/* Opciones */}
            <div className="py-1">
              {/* Tema */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                style={{ color: S.text }}
                onMouseEnter={e => e.currentTarget.style.background = S.hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {isDark
                  ? <Sun size={14} style={{ color: '#F59E0B' }} aria-hidden="true" />
                  : <Moon size={14} style={{ color: '#60A5FA' }} aria-hidden="true" />
                }
                <span className="text-xs font-semibold">
                  {isDark ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
                <span
                  className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(96,165,250,0.15)',
                    color: isDark ? '#F59E0B' : '#60A5FA',
                  }}
                >
                  {isDark ? 'OSCURO' : 'CLARO'}
                </span>
              </button>

              {/* Notificaciones */}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                style={{ color: S.text }}
                onMouseEnter={e => e.currentTarget.style.background = S.hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Bell size={14} style={{ color: '#60A5FA' }} aria-hidden="true" />
                <span className="text-xs font-semibold">Notificaciones</span>
              </button>

              {/* Cambiar contraseña */}
              <button
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                style={{ color: S.text }}
                onMouseEnter={e => e.currentTarget.style.background = S.hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Key size={14} style={{ color: '#60A5FA' }} aria-hidden="true" />
                <span className="text-xs font-semibold">Cambiar Contraseña</span>
              </button>
            </div>

            {/* Cerrar sesión */}
            <div style={{ borderTop: `1px solid ${S.border}` }}>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                style={{ color: '#F87171' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                aria-label="Cerrar sesión"
              >
                <LogOut size={14} aria-hidden="true" />
                <span className="text-xs font-bold">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
