/**
 * @fileoverview Cargos - Gestión de cargos/roles para administradores
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api';

const Cargos = () => {
  const { isDark } = useTheme();
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });

  useEffect(() => {
    // Simulamos la carga de cargos
    const mockCargos = [
      { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
      { id: 2, nombre: 'Cajero', descripcion: 'Registro de ventas y cobros' },
      { id: 3, nombre: 'Almacenero', descripcion: 'Gestión de stock e inventario' },
    ];
    setCargos(mockCargos);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black theme-text">Cargos</h2>
            <p className="text-xs theme-muted">Gestiona los roles y permisos del personal</p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          NUEVO CARGO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargos.map((cargo) => (
          <div key={cargo.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-pharma border theme-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2 py-1 bg-blue-500/10 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider">
                ID: {cargo.id}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                <button className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-base font-black theme-text">{cargo.nombre}</h3>
            <p className="text-xs theme-muted leading-relaxed">{cargo.descripcion}</p>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Cargo" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5 theme-muted">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border theme-border theme-bg theme-text focus:border-blue-500 transition-all"
              placeholder="Ej: Supervisor"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5 theme-muted">Descripción</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border theme-border theme-bg theme-text focus:border-blue-500 transition-all resize-none"
              placeholder="Descripción de las responsabilidades..."
            />
          </div>
          <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-colors mt-2">
            GUARDAR CARGO
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Cargos;
