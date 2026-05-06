/**
 * @fileoverview Contexto de internacionalización (i18n)
 * Uso: const { t } = useI18n(); t('dashboard.title')
 */

import React, { createContext, useContext, useState } from 'react';
import es from './es';

const translations = { es };

const I18nContext = createContext(null);

/**
 * Proveedor de i18n. Envuelve la aplicación para proveer traducciones.
 * @param {React.ReactNode} children
 */
export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState('es');

  /**
   * Obtiene una traducción por clave con notación de punto.
   * @param {string} key - Ej: 'dashboard.title'
   * @param {Object} [vars] - Variables de interpolación: { count: 5 }
   * @returns {string}
   */
  const t = (key, vars = {}) => {
    const keys   = key.split('.');
    let   result = translations[locale];

    for (const k of keys) {
      if (result == null) return key;
      result = result[k];
    }

    if (typeof result !== 'string') return key;

    // Interpolación simple: {{variable}}
    return result.replace(/\{\{(\w+)\}\}/g, (_, v) =>
      vars[v] !== undefined ? vars[v] : `{{${v}}}`
    );
  };

  return (
    <I18nContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
};

/**
 * Hook para acceder a las traducciones.
 * @returns {{ t: Function, locale: string, setLocale: Function }}
 */
export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de I18nProvider');
  return ctx;
};
