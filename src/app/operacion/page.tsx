"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Flame, Package, CheckCircle2, Clock, RefreshCcw,
  Dog, User, ChevronRight, Loader2, FileText, X, AlertCircle,
  Plus, Pencil, ToggleLeft, ToggleRight, Users, Car,
  Wrench, Search,
} from "lucide-react";
import Link from "next/link";


// ─── Tipos ───────────────────────────────────────────────────────────────────

interface Horno {
  id: string;
  nombre: string;
  codigo: string;
  capacidadKg?: number;
  isActive: boolean;
  _count?: { sesiones: number };
  sucursal?: { nombre: string; codigo: string } | null;
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

interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  sucursal?: { nombre: string; codigo: string } | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

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

const ROLE_LABELS: Record<string, string> = {
  OPERADOR: "Operador",
  DRIVER: "Conductor",
};

const EMPTY_HORNO_FORM = { nombre: "", codigo: "", capacidadKg: "" };

function statusInfo(key: string) {
  return STATUSES.find(s => s.key === key) || STATUSES[0];
}

const TABS = [
  { id: "orders", label: "Órdenes", icon: Wrench },
  { id: "hornos", label: "Hornos", icon: Flame },
  { id: "equipo", label: "Equipo", icon: Users },
] as const;

type Tab = typeof TABS[number]["id"];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function OperacionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // ── Estado: Órdenes ─────────────────────────────────────────────────────
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // ── Estado: Modal Cremación ─────────────────────────────────────────────
  const [cremacionModal, setCremacionModal] = useState<Order | null>(null);
  const [hornos, setHornos] = useState<Horno[]>([]);
  const [operadores, setOperadores] = useState<TeamUser[]>([]);
  const [cremForm, setCremForm] = useState({ hornoId: "", operadorNombre: "", fechaInicio: "", observaciones: "" });
  const [cremSaving, setCremSaving] = useState(false);
  const [cremError, setCremError] = useState("");

  // ── Estado: Hornos tab ──────────────────────────────────────────────────
  const [hornosList, setHornosList] = useState<Horno[]>([]);
  const [loadingHornos, setLoadingHornos] = useState(false);
  const [hornoModal, setHornoModal] = useState(false);
  const [editingHorno, setEditingHorno] = useState<Horno | null>(null);
  const [hornoForm, setHornoForm] = useState(EMPTY_HORNO_FORM);
  const [hornoSaving, setHornoSaving] = useState(false);
  const [hornoError, setHornoError] = useState("");

  // ── Estado: Equipo tab ──────────────────────────────────────────────────
  const [equipo, setEquipo] = useState<TeamUser[]>([]);
  const [loadingEquipo, setLoadingEquipo] = useState(false);

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

