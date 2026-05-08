/**
 * @fileoverview Dashboard - Página principal con soporte de tema claro/oscuro
 * Paleta fija: #1E3A8A, #3B82F6, #60A5FA, #93C5FD, #F8FAFC, #E2E8F0
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, AlertTriangle, Package, TrendingUp, Users, Calendar } from 'lucide-react';
import TopVendidosChart from '../components/TopVendidosChart';
import AlertasVencimiento from '../components/AlertasVencimiento';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api';

// ── KPI Card ──────────────────────────────────────────────────
const KpiCard = ({ label, value, icon: Icon, gradient, loading, isDark }) => (
  <div
    className="rounded-2xl p-6 border flex flex-col gap-4 transition-all hover:shadow-pharma-md duration-300"
    style={{
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderColor: isDark ? '#334155' : '#E2E8F0',
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
      style={{ background: gradient }}
      aria-hidden="true"
    >
      <Icon size={20} />
    </div>
    <div>
      <p
        className="text-[10px] font-black uppercase tracking-[0.18em] mb-1"
        style={{ color: isDark ? '#475569' : '#94A3B8' }}
      >
        {label}
      </p>
      <h3 className="text-2xl font-black" style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}>
        {loading
          ? <span className="inline-block w-20 h-7 rounded-lg animate-pulse"
              style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }} aria-label="Cargando" />
          : value
        }
      </h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats]             = useState({ totalVentas: 0, cantidadVentas: 0 });
  const [topVendidos, setTopVendidos] = useState([]);
  const [periodo, setPeriodo]         = useState(30);
  const [criticos, setCriticos]       = useState([]);
  const [porVencer, setPorVencer]     = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [loadingStats, setLoadingStats]       = useState(true);
  const [loadingTop, setLoadingTop]           = useState(true);
  const [loadingCriticos, setLoadingCriticos] = useState(true);
  const [loadingVencer, setLoadingVencer]     = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try { const r = await axios.get(`${API_BASE}/ventas/resumen-hoy`); setStats(r.data); }
    catch { /* silencioso */ } finally { setLoadingStats(false); }
  }, []);

  const fetchTopVendidos = useCallback(async () => {
    setLoadingTop(true);
    try { const r = await axios.get(`${API_BASE}/ventas/top-vendidos`, { params: { dias: periodo } }); setTopVendidos(r.data); }
    catch { /* silencioso */ } finally { setLoadingTop(false); }
  }, [periodo]);

  const fetchCriticos = useCallback(async () => {
    setLoadingCriticos(true);
    try { const r = await axios.get(`${API_BASE}/productos/criticos`); setCriticos(r.data); }
    catch { /* silencioso */ } finally { setLoadingCriticos(false); }
  }, []);

  const fetchPorVencer = useCallback(async () => {
    setLoadingVencer(true);
    try { const r = await axios.get(`${API_BASE}/productos/por-vencer`); setPorVencer(r.data); }
    catch { /* silencioso */ } finally { setLoadingVencer(false); }
  }, []);

  const fetchTopClientes = useCallback(async () => {
    setLoadingClientes(true);
    try { const r = await axios.get(`${API_BASE}/clientes/top-frecuentes`); setTopClientes(r.data); }
    catch { /* silencioso */ } finally { setLoadingClientes(false); }
  }, []);

  useEffect(() => { fetchStats(); fetchCriticos(); fetchPorVencer(); fetchTopClientes(); }, [fetchStats, fetchCriticos, fetchPorVencer, fetchTopClientes]);
  useEffect(() => { fetchTopVendidos(); }, [fetchTopVendidos]);

  const kpis = [
    { label: 'Ventas del Día',   value: `S/ ${parseFloat(stats.totalVentas || 0).toFixed(2)}`, icon: DollarSign, gradient: 'linear-gradient(135deg, #3B82F6, #1E3A8A)', loading: loadingStats },
    { label: 'Transacciones',    value: stats.cantidadVentas || 0, icon: ShoppingBag, gradient: 'linear-gradient(135deg, #60A5FA, #3B82F6)', loading: loadingStats },
    { label: 'Stock Crítico',    value: criticos.length, icon: AlertTriangle, gradient: criticos.length > 0 ? 'linear-gradient(135deg, #F87171, #EF4444)' : 'linear-gradient(135deg, #34D399, #10B981)', loading: loadingCriticos },
    { label: 'Por Vencer (30d)', value: porVencer.length, icon: Package, gradient: porVencer.length > 0 ? 'linear-gradient(135deg, #FBBF24, #F59E0B)' : 'linear-gradient(135deg, #93C5FD, #60A5FA)', loading: loadingVencer },
  ];

  const cardBg    = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder= isDark ? '#334155' : '#E2E8F0';
  const textMain  = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const rowHover  = isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.03)';

  return (
    <div className="space-y-6 animate-in">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight" style={{ color: textMain }}>Visión General</h2>
          <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: textMuted }}>
            Análisis de rendimiento y stock · Botica Nova Salud
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border theme-border theme-bg" style={{ borderColor: cardBorder }}>
          <Calendar size={14} className="theme-muted" />
          <span className="text-xs font-black theme-text">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, i) => <KpiCard key={i} {...kpi} isDark={isDark} />)}
      </div>

      {/* Fila 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopVendidosChart topVendidos={topVendidos} periodo={periodo} onPeriodoChange={setPeriodo} loading={loadingTop} />

        {/* Alertas de Stock */}
        <div className="rounded-2xl border p-7" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-6" style={{ color: textMain }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F87171, #EF4444)' }} aria-hidden="true">
              <AlertTriangle size={14} className="text-white" />
            </span>
            Alertas Críticas de Stock
          </h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar" role="list" aria-live="polite">
            {loadingCriticos && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-14 rounded-xl animate-pulse" style={{ backgroundColor: isDark ? '#334155' : '#F1F5F9' }} />
                ))}
              </div>
            )}
            {!loadingCriticos && criticos.length > 0 && criticos.map((p, idx) => (
              <div key={idx}
                className="flex items-center justify-between p-4 rounded-xl border transition-colors"
                style={{ backgroundColor: isDark ? '#EF444415' : '#FEF2F2', borderColor: isDark ? '#EF444430' : '#FECACA' }}
                role="listitem"
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#EF444420' : '#FEE2E2'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = isDark ? '#EF444415' : '#FEF2F2'}
              >
                <div className="min-w-0">
                  <p className="text-sm font-black truncate" style={{ color: textMain }}>{p.nombre_comercial}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: textMuted }}>
                    {p.principio_activo || p.nombre_categoria}
                  </p>
                </div>
                <span className="shrink-0 ml-3 text-[10px] font-black px-3 py-1.5 rounded-lg border flex items-center gap-1"
                  style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', color: '#EF4444', borderColor: isDark ? '#EF444430' : '#FECACA' }}>
                  <AlertTriangle size={9} aria-hidden="true" /> {p.stock_total ?? 0} uds
                </span>
              </div>
            ))}
            {!loadingCriticos && criticos.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-3" role="status" style={{ color: textMuted }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }}>
                  <Package size={28} style={{ color: '#3B82F6' }} aria-hidden="true" />
                </div>
                <p className="text-sm font-bold">Todo el inventario está bajo control</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertasVencimiento productos={porVencer} loading={loadingVencer} />

        {/* Top Clientes */}
        <div className="rounded-2xl border p-7" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-6" style={{ color: textMain }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #3B82F6)' }} aria-hidden="true">
              <Users size={14} className="text-white" />
            </span>
            Clientes Frecuentes
          </h3>
          <div className="space-y-4">
            {loadingClientes && (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 rounded-xl animate-pulse" style={{ backgroundColor: isDark ? '#334155' : '#F1F5F9' }} />
                ))}
              </div>
            )}
            {!loadingClientes && topClientes.length > 0 && topClientes.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border theme-border transition-all hover:translate-x-1"
                style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}>
                    {c.nombres_razon.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate theme-text">{c.nombres_razon}</p>
                    <p className="text-[10px] theme-muted font-bold uppercase tracking-widest">{c.total_compras} compras realizadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-500">S/ {parseFloat(c.total_invertido).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 4: Resumen y Estado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border p-7" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-6" style={{ color: textMain }}>
            <TrendingUp size={14} className="theme-primary" />
            Estado del Sistema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Stock Crítico', value: criticos.length, status: criticos.length > 0 ? 'danger' : 'success' },
              { label: 'Próximos a Vencer', value: porVencer.length, status: porVencer.length > 5 ? 'warning' : 'info' },
              { label: 'Ventas de Hoy', value: stats.cantidadVentas || 0, status: 'info' },
              { label: 'Ingresos Totales', value: `S/ ${parseFloat(stats.totalVentas || 0).toFixed(2)}`, status: 'success' },
            ].map((item, i) => {
              const colors = {
                danger:  { bg: '#EF444415', text: '#EF4444', border: '#EF444430' },
                warning: { bg: '#F59E0B15', text: '#F59E0B', border: '#F59E0B30' },
                success: { bg: '#10B98115', text: '#10B981', border: '#10B98130' },
                info:    { bg: '#3B82F615', text: '#3B82F6', border: '#3B82F630' }
              };
              const c = colors[item.status];
              return (
                <div key={i} className="p-4 rounded-xl border flex justify-between items-center"
                  style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: cardBorder }}>
                  <span className="text-xs font-bold theme-text uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg border"
                    style={{ backgroundColor: isDark ? c.bg : '#FFFFFF', color: c.text, borderColor: c.border }}>
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border p-7 flex flex-col justify-center items-center text-center gap-4"
          style={{ backgroundColor: cardBg, borderColor: cardBorder, background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            <ShoppingBag size={32} />
          </div>
          <div>
            <h4 className="text-white font-black text-lg">Nueva Venta</h4>
            <p className="text-blue-100 text-xs mt-1">Registra una transacción rápidamente</p>
          </div>
          <button className="w-full py-3 bg-white text-blue-700 font-black rounded-xl text-sm hover:bg-blue-50 transition-colors shadow-lg">
            IR AL POS
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
