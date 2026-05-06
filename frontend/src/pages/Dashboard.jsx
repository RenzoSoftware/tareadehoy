/**
 * @fileoverview Dashboard - Página principal con soporte de tema claro/oscuro
 * Paleta fija: #1E3A8A, #3B82F6, #60A5FA, #93C5FD, #F8FAFC, #E2E8F0
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DollarSign, ShoppingBag, AlertTriangle, Package, TrendingUp } from 'lucide-react';
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
  const [loadingStats, setLoadingStats]       = useState(true);
  const [loadingTop, setLoadingTop]           = useState(true);
  const [loadingCriticos, setLoadingCriticos] = useState(true);
  const [loadingVencer, setLoadingVencer]     = useState(true);

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

  useEffect(() => { fetchStats(); fetchCriticos(); fetchPorVencer(); }, [fetchStats, fetchCriticos, fetchPorVencer]);
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
      <div>
        <h2 className="text-2xl font-black tracking-tight" style={{ color: textMain }}>Visión General</h2>
        <p className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: textMuted }}>
          Análisis de rendimiento y stock · Botica Nova Salud
        </p>
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

        {/* Resumen */}
        <div className="rounded-2xl border p-7" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-6" style={{ color: textMain }}>
            <span className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }} aria-hidden="true">
              <TrendingUp size={14} className="text-white" />
            </span>
            Resumen del Sistema
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Productos con stock crítico', value: loadingCriticos ? '...' : criticos.length, danger: criticos.length > 0 },
              { label: 'Vencimiento crítico (≤7d)', value: loadingVencer ? '...' : porVencer.filter(p => p.categoria_vencimiento === 'CRITICO').length, danger: porVencer.filter(p => p.categoria_vencimiento === 'CRITICO').length > 0 },
              { label: 'Vencimiento próximo (8-30d)', value: loadingVencer ? '...' : porVencer.filter(p => p.categoria_vencimiento === 'PROXIMO').length, warn: porVencer.filter(p => p.categoria_vencimiento === 'PROXIMO').length > 0 },
              { label: 'Ingresos hoy', value: loadingStats ? '...' : `S/ ${parseFloat(stats.totalVentas || 0).toFixed(2)}`, info: true },
            ].map((row, i) => {
              const badgeStyle = row.danger
                ? { backgroundColor: isDark ? '#EF444420' : '#FEF2F2', color: '#EF4444', borderColor: isDark ? '#EF444430' : '#FECACA' }
                : row.warn
                ? { backgroundColor: isDark ? '#F59E0B20' : '#FFFBEB', color: '#F59E0B', borderColor: isDark ? '#F59E0B30' : '#FDE68A' }
                : { backgroundColor: isDark ? '#3B82F620' : '#EFF6FF', color: '#3B82F6', borderColor: isDark ? '#3B82F630' : '#BFDBFE' };
              return (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-xl"
                  style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
                  <span className="text-sm font-semibold" style={{ color: textMain }}>{row.label}</span>
                  <span className="text-sm font-black px-3 py-1 rounded-lg border" style={badgeStyle}>{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
