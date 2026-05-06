/**
 * @fileoverview AlertasVencimiento - Panel de alertas con soporte de tema
 */

import React, { useState } from 'react';
import { AlertTriangle, Clock, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const exportarPDF = (productos) => {
  const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const filas = productos.map(p => `
    <tr style="border-bottom:1px solid #E2E8F0;">
      <td style="padding:8px 12px;font-weight:600;">${p.nombre_comercial}</td>
      <td style="padding:8px 12px;color:#64748B;">${p.principio_activo || '—'}</td>
      <td style="padding:8px 12px;">${p.numero_lote}</td>
      <td style="padding:8px 12px;text-align:center;">${new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')}</td>
      <td style="padding:8px 12px;text-align:center;">${p.dias_para_vencer}</td>
      <td style="padding:8px 12px;text-align:center;">${p.stock_actual}</td>
      <td style="padding:8px 12px;text-align:center;">
        <span style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;
          background:${p.categoria_vencimiento === 'CRITICO' ? '#FEE2E2' : '#FEF3C7'};
          color:${p.categoria_vencimiento === 'CRITICO' ? '#DC2626' : '#D97706'};">
          ${p.categoria_vencimiento}
        </span>
      </td>
    </tr>`).join('');

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/>
    <title>Reporte Vencimientos</title>
    <style>body{font-family:Arial,sans-serif;margin:32px;color:#0F172A;}
    h1{color:#1E3A8A;font-size:20px;margin-bottom:4px;}
    p{color:#64748B;font-size:13px;margin-bottom:24px;}
    table{width:100%;border-collapse:collapse;font-size:13px;}
    thead tr{background:#1E3A8A;color:white;}
    thead th{padding:10px 12px;text-align:left;font-weight:700;}
    tbody tr:nth-child(even){background:#F8FAFC;}</style></head><body>
    <h1>⚠️ Reporte de Vencimientos Próximos</h1>
    <p>Botica Nova Salud · ${fecha} · ${productos.length} producto(s)</p>
    <table><thead><tr><th>Producto</th><th>Principio Activo</th><th>Lote</th>
    <th>Fecha Venc.</th><th>Días</th><th>Stock</th><th>Estado</th></tr></thead>
    <tbody>${filas}</tbody></table></body></html>`;

  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.focus(); setTimeout(() => w.print(), 500); }
};

const FILTROS = [
  { key: 'TODOS',   label: 'Todos' },
  { key: 'CRITICO', label: '⚠️ Crítico ≤7d' },
  { key: 'PROXIMO', label: '🕐 Próximo 8-30d' },
];

const AlertasVencimiento = ({ productos = [], loading = false }) => {
  const { isDark } = useTheme();
  const [filtro, setFiltro] = useState('TODOS');

  const filtrados    = filtro === 'TODOS' ? productos : productos.filter(p => p.categoria_vencimiento === filtro);
  const countCritico = productos.filter(p => p.categoria_vencimiento === 'CRITICO').length;
  const countProximo = productos.filter(p => p.categoria_vencimiento === 'PROXIMO').length;

  const cardBg    = isDark ? '#1E293B' : '#FFFFFF';
  const cardBorder= isDark ? '#334155' : '#E2E8F0';
  const textMain  = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="rounded-2xl border p-7" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: textMain }}>
          <span className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)' }} aria-hidden="true">
            <AlertTriangle size={14} className="text-white" />
          </span>
          Alertas de Vencimiento
        </h3>
        <button
          onClick={() => exportarPDF(filtrados)}
          disabled={filtrados.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-white text-[10px] font-black rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)' }}
          aria-label="Exportar PDF"
        >
          <FileText size={12} aria-hidden="true" /> PDF
        </button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-3 text-center border"
          style={{ backgroundColor: isDark ? '#EF444415' : '#FEF2F2', borderColor: isDark ? '#EF444430' : '#FECACA' }}>
          <p className="text-xl font-black text-red-500">{countCritico}</p>
          <p className="text-[9px] font-black uppercase tracking-wider text-red-400">Críticos ≤7d</p>
        </div>
        <div className="rounded-xl p-3 text-center border"
          style={{ backgroundColor: isDark ? '#F59E0B15' : '#FFFBEB', borderColor: isDark ? '#F59E0B30' : '#FDE68A' }}>
          <p className="text-xl font-black text-amber-500">{countProximo}</p>
          <p className="text-[9px] font-black uppercase tracking-wider text-amber-400">Próximos 8-30d</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap" role="group" aria-label="Filtrar por categoría">
        {FILTROS.map(f => (
          <button key={f.key} onClick={() => setFiltro(f.key)}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border"
            style={filtro === f.key
              ? { background: 'linear-gradient(135deg, #3B82F6, #1E3A8A)', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: isDark ? '#334155' : '#F8FAFC', color: textMuted, borderColor: cardBorder }
            }
            aria-pressed={filtro === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar" role="list" aria-live="polite">
        {loading && (
          <div className="space-y-2.5">
            {[1,2,3].map(i => (
              <div key={i} className="h-14 rounded-xl animate-pulse"
                style={{ backgroundColor: isDark ? '#334155' : '#F1F5F9' }} />
            ))}
          </div>
        )}

        {!loading && filtrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3" role="status" style={{ color: textMuted }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: isDark ? 'rgba(59,130,246,0.1)' : '#EFF6FF' }}>
              <AlertTriangle size={22} style={{ color: '#3B82F6' }} aria-hidden="true" />
            </div>
            <p className="text-sm font-bold">No hay alertas de vencimiento</p>
          </div>
        )}

        {!loading && filtrados.map((p, idx) => {
          const isCritico = p.categoria_vencimiento === 'CRITICO';
          return (
            <div key={`${p.id_lote}-${idx}`}
              className="flex items-center justify-between p-3.5 rounded-xl border transition-colors"
              style={{
                backgroundColor: isCritico
                  ? (isDark ? '#EF444415' : '#FEF2F2')
                  : (isDark ? '#F59E0B15' : '#FFFBEB'),
                borderColor: isCritico
                  ? (isDark ? '#EF444430' : '#FECACA')
                  : (isDark ? '#F59E0B30' : '#FDE68A'),
              }}
              role="listitem"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {isCritico
                  ? <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0 animate-pulse" aria-hidden="true" />
                  : <Clock size={15} className="text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
                }
                <div className="min-w-0">
                  <p className="text-sm font-black truncate" style={{ color: textMain }}>{p.nombre_comercial}</p>
                  <p className="text-[10px] font-bold" style={{ color: textMuted }}>
                    Lote: {p.numero_lote} · Stock: {p.stock_actual}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <span className="text-[10px] font-black px-2.5 py-1.5 rounded-lg border block mb-1"
                  style={{
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isCritico ? '#EF4444' : '#F59E0B',
                    borderColor: isCritico ? (isDark ? '#EF444430' : '#FECACA') : (isDark ? '#F59E0B30' : '#FDE68A'),
                  }}>
                  {p.dias_para_vencer}d
                </span>
                <span className="text-[9px] font-bold" style={{ color: textMuted }}>
                  {new Date(p.fecha_vencimiento).toLocaleDateString('es-PE')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertasVencimiento;
