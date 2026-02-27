"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, MapPin, Phone, Mail, Pencil, X,
  ToggleLeft, ToggleRight, CheckCircle, AlertCircle
} from "lucide-react";

interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  telefono?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; serviceOrders: number; drivers: number };
}

const EMPTY_FORM = {
  nombre: "", codigo: "", direccion: "", ciudad: "",
  estado: "", telefono: "", email: "",
};

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Sucursal | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSucursales = () => {
    setLoading(true);
    fetch("/api/sucursales")
      .then((r) => r.json())
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSucursales(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (s: Sucursal) => {
    setEditing(s);
    setForm({
      nombre: s.nombre, codigo: s.codigo,
      direccion: s.direccion ?? "", ciudad: s.ciudad ?? "",
      estado: s.estado ?? "", telefono: s.telefono ?? "", email: s.email ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.nombre || !form.codigo) {
      setError("Nombre y código son requeridos.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        editing ? `/api/sucursales/${editing.id}` : "/api/sucursales",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Error al guardar."); return; }
      setModalOpen(false);
      fetchSucursales();
    } catch {
      setError("Error de red.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: Sucursal) => {
    await fetch(`/api/sucursales/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    fetchSucursales();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold italic tracking-tight">Sucursales</h2>
          <p className="text-slate-400">Gestiona las sedes del crematorio.</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 w-fit">
          <Plus size={20} />
          Nueva Sucursal
        </button>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-52 rounded-3xl animate-pulse" />
          ))
        ) : sucursales.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-3xl space-y-3">
            <Building2 size={48} className="mx-auto text-slate-600" />
            <p className="text-slate-400">No hay sucursales registradas.</p>
            <button onClick={openCreate} className="btn-primary mx-auto flex items-center gap-2 w-fit">
              <Plus size={18} /> Agregar primera sucursal
            </button>
          </div>
        ) : (
          sucursales.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card rounded-3xl p-6 space-y-4 border ${
                s.isActive ? "border-white/10" : "border-slate-700/40 opacity-60"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold-500/20 flex items-center justify-center">
                    <Building2 size={20} className="text-brand-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{s.nombre}</h3>
                    <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
                      {s.codigo}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(s)}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                    title={s.isActive ? "Desactivar" : "Activar"}
                  >
                    {s.isActive
                      ? <ToggleRight size={20} className="text-green-400" />
                      : <ToggleLeft size={20} className="text-slate-500" />
                    }
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1.5 text-sm text-slate-400">
                {(s.ciudad || s.estado) && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{[s.ciudad, s.estado].filter(Boolean).join(", ")}</span>
                  </div>
                )}
                {s.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{s.telefono}</span>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{s.email}</span>
                  </div>
                )}
              </div>

              {/* Counters */}
              {s._count && (
                <div className="flex gap-3 pt-2 border-t border-white/10 text-xs text-slate-400">
                  <span>{s._count.users} usuarios</span>
                  <span>·</span>
                  <span>{s._count.serviceOrders} órdenes activas</span>
                  <span>·</span>
                  <span>{s._count.drivers} conductores</span>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-8 w-full max-w-lg space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic">
                  {editing ? "Editar Sucursal" : "Nueva Sucursal"}
                </h3>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input
                    className="input-field w-full"
                    placeholder="Ej: Sucursal Norte"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Código *</label>
                  <input
                    className="input-field w-full uppercase"
                    placeholder="Ej: CDMX-01"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                  <input
                    className="input-field w-full"
                    placeholder="55 1234 5678"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Ciudad</label>
                  <input
                    className="input-field w-full"
                    placeholder="Guadalajara"
                    value={form.ciudad}
                    onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Estado</label>
                  <input
                    className="input-field w-full"
                    placeholder="Jalisco"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Dirección</label>
                  <input
                    className="input-field w-full"
                    placeholder="Av. Principal #123"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Email</label>
                  <input
                    className="input-field w-full"
                    type="email"
                    placeholder="sucursal@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="animate-pulse">Guardando...</span>
                  ) : (
                    <><CheckCircle size={18} /> {editing ? "Guardar cambios" : "Crear sucursal"}</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
