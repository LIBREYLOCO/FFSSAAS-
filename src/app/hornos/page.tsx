"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Plus, Pencil, ToggleLeft, ToggleRight,
  X, AlertCircle, CheckCircle2, RefreshCcw,
} from "lucide-react";

interface Horno {
  id: string;
  nombre: string;
  codigo: string;
  capacidadKg?: number;
  isActive: boolean;
  _count?: { sesiones: number };
  sucursal?: { nombre: string; codigo: string } | null;
}

const EMPTY_FORM = { nombre: "", codigo: "", capacidadKg: "" };

export default function HornosPage() {
  const [hornos, setHornos] = useState<Horno[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Horno | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchHornos = useCallback(() => {
    setLoading(true);
    fetch("/api/hornos")
      .then((r) => r.json())
      .then((d) => setHornos(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHornos(); }, [fetchHornos]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModal(true);
  };

  const openEdit = (h: Horno) => {
    setEditing(h);
    setForm({ nombre: h.nombre, codigo: h.codigo, capacidadKg: h.capacidadKg?.toString() ?? "" });
    setError("");
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.codigo) { setError("Nombre y código son requeridos."); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing ? `/api/hornos/${editing.id}` : "/api/hornos",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al guardar."); return; }
      setModal(false);
      fetchHornos();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (h: Horno) => {
    await fetch(`/api/hornos/${h.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !h.isActive }),
    });
    fetchHornos();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 border-b border-brand-gold-500/30 w-fit pb-1 block">
            Equipamiento
          </span>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">
            Hornos de Cremación
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Registro y gestión de los hornos por sucursal.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchHornos}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nuevo Horno
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-44 rounded-3xl animate-pulse" />
          ))
        ) : hornos.length === 0 ? (
          <div className="col-span-full glass-card rounded-3xl p-16 text-center space-y-3">
            <Flame size={48} className="mx-auto text-slate-600" />
            <p className="text-slate-400">No hay hornos registrados.</p>
            <button onClick={openCreate} className="btn-primary mx-auto flex items-center gap-2 w-fit">
              <Plus size={18} /> Agregar primer horno
            </button>
          </div>
        ) : (
          hornos.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-3xl p-6 space-y-4 border ${
                h.isActive ? "border-white/10" : "border-slate-700/40 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Flame size={22} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{h.nombre}</h3>
                    <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {h.codigo}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(h)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleToggle(h)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    title={h.isActive ? "Desactivar" : "Activar"}
                  >
                    {h.isActive
                      ? <ToggleRight size={20} className="text-green-400" />
                      : <ToggleLeft size={20} className="text-slate-500" />
                    }
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 text-xs text-slate-400 pt-3 border-t border-white/10">
                {h.capacidadKg && (
                  <span className="flex items-center gap-1">
                    <span className="text-brand-gold-500 font-bold">{h.capacidadKg} kg</span> cap. máx.
                  </span>
                )}
                {h._count !== undefined && (
                  <span>
                    <span className="text-brand-gold-500 font-bold">{h._count.sesiones}</span> cremaciones
                  </span>
                )}
                {h.sucursal && (
                  <span className="ml-auto font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                    {h.sucursal.codigo}
                  </span>
                )}
              </div>

              {/* Estado badge */}
              <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${
                h.isActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-slate-700/30 text-slate-500 border border-slate-600/20"
              }`}>
                {h.isActive ? "Operativo" : "Inactivo"}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal crear / editar */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-8 w-full max-w-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic">
                  {editing ? "Editar Horno" : "Nuevo Horno"}
                </h3>
                <button onClick={() => setModal(false)} className="p-2 rounded-xl hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input
                    className="input-field w-full"
                    placeholder="Ej: Horno Principal"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Código *</label>
                  <input
                    className="input-field w-full uppercase"
                    placeholder="Ej: HRN-01"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Capacidad máxima (kg)</label>
                  <input
                    type="number"
                    className="input-field w-full"
                    placeholder="Ej: 50"
                    value={form.capacidadKg}
                    onChange={(e) => setForm({ ...form, capacidadKg: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {saving
                    ? <span className="animate-pulse">Guardando...</span>
                    : <><CheckCircle2 size={16} /> {editing ? "Guardar" : "Crear"}</>
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
