/**
 * @fileoverview Categorias - Gestión de categorías para administradores
 */

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useTheme } from '../context/ThemeContext';

const API_BASE = 'http://localhost:5000/api';

const Categorias = () => {
  const { isDark } = useTheme();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/productos/catalogos`);
      // Nota: la ruta catalogos devuelve { categorias, laboratorios, presentaciones }
      setCategorias(res.data.categorias);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí iría la lógica de guardado/edición (POST/PUT /api/categorias)
    // Por ahora simulamos el guardado para la demo
    console.log('Guardando categoría:', form);
    setModalOpen(false);
    setForm({ nombre: '', descripcion: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <FolderTree size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black theme-text">Categorías</h2>
            <p className="text-xs theme-muted">Gestiona las categorías de productos</p>
          </div>
        </div>
        <button
          onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '' }); setModalOpen(true); }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={18} />
          NUEVA CATEGORÍA
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-pharma overflow-hidden border theme-border">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b theme-border">
            <tr>
              <th className="px-6 py-4 text-xs font-black theme-muted uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-xs font-black theme-muted uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y theme-border">
            {categorias.map((cat) => (
              <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold theme-text">{cat.nombre}</p>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditando(cat); setForm({ nombre: cat.nombre, descripcion: '' }); setModalOpen(true); }}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => { setCategoriaAEliminar(cat); setConfirmOpen(true); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Categoría' : 'Nueva Categoría'}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1.5 theme-muted">Nombre</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border theme-border theme-bg theme-text focus:border-blue-500 transition-all"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-colors mt-2"
          >
            {editando ? 'ACTUALIZAR' : 'GUARDAR'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => { console.log('Eliminando:', categoriaAEliminar); setConfirmOpen(false); }}
        title="¿Eliminar categoría?"
        message={`Esta acción no se puede deshacer. ¿Estás seguro de eliminar "${categoriaAEliminar?.nombre}"?`}
        type="danger"
      />
    </div>
  );
};

export default Categorias;
