/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Paleta fija azul/celeste (#1E3A8A, #3B82F6, #60A5FA, #93C5FD) ──
        'p-primary':    '#1E3A8A',   // Azul oscuro principal
        'p-primary-2':  '#1D4ED8',   // Azul medio
        'p-blue':       '#3B82F6',   // Azul estándar
        'p-blue-2':     '#60A5FA',   // Azul claro
        'p-blue-3':     '#93C5FD',   // Azul muy claro
        'p-cyan':       '#06B6D4',   // Celeste acento
        'p-navy':       '#0F172A',   // Sidebar oscuro
        'p-navy-2':     '#1E293B',

        // ── Fondos neutros ──
        'p-bg':         '#F8FAFC',   // Fondo claro (#F8FAFC)
        'p-bg-2':       '#E2E8F0',   // Borde/separador (#E2E8F0)
        'p-card':       '#FFFFFF',
        'p-card-2':     '#F1F5F9',

        // ── Texto ──
        'p-text':       '#0F172A',
        'p-text-2':     '#334155',
        'p-muted':      '#64748B',
        'p-light':      '#94A3B8',

        // ── Semánticos ──
        'p-success':    '#10B981',
        'p-warning':    '#F59E0B',
        'p-danger':     '#EF4444',

        // ── Alias de compatibilidad ──
        'pharma-primary':  '#3B82F6',
        'pharma-cyan':     '#06B6D4',
        'pharma-navy':     '#0F172A',
        'pharma-bg':       '#F8FAFC',
        'pharma-card':     '#FFFFFF',
        'pharma-text':     '#0F172A',
        'pharma-muted':    '#64748B',
        'pharma-light':    '#94A3B8',
        'pharma-success':  '#10B981',
        'pharma-warning':  '#F59E0B',
        'pharma-danger':   '#EF4444',
        'botica-green':    '#3B82F6',
        'botica-dark':     '#1E3A8A',
        'pharma-accent':   '#06B6D4',
      },
      borderRadius: { 'xl': '1rem', '2xl': '1.5rem', '3xl': '2rem' },
      boxShadow: {
        'pharma':    '0 4px 24px -4px rgba(30,58,138,0.08)',
        'pharma-md': '0 8px 32px -4px rgba(30,58,138,0.14)',
        'pharma-lg': '0 16px 48px -8px rgba(30,58,138,0.20)',
        'blue':      '0 4px 20px -2px rgba(59,130,246,0.30)',
        'cyan':      '0 4px 20px -2px rgba(6,182,212,0.25)',
      },
    },
  },
  plugins: [],
}
