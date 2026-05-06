/**
 * @fileoverview TopVendidosChart - Gráfico de barras con soporte de tema
 * Paleta fija: #1E3A8A, #3B82F6, #60A5FA, #93C5FD
 */

import React from 'react';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BAR_GRADIENTS = [
  'linear-gradient(90deg, #3B82F6, #1E3A8A)',
  'linear-gradient(90deg, #60A5FA, #3B82F6)',
  'linear-gradient(90deg, #93C5FD, #60A5FA)',
  'linear-gradient(90deg, #06B6D4, #3B82F6)',
  'linear-gradient(90deg, #818CF8, #3B82F6)',
];

const BAR_BADGE = [
  { bg: '#EFF6FF', color: '#1E3A8A', border: '#BFDBFE' },
  { bg: '#DBEAFE', color: '#1D4ED8', border: '#93C5FD' },
  { bg: '#E0F2FE', color: '#0369A1', border: '#7DD3FC' },
  { bg: '#CFFAFE', color: '#0E7490', border: '#67E8F9' },
  { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
];

const TopVendidosChart = ({ topVendidos = [], periodo, onPeriodoChange, loading = false }) => {
  const { isDark } = useTheme();
  const maxVentas = topVendidos.length > 0 ? topVendidos[0].total_vendido : 1;

  const cardBg    = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder= isDark ? '#334155' : '#E2E8F0';
  const textMain  = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';
  const barBg     = isDark ? '#334155' : '#F1F5F9';

  return (
    <div className="rounded-2xl border p-7 h-full" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
      <div className="flex items-center justify-between mb-7">
        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: textMain }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }} aria-hidden="true">
            <TrendingUp size={14} className="text-white" />
          </span>
          Productos Top
        </h3>
        <div
          className="rounded-xl p-1 flex gap-1"
          style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}
          role="group" aria-label="Período"
        >
          {[30, 60, 90].map(d => (
            <button key={d} onClick={() => onPeriodoChange(d)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black transition-all"
              style={periodo === d
                ? { background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)', color: '#fff' }
                : { color: textMuted, backgroundColor: 'transparent' }
              }
              aria-pressed={periodo === d}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-5">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded animate-pulse" style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }} />
                <div className="h-4 w-16 rounded animate-pulse" style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }} />
              </div>
              <div className="h-2.5 rounded-full animate-pulse" style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && topVendidos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 gap-4" role="status" style={{ color: textMuted }}>
          <ShoppingBag size={44} style={{ color: isDark ? '#334155' : '#E2E8F0' }} aria-hidden="true" />
          <p className="text-sm font-bold">Sin datos en este periodo</p>
        </div>
      )}

      {!loading && topVendidos.length > 0 && (
        <ol className="space-y-5" aria-label="Ranking de productos más vendidos">
          {topVendidos.map((item, idx) => {
            const pct = Math.round((item.total_vendido / maxVentas) * 100);
            const badge = BAR_BADGE[idx] || BAR_BADGE[0];
            const darkBadge = { bg: `${badge.color}22`, color: badge.color === '#1E3A8A' ? '#93C5FD' : badge.color, border: `${badge.color}44` };
            return (
              <li key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0"
                      style={{ background: BAR_GRADIENTS[idx] }} aria-hidden="true">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold truncate" style={{ color: textMain }} title={item.nombre_comercial}>
                      {item.nombre_comercial}
                    </span>
                  </div>
                  <span className="text-[10px] font-black px-2 py-1 rounded-lg border shrink-0 ml-2"
                    style={isDark
                      ? { backgroundColor: darkBadge.bg, color: darkBadge.color, borderColor: darkBadge.border }
                      : { backgroundColor: badge.bg, color: badge.color, borderColor: badge.border }
                    }>
                    {item.total_vendido} uds
                  </span>
                </div>
                <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: barBg }}
                  role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${pct}%`, background: BAR_GRADIENTS[idx] }} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default TopVendidosChart;
