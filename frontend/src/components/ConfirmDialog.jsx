/**
 * @fileoverview ConfirmDialog - Diálogo de confirmación para acciones destructivas
 *
 * @param {boolean}  open       - Visibilidad
 * @param {Function} onConfirm  - Callback al confirmar
 * @param {Function} onCancel   - Callback al cancelar
 * @param {string}   title      - Título
 * @param {string}   message    - Mensaje descriptivo
 * @param {string}   [variant]  - 'danger' | 'warning' (default: 'danger')
 * @param {string}   [confirmLabel] - Texto del botón confirmar
 */

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ConfirmDialog = ({
  open, onConfirm, onCancel,
  title = '¿Confirmar acción?',
  message = 'Esta acción no se puede deshacer.',
  variant = 'danger',
  confirmLabel = 'Eliminar',
}) => {
  const { isDark } = useTheme();
  if (!open) return null;

  const colors = variant === 'danger'
    ? { bg: '#FEF2F2', icon: '#EF4444', btn: '#EF4444', btnHover: '#DC2626' }
    : { bg: '#FFFBEB', icon: '#F59E0B', btn: '#F59E0B', btnHover: '#D97706' };

  return (
    <div
      className="modal-overlay animate-in"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        className="w-full max-w-sm rounded-2xl shadow-pharma-lg overflow-hidden slide-in"
        style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }}
      >
        <div className="p-6 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.bg }}
          >
            {variant === 'danger'
              ? <Trash2 size={24} style={{ color: colors.icon }} aria-hidden="true" />
              : <AlertTriangle size={24} style={{ color: colors.icon }} aria-hidden="true" />
            }
          </div>
          <h3
            id="confirm-title"
            className="text-base font-black mb-2"
            style={{ color: isDark ? '#F1F5F9' : '#0F172A' }}
          >
            {title}
          </h3>
          <p
            id="confirm-desc"
            className="text-sm mb-6"
            style={{ color: isDark ? '#94A3B8' : '#64748B' }}
          >
            {message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors border"
              style={{
                color: isDark ? '#94A3B8' : '#64748B',
                borderColor: isDark ? '#334155' : '#E2E8F0',
                backgroundColor: 'transparent',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm font-black text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.btn }}
              autoFocus
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
