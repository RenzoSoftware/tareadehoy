/**
 * @fileoverview VencimientoBadge - Indicador de vencimiento con soporte de tema
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const getVencimientoCategoria = (dias) => {
  if (dias === null || dias === undefined) return 'na';
  const d = Number(dias);
  if (d <= 7)  return 'critico';
  if (d <= 30) return 'proximo';
  return 'normal';
};

const VencimientoBadge = ({ diasParaVencer, fechaVencimiento }) => {
  const { isDark } = useTheme();
  const categoria = getVencimientoCategoria(diasParaVencer);

  const fecha = fechaVencimiento
    ? new Date(fechaVencimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';

  if (categoria === 'na') return <span className="text-xs font-bold" style={{ color: isDark ? '#475569' : '#94A3B8' }}>N/A</span>;

  if (categoria === 'critico') return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold" style={{ color: isDark ? '#CBD5E1' : '#0F172A' }}>{fecha}</span>
      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1 animate-pulse"
        style={{ backgroundColor: isDark ? '#EF444415' : '#FEF2F2', color: '#EF4444', borderColor: isDark ? '#EF444430' : '#FECACA' }}
        role="alert">
        <AlertTriangle size={9} aria-hidden="true" /> CRÍTICO · {diasParaVencer}d
      </span>
    </div>
  );

  if (categoria === 'proximo') return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold" style={{ color: isDark ? '#CBD5E1' : '#0F172A' }}>{fecha}</span>
      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1"
        style={{ backgroundColor: isDark ? '#F59E0B15' : '#FFFBEB', color: '#F59E0B', borderColor: isDark ? '#F59E0B30' : '#FDE68A' }}>
        <Clock size={9} aria-hidden="true" /> PRÓXIMO · {diasParaVencer}d
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs font-bold" style={{ color: isDark ? '#CBD5E1' : '#0F172A' }}>{fecha}</span>
      <span className="text-[9px] font-black px-2 py-0.5 rounded-lg border flex items-center gap-1"
        style={{ backgroundColor: isDark ? '#3B82F615' : '#EFF6FF', color: '#3B82F6', borderColor: isDark ? '#3B82F630' : '#BFDBFE' }}>
        <CheckCircle size={9} aria-hidden="true" /> OK
      </span>
    </div>
  );
};

export default VencimientoBadge;
