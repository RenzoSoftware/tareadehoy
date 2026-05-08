/**
 * @fileoverview Login - Autenticación con paleta fija azul/celeste
 * Paleta: #1E3A8A, #3B82F6, #60A5FA, #93C5FD, #F8FAFC, #E2E8F0
 */

import React, { useState } from 'react';
import axios from 'axios';
import { Activity, User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [usuario, setUsuario]           = useState('');
  const [contrasena, setContrasena]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { usuario, contrasena });
      if (res.data.success) onLogin(res.data.user);
    } catch (err) {
      if (err.response) setError(err.response.data.message || 'Credenciales inválidas');
      else if (err.request) setError('No se pudo conectar con el servidor.');
      else setError('Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)' }}
    >
      {/* Decoración */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #60A5FA, transparent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #93C5FD, transparent)' }} />
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-3xl overflow-hidden shadow-pharma-lg">
          {/* Header */}
          <div className="px-8 py-10 text-center"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 mx-auto"
              style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6)' }}>
              <Activity size={32} className="text-white" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Botica Nova Salud</h2>
            <p className="text-sm mt-1 font-medium" style={{ color: '#93C5FD' }}>
              Sistema de Gestión Farmacéutico
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-2" role="alert">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-usuario" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} aria-hidden="true" />
                <input id="login-usuario" type="text" required autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium text-slate-800 transition-all"
                  placeholder="Ingrese su usuario" value={usuario} onChange={e => setUsuario(e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} aria-hidden="true" />
                <input id="login-password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm font-medium text-slate-800 transition-all"
                  placeholder="Ingrese su contraseña" value={contrasena} onChange={e => setContrasena(e.target.value)} />
                <button type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {showPassword ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full text-white font-black py-3.5 rounded-xl transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #60A5FA, #3B82F6, #1E3A8A)' }}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
        <p className="text-center text-slate-500 text-xs mt-6 font-medium">
          Botica Nova Salud · v2.0
        </p>
      </div>
    </div>
  );
};

export default Login;
