"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Plus, Pencil, ToggleLeft, ToggleRight,
  X, AlertCircle, CheckCircle2, RefreshCcw,
  Building2, Thermometer,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SesionActiva {
  id: string;
  operadorNombre: string;
  fechaInicio: string;
}

interface Horno {
  id: string;
  nombre: string;
  codigo: string;
  capacidadKg?: number | null;
  isActive: boolean;
  sucursalId?: string | null;
  sucursal?: { id: string; nombre: string; codigo: string } | null;
  _count?: { sesiones: number };
  sesiones?: SesionActiva[];   // sesión activa (fechaFin = null), máx. 1
}

interface Sucursal {
  id: string;
  nombre: string;
  codigo: string;
}

const EMPTY_FORM = { nombre: "", codigo: "", capacidadKg: "", sucursalId: "" };

// ── Status helpers ────────────────────────────────────────────────────────────
function getStatus(h: Horno): { label: string; color: string; dot: string } {
  if (!h.isActive)              return { label: "Inactivo",   color: "text-slate-400", dot: "bg-slate-500" };
  if (h.sesiones?.length)       return { label: "En uso",     color: "text-orange-400", dot: "bg-orange-400 animate-pulse" };
  return                               { label: "Disponible", color: "text-green-400",  dot: "bg-green-400" };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HornosPage() {
  const [hornos,     setHornos]     = useState<Horno[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [editing,    setEditing]    = useState<Horno | null>(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchHornos = useCallback(() => {
    setLoading(true);
    fetch("/api/hornos")
      .then((r) => r.json())
      .then((d) => setHornos(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchHornos();
    fetch("/api/sucursales")
      .then((r) => r.json())
      .then((d) => setSucursales(Array.isArray(d) ? d.filter((s: Sucursal & { isActive: boolean }) => s.isActive) : []))
      .catch(console.error);
  }, [fetchHornos]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError("");
    setModal(true);
  };

  const openEdit = (h: Horno) => {
    setEditing(h);
    setForm({
      nombre:      h.nombre,
      codigo:      h.codigo,
      capacidadKg: h.capacidadKg?.toString() ?? "",
      sucursalId:  h.sucursalId ?? "",
    });
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
          body: JSON.stringify({
            nombre:      form.nombre,
            codigo:      form.codigo,
            capacidadKg: form.capacidadKg || null,
            sucursalId:  form.sucursalId  || null,
          }),
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

  // ── Summary stats ─────────────────────────────────────────────────────────
  const total      = hornos.length;
  const activos    = hornos.filter((h) => h.isActive).length;
  const enUso      = hornos.filter((h) => h.sesiones?.length).length;
  const disponibles = activos - enUso;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 block">
            Equipamiento
          </span>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">
            Hornos de Cremación
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Registro y estado en tiempo real de los hornos por sucursal.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchHornos}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-widest transition-all"
          >
            <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nuevo Horno
          </button>
        </div>
      </header>

      {/* Stats strip */}
      {!loading && hornos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total",       value: total,       color: "text-slate-300" },
            { label: "Operativos",  value: activos,     color: "text-brand-gold-500" },
            { label: "En uso",      value: enUso,       color: "text-orange-400" },
            { label: "Disponibles", value: disponibles, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

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
          hornos.map((h) => {
            const status = getStatus(h);
            const sesionActiva = h.sesiones?.[0];
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-3xl p-6 space-y-4 border ${
                  h.isActive ? "border-white/10" : "border-slate-700/40 opacity-60"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      sesionActiva ? "bg-orange-500/20" : "bg-orange-500/10"
                    }`}>
                      <Flame size={22} className={sesionActiva ? "text-orange-400" : "text-orange-500/60"} />
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
                        : <ToggleLeft  size={20} className="text-slate-500" />}
                    </button>
                  </div>
                </div>

                {/* Sesión activa info */}
                {sesionActiva && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl px-3 py-2 text-xs space-y-0.5">
                    <p className="font-bold text-orange-300">Cremación en curso</p>
                    <p className="text-slate-400">
                      Operador: <span className="text-white">{sesionActiva.operadorNombre}</span>
                    </p>
                    <p className="text-slate-400">
                      Inicio:{" "}
                      <span className="text-white">
                        {new Date(sesionActiva.fechaInicio).toLocaleString("es-MX", {
                          dateStyle: "short", timeStyle: "short",
                        })}
                      </span>
                    </p>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-2 border-t border-white/10">
                  {h.capacidadKg && (
                    <span className="flex items-center gap-1">
                      <Thermometer size={12} className="text-brand-gold-500" />
                      <span className="text-brand-gold-500 font-bold">{h.capacidadKg} kg</span>
                    </span>
                  )}
                  {h._count !== undefined && (
                    <span>
                      <span className="text-brand-gold-500 font-bold">{h._count.sesiones}</span>{" "}
                      {h._count.sesiones === 1 ? "cremación" : "cremaciones"}
                    </span>
                  )}
                  {h.sucursal && (
                    <span className="ml-auto flex items-center gap-1 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-full">
                      <Building2 size={10} />
                      {h.sucursal.codigo}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full w-fit border ${
                  !h.isActive
                    ? "bg-slate-700/30 text-slate-500 border-slate-600/20"
                    : sesionActiva
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </div>
              </motion.div>
            );
          })
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
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Sucursal</label>
                  <select
                    className="input-field w-full"
                    value={form.sucursalId}
                    onChange={(e) => setForm({ ...form, sucursalId: e.target.value })}
                  >
                    <option value="">Sin asignar</option>
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.codigo})
                      </option>
                    ))}
                  </select>
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
                    : <><CheckCircle2 size={16} /> {editing ? "Guardar" : "Crear"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
