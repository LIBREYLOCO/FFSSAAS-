"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Flame, Package, CheckCircle2, Clock, RefreshCcw,
  Dog, User, ChevronRight, Loader2, FileText, X, AlertCircle,
} from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Horno {
  id: string;
  nombre: string;
  codigo: string;
}

interface SesionCremacion {
  id: string;
  numeroCertificado: string;
  operadorNombre: string;
  fechaInicio: string;
  horno: { nombre: string; codigo: string };
}

interface Order {
  id: string;
  folio: string;
  status: string;
  serviceType: string;
  pet?: { name: string; species: string; breed?: string };
  owner?: { name: string };
  sesionCremacion?: SesionCremacion | null;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const STATUSES: { key: string; label: string; color: string; icon: React.ElementType; next?: string }[] = [
  { key: "PENDING_PICKUP", label: "Pendiente de Recolección", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock, next: "IN_TRANSIT" },
  { key: "IN_TRANSIT", label: "En Tránsito", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Truck, next: "AT_CREMATORY" },
  { key: "AT_CREMATORY", label: "En Crematorio", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Flame, next: "CREMATING" },
  { key: "CREMATING", label: "En Proceso de Cremación", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Flame, next: "READY_FOR_DELIVERY" },
  { key: "READY_FOR_DELIVERY", label: "Listo para Entrega", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Package, next: "DELIVERED" },
  { key: "DELIVERED", label: "Entregado", color: "bg-sky-500/20 text-sky-400 border-sky-500/30", icon: CheckCircle2, next: "COMPLETED" },
  { key: "COMPLETED", label: "Completado", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
];

const SERVICE_TYPE_LABELS: Record<string, string> = {
  IMMEDIATE: "Cremación Inmediata",
  PREVISION: "Previsión Activada",
};

const STEP_LABELS = ["PENDING_PICKUP", "IN_TRANSIT", "AT_CREMATORY", "CREMATING", "READY_FOR_DELIVERY", "DELIVERED"];

function statusInfo(key: string) {
  return STATUSES.find(s => s.key === key) || STATUSES[0];
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function OperacionPage() {
  // ── Estado Órdenes ──────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Estado Modal Cremación ──────────────────────────────────────────────
  const [cremacionModal, setCremacionModal] = useState<Order | null>(null);
  const [hornos, setHornos] = useState<Horno[]>([]);
  const [cremForm, setCremForm] = useState({ hornoId: "", operadorNombre: "", fechaInicio: "", observaciones: "" });
  const [cremSaving, setCremSaving] = useState(false);
  const [cremError, setCremError] = useState("");

  // ── Fetchers ────────────────────────────────────────────────────────────

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/service-orders/status");
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Acciones Órdenes ────────────────────────────────────────────────────

  const advance = async (orderId: string, nextStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/service-orders/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, newStatus: nextStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      }
    } finally {
      setUpdating(null);
    }
  };

  const openCremacionModal = async (order: Order) => {
    setCremError("");
    setCremForm({
      hornoId: "",
      operadorNombre: "",
      fechaInicio: new Date().toISOString().slice(0, 16),
      observaciones: "",
    });
    const res = await fetch("/api/hornos");
    if (res.ok) setHornos(await res.json());
    setCremacionModal(order);
  };

  const handleRegistrarCremacion = async () => {
    if (!cremForm.hornoId || !cremForm.operadorNombre || !cremForm.fechaInicio) {
      setCremError("Horno, operador y fecha de inicio son requeridos.");
      return;
    }
    if (!cremacionModal) return;
    setCremSaving(true);
    setCremError("");
    try {
      const res = await fetch("/api/sesiones-cremacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceOrderId: cremacionModal.id,
          hornoId: cremForm.hornoId,
          operadorNombre: cremForm.operadorNombre,
          fechaInicio: cremForm.fechaInicio,
          observaciones: cremForm.observaciones || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCremError(data.error || "Error al registrar."); return; }
      setCremacionModal(null);
      fetchOrders();
    } catch {
      setCremError("Error de red.");
    } finally {
      setCremSaving(false);
    }
  };

  const downloadCertificado = async (sesionId: string, numCert: string) => {
    const res = await fetch(`/api/sesiones-cremacion/${sesionId}/certificado`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${numCert}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 border-b border-brand-gold-500/30 w-fit pb-1 block">Operación</span>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">Centro de Operaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Seguimiento y avance de servicios activos</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loadingOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
        >
          <RefreshCcw size={14} className={loadingOrders ? "animate-spin" : ""} />
          Actualizar
        </button>
      </header>

      {/* Stepper Legend */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {STEP_LABELS.map((s, i) => {
          const info = statusInfo(s);
          return (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${info.color}`}>{info.label}</span>
              {i < STEP_LABELS.length - 1 && <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Orders Grid */}
      {loadingOrders ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="glass-card rounded-[2rem] h-64 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card rounded-[2rem] p-16 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-slate-400">¡Sin pendientes!</h3>
          <p className="text-slate-600 text-sm mt-2">No hay servicios activos en este momento.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order, i) => {
              const status = statusInfo(order.status);
              const nextStatus = status.next;
              const currentStep = STEP_LABELS.indexOf(order.status);
              const isUpdating = updating === order.id;
              const canRegistrarCremacion =
                (order.status === "AT_CREMATORY" || order.status === "CREMATING") &&
                !order.sesionCremacion;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card rounded-[2rem] overflow-hidden flex flex-col"
                >
                  {/* Status Bar */}
                  <div className={`px-6 py-3 border-b border-white/5 flex items-center gap-3 ${status.color}`}>
                    <status.icon size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1">
                    {/* Folio */}
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-mono text-slate-500">{order.folio}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white/5 text-slate-400">
                        {SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType}
                      </span>
                    </div>

                    {/* Pet Info */}
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                      <div className="w-10 h-10 rounded-xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                        <Dog size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{order.pet?.name || "Mascota"}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{order.pet?.species} • {order.pet?.breed}</p>
                      </div>
                    </div>

                    {/* Owner */}
                    {order.owner && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={12} />
                        <span>{order.owner.name}</span>
                      </div>
                    )}

                    {/* Sesión cremación info */}
                    {order.sesionCremacion && (
                      <div className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-300">
                        <Flame size={12} />
                        <span className="font-mono">{order.sesionCremacion.numeroCertificado}</span>
                        <span className="text-red-400/60">· {order.sesionCremacion.horno.nombre}</span>
                      </div>
                    )}

                    {/* Progress Steps */}
                    <div className="flex gap-1 mt-auto">
                      {STEP_LABELS.map((s, idx) => (
                        <div
                          key={s}
                          className={`h-1.5 rounded-full flex-1 transition-all ${idx <= currentStep ? "bg-brand-gold-500" : "bg-white/10"}`}
                        />
                      ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2 mt-1">
                      {/* Botón certificado */}
                      {order.sesionCremacion && (
                        <button
                          onClick={() => downloadCertificado(order.sesionCremacion!.id, order.sesionCremacion!.numeroCertificado)}
                          className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
                        >
                          <FileText size={15} /> Descargar Certificado
                        </button>
                      )}

                      {/* Botón registrar cremación */}
                      {canRegistrarCremacion && (
                        <button
                          onClick={() => openCremacionModal(order)}
                          className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-colors"
                        >
                          <Flame size={15} /> Registrar Cremación
                        </button>
                      )}

                      {/* Botón avanzar estado */}
                      {nextStatus && (() => {
                        const nextInfo = statusInfo(nextStatus);
                        const NextIcon = nextInfo.icon;
                        return (
                          <button
                            onClick={() => advance(order.id, nextStatus)}
                            disabled={isUpdating}
                            className="btn-primary w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
                          >
                            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <><NextIcon size={16} />{`→ ${nextInfo.label}`}</>}
                          </button>
                        );
                      })()}

                      {!nextStatus && (
                        <div className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 size={16} /> Servicio Finalizado
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* ── Modal: Registrar Cremación ── */}
      <AnimatePresence>
        {cremacionModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setCremacionModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-8 w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold italic flex items-center gap-2"><Flame size={20} className="text-orange-400" /> Registrar Cremación</h3>
                  <p className="text-xs text-slate-400 mt-1">{cremacionModal.pet?.name} · {cremacionModal.folio}</p>
                </div>
                <button onClick={() => setCremacionModal(null)} className="p-2 rounded-xl hover:bg-white/10"><X size={20} /></button>
              </div>

              {cremError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3">
                  <AlertCircle size={16} /> {cremError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Horno *</label>
                  <select
                    className="input-field w-full bg-transparent"
                    value={cremForm.hornoId}
                    onChange={(e) => setCremForm({ ...cremForm, hornoId: e.target.value })}
                  >
                    <option value="">Seleccionar horno...</option>
                    {hornos.map(h => (
                      <option key={h.id} value={h.id}>{h.nombre} ({h.codigo})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Operador / Técnico *</label>
                  <input
                    className="input-field w-full"
                    placeholder="Nombre del operador"
                    value={cremForm.operadorNombre}
                    onChange={(e) => setCremForm({ ...cremForm, operadorNombre: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha y hora de inicio *</label>
                  <input
                    type="datetime-local"
                    className="input-field w-full"
                    value={cremForm.fechaInicio}
                    onChange={(e) => setCremForm({ ...cremForm, fechaInicio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
                  <textarea
                    className="input-field w-full resize-none"
                    rows={3}
                    placeholder="Notas adicionales del proceso..."
                    value={cremForm.observaciones}
                    onChange={(e) => setCremForm({ ...cremForm, observaciones: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCremacionModal(null)}
                  className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarCremacion}
                  disabled={cremSaving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {cremSaving ? <span className="animate-pulse">Guardando...</span> : <><Flame size={16} /> Registrar</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