  const fetchHornosList = useCallback(() => {
    setLoadingHornos(true);
    fetch("/api/hornos")
      .then(r => r.json())
      .then(d => setHornosList(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoadingHornos(false));
  }, []);

  const fetchEquipo = useCallback(() => {
    setLoadingEquipo(true);
    fetch("/api/users")
      .then(r => r.ok ? r.json() : [])
      .then((users: TeamUser[]) => {
        setEquipo(users.filter(u => u.role === "OPERADOR" || u.role === "DRIVER"));
      })
      .catch(() => setEquipo([]))
      .finally(() => setLoadingEquipo(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { if (activeTab === "hornos") fetchHornosList(); }, [activeTab, fetchHornosList]);
  useEffect(() => { if (activeTab === "equipo") fetchEquipo(); }, [activeTab, fetchEquipo]);

  // ── Acciones: Órdenes ───────────────────────────────────────────────────

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
    setCremForm({ hornoId: "", operadorNombre: "", fechaInicio: new Date().toISOString().slice(0, 16), observaciones: "" });
    const [resHornos, resUsers] = await Promise.all([
      fetch("/api/hornos"),
      fetch("/api/users")
    ]);
    if (resHornos.ok) setHornos(await resHornos.json());
    if (resUsers.ok) {
      const users: TeamUser[] = await resUsers.json();
      setOperadores(users.filter(u => u.isActive && (u.role === "OPERADOR" || u.role === "DRIVER")));
    }
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

  // ── Acciones: Hornos ────────────────────────────────────────────────────

  const openCreateHorno = () => {
    setEditingHorno(null);
    setHornoForm(EMPTY_HORNO_FORM);
    setHornoError("");
    setHornoModal(true);
  };

  const openEditHorno = (h: Horno) => {
    setEditingHorno(h);
    setHornoForm({ nombre: h.nombre, codigo: h.codigo, capacidadKg: h.capacidadKg?.toString() ?? "" });
    setHornoError("");
    setHornoModal(true);
  };

  const handleSaveHorno = async () => {
    if (!hornoForm.nombre || !hornoForm.codigo) { setHornoError("Nombre y código son requeridos."); return; }
    setHornoSaving(true);
    setHornoError("");
    try {
      const res = await fetch(
        editingHorno ? `/api/hornos/${editingHorno.id}` : "/api/hornos",
        { method: editingHorno ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(hornoForm) }
      );
      const data = await res.json();
      if (!res.ok) { setHornoError(data.error || "Error al guardar."); return; }
      setHornoModal(false);
      fetchHornosList();
    } catch {
      setHornoError("Error de red.");
    } finally {
      setHornoSaving(false);
    }
  };

  const handleToggleHorno = async (h: Horno) => {
    await fetch(`/api/hornos/${h.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !h.isActive }),
    });
    fetchHornosList();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 border-b border-brand-gold-500/30 w-fit pb-1 block">Operación</span>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">Centro de Operaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Gestión de servicios, hornos y equipo operativo</p>
        </div>
      </header>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl w-fit border border-white/[0.06]">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                ? "bg-brand-gold-600/20 text-brand-gold-400 shadow-[0_0_0_1px_rgba(197,160,89,0.2)]"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══ TAB: ÓRDENES ══════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
            <button
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all flex-shrink-0 ml-4"
            >
              <RefreshCcw size={14} className={loadingOrders ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>

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
                      <div className={`px-6 py-3 border-b border-white/5 flex items-center gap-3 ${status.color}`}>
                        <status.icon size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                      </div>

                      <div className="p-6 flex flex-col gap-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold-500/80 mb-1">Folio de Rastreo</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black font-mono tracking-tighter text-white">{order.folio}</span>
                              <Link
                                href={`/seguimiento/${order.folio}`}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-brand-gold-500 hover:text-black transition-all text-slate-500"
                                title="Ver Seguimiento"
                              >
                                <Search size={12} />
                              </Link>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-1 rounded-full bg-white/5 text-slate-500 border border-white/5 h-fit">
                            {SERVICE_TYPE_LABELS[order.serviceType] || order.serviceType}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                          <div className="w-10 h-10 rounded-xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                            <Dog size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm">{order.pet?.name || "Mascota"}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{order.pet?.species} • {order.pet?.breed}</p>
                          </div>
                        </div>

                        {order.owner && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <User size={12} /><span>{order.owner.name}</span>
                          </div>
                        )}

                        {order.sesionCremacion && (
                          <div className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-red-300">
                            <Flame size={12} />
                            <span className="font-mono">{order.sesionCremacion.numeroCertificado}</span>
                            <span className="text-red-400/60">· {order.sesionCremacion.horno.nombre}</span>
                          </div>
                        )}

                        <div className="flex gap-1 mt-auto">
                          {STEP_LABELS.map((s, idx) => (
                            <div key={s} className={`h-1.5 rounded-full flex-1 transition-all ${idx <= currentStep ? "bg-brand-gold-500" : "bg-white/10"}`} />
                          ))}
                        </div>

                        <div className="flex flex-col gap-2 mt-1">
                          {order.sesionCremacion && (
                            <button
                              onClick={() => downloadCertificado(order.sesionCremacion!.id, order.sesionCremacion!.numeroCertificado)}
                              className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-colors"
                            >
                              <FileText size={15} /> Descargar Certificado
                            </button>
                          )}
                          {canRegistrarCremacion && (
                            <button
                              onClick={() => openCremacionModal(order)}
                              className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-colors"
                            >
                              <Flame size={15} /> Registrar Cremación
                            </button>
                          )}
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

                          <Link
                            href={`/seguimiento/${order.folio}`}
                            className="w-full py-2.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all mt-1"
                          >
                            <Search size={15} /> Ver Seguimiento Ritual
                          </Link>
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
        </div>
      )}

      {/* ══ TAB: HORNOS ═══════════════════════════════════════════════════════ */}
      {activeTab === "hornos" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm">Registro y estado de los hornos de cremación por sucursal.</p>
            <div className="flex gap-3">
              <button
                onClick={fetchHornosList}
                disabled={loadingHornos}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
              >
                <RefreshCcw size={14} className={loadingHornos ? "animate-spin" : ""} />
              </button>
              <button onClick={openCreateHorno} className="btn-primary flex items-center gap-2">
                <Plus size={18} /> Nuevo Horno
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingHornos ? (
              [1, 2, 3].map(i => <div key={i} className="glass-card h-44 rounded-3xl animate-pulse" />)
            ) : hornosList.length === 0 ? (
              <div className="col-span-full glass-card rounded-3xl p-16 text-center space-y-3">
                <Flame size={48} className="mx-auto text-slate-600" />
                <p className="text-slate-400">No hay hornos registrados.</p>
                <button onClick={openCreateHorno} className="btn-primary mx-auto flex items-center gap-2 w-fit">
                  <Plus size={18} /> Agregar primer horno
                </button>
              </div>
            ) : (
              hornosList.map(h => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card rounded-3xl p-6 space-y-4 border ${h.isActive ? "border-white/10" : "border-slate-700/40 opacity-60"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Flame size={22} className="text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{h.nombre}</h3>
                        <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-full text-slate-300">{h.codigo}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditHorno(h)} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleToggleHorno(h)} className="p-2 rounded-xl hover:bg-white/10 transition-colors" title={h.isActive ? "Desactivar" : "Activar"}>
                        {h.isActive ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-slate-500" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-400 pt-3 border-t border-white/10">
                    {h.capacidadKg && <span><span className="text-brand-gold-500 font-bold">{h.capacidadKg} kg</span> cap. máx.</span>}
                    {h._count !== undefined && <span><span className="text-brand-gold-500 font-bold">{h._count.sesiones}</span> cremaciones</span>}
                    {h.sucursal && <span className="ml-auto font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{h.sucursal.codigo}</span>}
                  </div>
                  <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full w-fit ${h.isActive ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-slate-700/30 text-slate-500 border border-slate-600/20"}`}>
                    {h.isActive ? "Operativo" : "Inactivo"}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ══ TAB: EQUIPO ═══════════════════════════════════════════════════════ */}
      {activeTab === "equipo" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 text-sm">Operadores y conductores asignados a este módulo.</p>
            <button
              onClick={fetchEquipo}
              disabled={loadingEquipo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
            >
              <RefreshCcw size={14} className={loadingEquipo ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>

          {loadingEquipo ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="glass-card h-20 rounded-2xl animate-pulse" />)}
            </div>
          ) : equipo.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center space-y-3">
              <Users size={48} className="mx-auto text-slate-600" />
              <p className="text-slate-400">No hay operadores ni conductores registrados.</p>
              <p className="text-xs text-slate-600">Ve a Configuración → Usuarios & Roles para crear personal operativo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipo.map(u => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass-card p-5 rounded-2xl flex items-center gap-4 border ${u.isActive ? "border-white/10" : "border-white/5 opacity-50"}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${u.role === "DRIVER" ? "bg-blue-500/15 text-blue-400" : "bg-orange-500/15 text-orange-400"}`}>
                    {u.role === "DRIVER" ? <Car size={22} /> : <Wrench size={22} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                    {u.sucursal && (
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                        {u.sucursal.nombre}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${u.role === "DRIVER" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-orange-500/10 text-orange-400 border border-orange-500/20"}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${u.isActive ? "text-green-400" : "text-slate-600"}`}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══ MODAL: Registrar Cremación ════════════════════════════════════════ */}
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
                  <select className="aura-input" value={cremForm.hornoId} onChange={e => setCremForm({ ...cremForm, hornoId: e.target.value })}>
                    <option value="">Seleccionar horno...</option>
                    {hornos.map(h => <option key={h.id} value={h.id}>{h.nombre} ({h.codigo})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Operador / Técnico *</label>
                  <select className="aura-input" value={cremForm.operadorNombre} onChange={e => setCremForm({ ...cremForm, operadorNombre: e.target.value })}>
                    <option value="">Seleccionar operador...</option>
                    {operadores.map(op => <option key={op.id} value={op.name}>{op.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha y hora de inicio *</label>
                  <input type="datetime-local" className="aura-input" value={cremForm.fechaInicio} onChange={e => setCremForm({ ...cremForm, fechaInicio: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
                  <textarea className="aura-input resize-none" rows={3} placeholder="Notas adicionales..." value={cremForm.observaciones} onChange={e => setCremForm({ ...cremForm, observaciones: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setCremacionModal(null)} className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors">Cancelar</button>
                <button onClick={handleRegistrarCremacion} disabled={cremSaving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {cremSaving ? <span className="animate-pulse">Guardando...</span> : <><Flame size={16} /> Registrar</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MODAL: Crear/Editar Horno ═════════════════════════════════════════ */}
      <AnimatePresence>
        {hornoModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setHornoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-8 w-full max-w-sm space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold italic">{editingHorno ? "Editar Horno" : "Nuevo Horno"}</h3>
                <button onClick={() => setHornoModal(false)} className="p-2 rounded-xl hover:bg-white/10"><X size={20} /></button>
              </div>
              {hornoError && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl p-3">
                  <AlertCircle size={16} /> {hornoError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nombre *</label>
                  <input className="aura-input" placeholder="Ej: Horno Principal" value={hornoForm.nombre} onChange={e => setHornoForm({ ...hornoForm, nombre: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Código *</label>
                  <input className="aura-input uppercase" placeholder="Ej: HRN-01" value={hornoForm.codigo} onChange={e => setHornoForm({ ...hornoForm, codigo: e.target.value.toUpperCase() })} />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Capacidad máxima (kg)</label>
                  <input type="number" className="aura-input" placeholder="Ej: 50" value={hornoForm.capacidadKg} onChange={e => setHornoForm({ ...hornoForm, capacidadKg: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setHornoModal(false)} className="flex-1 py-3 rounded-2xl border border-white/20 text-slate-300 hover:bg-white/10 transition-colors">Cancelar</button>
                <button onClick={handleSaveHorno} disabled={hornoSaving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {hornoSaving ? <span className="animate-pulse">Guardando...</span> : <><CheckCircle2 size={16} /> {editingHorno ? "Guardar" : "Crear"}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
