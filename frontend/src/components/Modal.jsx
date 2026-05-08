/**
 * @fileoverview Modal - Componente de diálogo reutilizable
 * Soporta tema claro/oscuro. Cierra con Escape y clic en overlay.
 *
 * @param {boolean}  open       - Controla visibilidad
 * @param {Function} onClose    - Callback al cerrar
 * @param {string}   title      - Título del modal
 * @param {string}   [size]     - 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * @param {ReactNode} children  - Contenido
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const Modal = ({ open, onClose, title, size = 'md', children }) => {
  const { isDark } = useTheme();
  const dialogRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Focus trap
  useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay modal-animate-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={dialogRef}
        className={`w-full ${SIZES[size]} rounded-2xl shadow-pharma-lg overflow-hidden modal-content-animate`}
        style={{ 
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: isDark ? '#334155' : '#E2E8F0' }}
        >
          <h2
            id="modal-title"
            className="text-base font-black tracking-tight"
            style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{
              color: isDark ? '#94A3B8' : '#64748B',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Cerrar modal"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
