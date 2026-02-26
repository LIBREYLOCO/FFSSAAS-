"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Flame, Package, CheckCircle2, Clock, RefreshCcw, Dog, User, ChevronRight, Loader2 } from "lucide-react";

const STATUSES: { key: string; label: string; color: string; icon: React.ElementType; next?: string }[] = [
    { key: "PENDING_PICKUP", label: "Pendiente de Recolección", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: Clock, next: "IN_TRANSIT" },
    { key: "IN_TRANSIT", label: "En Tránsito", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Truck, next: "AT_CREMATORY" },
    { key: "AT_CREMATORY", label: "En Crematorio", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Flame, next: "CREMATING" },
    { key: "CREMATING", label: "En Proceso de Cremación", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Flame, next: "READY_FOR_DELIVERY" },
    { key: "READY_FOR_DELIVERY", label: "Listo para Entrega", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: Package, next: "DELIVERED" },
    { key: "DELIVERED", label: "Entregado", color: "bg-sky-500/20 text-sky-400 border-sky-500/30", icon: CheckCircle2, next: "COMPLETED" },
    { key: "COMPLETED", label: "Completado", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", icon: CheckCircle2 },
];

function statusInfo(key: string) {
    return STATUSES.find(s => s.key === key) || STATUSES[0];
}

const SERVICE_TYPE_LABELS: Record<string, string> = {
    IMMEDIATE: "Cremación Inmediata",
    PREVISION: "Previsión Activada",
};

const STEP_LABELS = ["PENDING_PICKUP", "IN_TRANSIT", "AT_CREMATORY", "CREMATING", "READY_FOR_DELIVERY", "DELIVERED"];

export default function OperacionPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/service-orders/status");
            if (res.ok) setOrders(await res.json());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const advance = async (orderId: string, nextStatus: string) => {
        setUpdating(orderId);
        try {
            const res = await fetch("/api/service-orders/status", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, newStatus: nextStatus })
            });
            if (res.ok) {
                setOrders(prev =>
                    prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
                );
            }
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 border-b border-brand-gold-500/30 w-fit pb-1 block">Operación</span>
                    <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">Servicios Activos</h2>
                    <p className="text-slate-500 text-sm mt-1">Control de recolecciones y proceso de cremación</p>
                </div>
                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
                >
                    <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                    Actualizar
                </button>
            </header>

            {/* Stepper Legend */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {STEP_LABELS.map((s, i) => {
                    const info = statusInfo(s);
                    return (
                        <div key={s} className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${info.color}`}>
                                {info.label}
                            </span>
                            {i < STEP_LABELS.length - 1 && <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />}
                        </div>
                    );
                })}
            </div>

            {/* Orders */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-card rounded-[2rem] h-64 animate-pulse" />
                    ))}
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

                                        {/* Owner Info */}
                                        {order.owner && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <User size={12} />
                                                <span>{order.owner.name}</span>
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

                                        {/* Advance Button */}
                                        {nextStatus && (() => {
                                            const nextInfo = statusInfo(nextStatus);
                                            const NextIcon = nextInfo.icon;
                                            return (
                                                <button
                                                    onClick={() => advance(order.id, nextStatus)}
                                                    disabled={isUpdating}
                                                    className="btn-primary w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm mt-2"
                                                >
                                                    {isUpdating ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <NextIcon size={16} />
                                                            {`→ ${nextInfo.label}`}
                                                        </>
                                                    )}
                                                </button>
                                            );
                                        })()}
                                        {!nextStatus && (
                                            <div className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm mt-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <CheckCircle2 size={16} />
                                                Servicio Finalizado
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
}
