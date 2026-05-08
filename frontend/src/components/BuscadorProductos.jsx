/**
 * @fileoverview BuscadorProductos - Búsqueda fuzzy con soporte de tema
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Search, Package, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5001/api';

const agruparPorPrincipioActivo = (productos) =>
  productos.reduce((acc, p) => {
    const key = p.principio_activo || 'Sin principio activo';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

const StockIndicator = ({ stockTotal }) => {
  const stock = Number(stockTotal) || 0;
  if (stock === 0) return <span className="flex items-center gap-1 text-[10px] font-black text-red-500"><AlertTriangle size={9} aria-hidden="true" /> SIN STOCK</span>;
  if (stock <= 10) return <span className="flex items-center gap-1 text-[10px] font-black text-amber-500"><AlertTriangle size={9} aria-hidden="true" /> BAJO ({stock})</span>;
  return <span className="flex items-center gap-1 text-[10px] font-black" style={{ color: '#3B82F6' }}><CheckCircle size={9} aria-hidden="true" /> DISP. ({stock})</span>;
};

const BuscadorProductos = ({ onSelect, placeholder = 'Buscar por nombre o principio activo...', className = '' }) => {
  const { isDark } = useTheme();
  const [term, setTerm]                     = useState('');
  const [resultados, setResultados]         = useState([]);
  const [loading, setLoading]               = useState(false);
  const [abierto, setAbierto]               = useState(false);
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const [error, setError]                   = useState(null);
  const debounceRef  = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const buscar = useCallback((valor) => {
    clearTimeout(debounceRef.current);
    setTerm(valor);
    if (valor.trim().length < 2) { setResultados([]); setAbierto(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const res = await axios.get(`${API_BASE}/productos/search`, { params: { term: valor.trim() } });
        setResultados(res.data);
        setAbierto(true);
        const grupos = agruparPorPrincipioActivo(res.data);
        setGruposAbiertos(Object.keys(grupos).reduce((a, k) => ({ ...a, [k]: true }), {}));
      } catch { setError('Error al buscar'); setResultados([]); }
      finally { setLoading(false); }
    }, 300);
  }, []);

  const handleSelect = (producto) => {
    setTerm(producto.nombre_comercial);
    setAbierto(false);
    setResultados([]);
    if (onSelect) onSelect(producto);
  };

  const grupos = agruparPorPrincipioActivo(resultados);

  const inputBg    = isDark ? '#334155' : '#F8FAFC';
  const inputBorder= isDark ? '#475569' : '#E2E8F0';
  const dropBg     = isDark ? '#1E293B' : '#FFFFFF';
  const dropBorder = isDark ? '#334155' : '#E2E8F0';
  const textMain   = isDark ? '#F1F5F9' : '#0F172A';
  const textMuted  = isDark ? '#94A3B8' : '#64748B';
  const groupBg    = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)';
  const hoverBg    = isDark ? 'rgba(59,130,246,0.06)' : 'rgba(59,130,246,0.03)';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={15} style={{ color: textMuted }} aria-hidden="true" />
        <input
          type="search" role="combobox" aria-expanded={abierto}
          aria-autocomplete="list" aria-controls="buscador-resultados"
          placeholder={placeholder} value={term}
          onChange={e => buscar(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none border transition-all"
          style={{ backgroundColor: inputBg, borderColor: inputBorder, color: textMain }}
          onFocus={e => { if (resultados.length > 0) setAbierto(true); e.target.style.borderColor = '#3B82F6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
          onBlur={e => { e.target.style.borderColor = inputBorder; e.target.style.boxShadow = 'none'; }}
        />
        {loading && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" role="status" aria-label="Buscando" />}
      </div>

      {abierto && (
        <div id="buscador-resultados" role="listbox"
          className="absolute left-0 right-0 mt-2 rounded-2xl shadow-pharma-lg z-50 max-h-96 overflow-y-auto custom-scrollbar border"
          style={{ backgroundColor: dropBg, borderColor: dropBorder }}>
          <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${dropBorder}` }}>
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: textMuted }}>
              {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
            </span>
          </div>

          {error && <div className="px-4 py-3 text-sm text-red-500 font-bold" role="alert">{error}</div>}

          {!error && resultados.length === 0 && !loading && (
            <div className="px-4 py-8 text-center" role="status" style={{ color: textMuted }}>
              <Package size={28} className="mx-auto mb-2" style={{ color: isDark ? '#334155' : '#E2E8F0' }} aria-hidden="true" />
              <p className="text-sm font-bold">Sin resultados</p>
            </div>
          )}

          {Object.entries(grupos).map(([principio, items]) => {
            const isOpen = gruposAbiertos[principio] !== false;
            return (
              <div key={principio} style={{ borderBottom: `1px solid ${dropBorder}` }} className="last:border-0">
                <button
                  onClick={() => setGruposAbiertos(p => ({ ...p, [principio]: !p[principio] }))}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                  style={{ backgroundColor: groupBg }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = groupBg}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#3B82F6' }}>{principio}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                      style={{ backgroundColor: isDark ? '#334155' : '#FFFFFF', color: textMuted, borderColor: dropBorder }}>
                      {items.length} marca{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={13} style={{ color: textMuted }} aria-hidden="true" /> : <ChevronDown size={13} style={{ color: textMuted }} aria-hidden="true" />}
                </button>

                {isOpen && (
                  <ul>
                    {items.map(p => {
                      const sinStock = Number(p.stock_total) === 0;
                      return (
                        <li key={p.id_producto}>
                          <button
                            role="option" aria-selected="false"
                            onClick={() => !sinStock && handleSelect(p)}
                            className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors"
                            style={{ opacity: sinStock ? 0.5 : 1, cursor: sinStock ? 'not-allowed' : 'pointer' }}
                            onMouseEnter={e => { if (!sinStock) e.currentTarget.style.backgroundColor = hoverBg; }}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-black truncate" style={{ color: textMain }}>
                                {p.nombre_comercial}
                                {sinStock && (
                                  <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded border text-amber-600"
                                    style={{ backgroundColor: isDark ? '#F59E0B15' : '#FFFBEB', borderColor: isDark ? '#F59E0B30' : '#FDE68A' }}>
                                    GENÉRICO ALT.
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] mt-0.5" style={{ color: textMuted }}>
                                {p.nombre_presentacion} · {p.concentracion} · {p.nombre_laboratorio}
                              </p>
                            </div>
                            <div className="text-right shrink-0 ml-3 space-y-1">
                              <StockIndicator stockTotal={p.stock_total} />
                              {p.precio_unitario && (
                                <p className="text-xs font-black" style={{ color: textMain }}>
                                  S/ {parseFloat(p.precio_unitario).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BuscadorProductos;
