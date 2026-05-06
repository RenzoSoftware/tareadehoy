/**
 * @fileoverview StockBadge - Indicador de stock con soporte de tema
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const getStockStatus = (actual, minimo) => {
  const a = Number(actual) || 0;
  const m = Number(minimo) || 0;
  if (a === 0)  return 'sin_stock';
  if (a <= m)   return 'critico';
  return 'ok';
};

const StockBadge = ({ stockActual, stockMinimo, showLabel = true }) => {
  const { isDark } = useTheme();
  const status = getStockStatus(stockActual, stockMinimo);

  if (status === 'sin_stock') return (
    <div className="flex flex-col items-center gap-1">
      <span className="px-3 py-1.5 rounded-xl text-xs font-black border-2"
        style={{ backgroundColor: isDark ? '#33415522' : '#F8FAFC', color: isDark ? '#64748B' : '#94A3B8', borderColor: isDark ? '#475569' : '#E2E8F0' }}
        aria-label="Sin stock">
        0 UDS
      </span>
      {showLabel && (
        <span className="text-[9px] font-black flex items-center gap-1 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
          <AlertTriangle size={9} aria-hidden="true" /> SIN STOCK
        </span>
      )}
    </div>
  );

  if (status === 'critico') return (
    <div className="flex flex-col items-center gap-1">
      <span className="px-3 py-1.5 rounded-xl text-xs font-black border-2"
        style={{ backgroundColor: isDark ? '#EF444415' : '#FEF2F2', color: '#EF4444', borderColor: isDark ? '#EF444430' : '#FECACA' }}
        aria-label={`Stock crítico: ${stockActual}`}>
        {stockActual} UDS
      </span>
      {showLabel && (
        <span className="text-[9px] font-black flex items-center gap-1 animate-pulse uppercase tracking-wider text-red-500"
          role="alert" aria-live="polite">
          <AlertTriangle size={9} aria-hidden="true" /> REABASTECER
        </span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="px-3 py-1.5 rounded-xl text-xs font-black border-2"
        style={{ backgroundColor: isDark ? '#3B82F615' : '#EFF6FF', color: '#3B82F6', borderColor: isDark ? '#3B82F630' : '#BFDBFE' }}
        aria-label={`Stock disponible: ${stockActual}`}>
        {stockActual} UDS
      </span>
    </div>
  );
};

export default StockBadge;
