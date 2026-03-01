"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import {
    Dog,
    Truck,
    Building2,
    Flame,
    Package,
    ChevronLeft,
    CheckCircle2,
    Circle,
    Clock,
    FileText,
    Activity,
    Users,
    Search,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateServiceCertificate } from "@/lib/pdf-generator";

const STATUS_STEPS = [
    { id: "PENDING_PICKUP", label: "Pendiente de Recolección", icon: Clock, color: "text-amber-400" },
    { id: "IN_TRANSIT", label: "En Camino", icon: Truck, color: "text-blue-400" },
    { id: "AT_CREMATORY", label: "En Instalaciones", icon: Building2, color: "text-orange-400" },
    { id: "CREMATING", label: "Ritual en Proceso", icon: Flame, color: "text-red-400" },
    { id: "READY_FOR_DELIVERY", label: "Listo para Entrega", icon: Package, color: "text-emerald-400" },
    { id: "DELIVERED", label: "Entregado", icon: CheckCircle2, color: "text-sky-400" },
    { id: "COMPLETED", label: "Homenaje Finalizado", icon: Dog, color: "text-brand-gold-500" },
];

const STATUS_COLOR: Record<string, string> = {
    PENDING_PICKUP: "text-amber-400 bg-amber-500/10",
    IN_TRANSIT: "text-blue-400 bg-blue-500/10",
    AT_CREMATORY: "text-orange-400 bg-orange-500/10",
    CREMATING: "text-red-400 bg-red-500/10",
    READY_FOR_DELIVERY: "text-emerald-400 bg-emerald-500/10",
    DELIVERED: "text-sky-400 bg-sky-500/10",
    COMPLETED: "text-brand-gold-400 bg-brand-gold-500/10",
};

const STATUS_LABEL: Record<string, string> = {
    PENDING_PICKUP: "Recolección",
    IN_TRANSIT: "En Tránsito",
    AT_CREMATORY: "En Instalac.",
    CREMATING: "En Ritual",
    READY_FOR_DELIVERY: "Listo",
    DELIVERED: "Entregado",
    COMPLETED: "Finalizado",
};

export default function TrackingStatus({ params }: { params: Promise<{ folio: string }> }) {
    const { folio } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sidebar: all active orders
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetch(`/api/tracking/${folio}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setOrder(data);
                setLoading(false);
            })
            .catch(() => {
                setError("Error al cargar el seguimiento");
                setLoading(false);
            });
    }, [folio]);

    // Fetch active orders for sidebar
    useEffect(() => {
        fetch("/api/service-orders/active")
            .then(r => r.ok ? r.json() : [])
            .then(data => setActiveOrders(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, []);

    const filteredOrders = searchQuery
        ? activeOrders.filter(o =>
            o.folio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.pet?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : activeOrders;

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-brand-gold-500">
            <Clock className="animate-spin" size={48} />
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-slate-400 mb-8">{error || "No se pudo encontrar la orden."}</p>
            <Link href="/operacion" className="text-brand-gold-500 flex items-center gap-2">
                <ChevronLeft size={20} /> Volver al Centro de Operaciones
            </Link>
        </div>
    );

    const currentStatusIndex = STATUS_STEPS.findIndex(step => step.id === order.status);

    return (
        <div className="min-h-screen bg-black text-white flex">
            {/* ── Left Sidebar: Active Orders Panel ── */}
            <aside className="w-72 flex-shrink-0 border-r border-white/[0.06] flex flex-col h-screen sticky top-0 bg-black/60 backdrop-blur-sm">
                <div className="p-4 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity size={14} className="text-brand-gold-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-gold-500">Servicios en Proceso</h2>
                    </div>
                    <div className="relative">
                        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar folio, mascota..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-8 pr-8 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-gold-500/40"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                                <X size={10} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-10 text-slate-600 text-xs italic px-4">
                            {searchQuery ? "Sin resultados" : "No hay servicios activos"}
                        </div>
                    ) : filteredOrders.map(o => {
                        const isCurrentOrder = o.folio === folio;
                        const statusStyle = STATUS_COLOR[o.status] || "text-slate-400 bg-white/5";
                        return (
                            <button
                                key={o.id}
                                onClick={() => router.push(`/seguimiento/${o.folio}`)}
                                className={`w-full text-left px-4 py-3 transition-all border-l-2 ${
                                    isCurrentOrder
                                        ? "border-brand-gold-500 bg-brand-gold-500/10"
                                        : "border-transparent hover:bg-white/[0.04] hover:border-white/20"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-mono text-[10px] font-bold text-brand-gold-500">{o.folio}</span>
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${statusStyle}`}>
                                        {STATUS_LABEL[o.status] || o.status}
                                    </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-200 truncate">{o.pet?.name || "—"}</p>
                                <p className="text-[10px] text-slate-500 truncate">{o.owner?.name || "Sin dueño"}</p>
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/[0.06]">
                    <Link href="/operacion" className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors font-bold">
                        <ChevronLeft size={14} /> Centro de Operaciones
                    </Link>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <header className="max-w-4xl mx-auto flex items-center justify-between mb-10">
                    <div />
                    <div className="text-right flex flex-col items-end gap-2">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Folio de Seguimiento</p>
                            <h2 className="text-xl font-bold italic tracking-tighter text-brand-gold-500">{order.folio}</h2>
                        </div>
                        {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                            <button
                                onClick={() => generateServiceCertificate(order)}
                                className="text-[10px] font-bold bg-brand-gold-500 text-black px-4 py-2 rounded-xl hover:bg-white transition-all flex items-center gap-2 uppercase tracking-tighter shadow-lg shadow-brand-gold-500/20 active:scale-95"
                            >
                                <FileText size={14} /> Descargar Certificado
                            </button>
                        )}
                    </div>
                </header>

                <main className="max-w-4xl mx-auto space-y-10">
                    {/* Pet Info Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 border border-white/10"
                    >
                        <div className="w-24 h-24 rounded-full bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 border border-brand-gold-500/20">
                            <Dog size={48} />
                        </div>
                        <div className="text-center md:text-left space-y-1">
                            <h1 className="text-4xl font-black italic tracking-tighter">{order.pet?.name || "Compañero"}</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                                {order.pet?.species} • {order.pet?.breed || "Raza única"}
                            </p>
                            <p className="text-brand-gold-500/60 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                                {order.serviceType === 'IMMEDIATE' ? 'Servicio de Tributo Inmediato' : 'Plan de Previsión AURA'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Session details */}
                    {order.sesionCremacion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 rounded-[30px] border border-orange-500/20 bg-orange-500/5 shadow-[0_0_50px_rgba(251,146,60,0.05)]"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/10 flex-shrink-0">
                                    <Flame size={32} />
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <div>
                                        <h3 className="text-xl font-black italic text-orange-200 tracking-tight">Ritual Ceremonial</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Información técnica del proceso</p>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                <Building2 size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Horno</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-200">{order.sesionCremacion.horno?.nombre}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                <Users size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Operador</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-200">{order.sesionCremacion.operadorNombre}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                <FileText size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Certificado</span>
                                            </div>
                                            <p className="text-xs font-bold font-mono text-brand-gold-500">{order.sesionCremacion.numeroCertificado}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-1.5 mb-1 text-slate-500">
                                                <Clock size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Iniciado</span>
                                            </div>
                                            <p className="text-xs font-bold text-slate-200">{new Date(order.sesionCremacion.fechaInicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Vertical Timeline */}
                    <section className="glass-card p-8 rounded-[40px] border border-white/5 overflow-hidden">
                        <h3 className="text-xl font-bold tracking-tighter italic text-brand-gold-100 mb-8 px-2">Estado del Ritual</h3>

                        <div className="relative space-y-10 pl-4">
                            <div className="absolute left-8 top-4 bottom-4 w-[2px] bg-white/5" />

                            {STATUS_STEPS.map((step, index) => {
                                const isPast = index < currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;
                                const Icon = step.icon;

                                return (
                                    <motion.div
                                        key={step.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`relative flex items-center gap-8 pl-4 ${!isPast && !isCurrent ? 'opacity-30' : ''}`}
                                    >
                                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCurrent ? 'bg-brand-gold-500 text-black scale-125 shadow-[0_0_20px_rgba(212,175,55,0.4)]' :
                                            isPast ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-600'
                                            }`}>
                                            {isPast ? <CheckCircle2 size={16} /> : <Circle size={isCurrent ? 12 : 8} fill={isCurrent ? "currentColor" : "none"} />}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl bg-white/5 ${step.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <div>
                                                <h4 className={`text-lg font-bold tracking-tight transition-all duration-500 ${isCurrent ? 'text-brand-gold-500' : 'text-slate-300'}`}>
                                                    {step.label}
                                                </h4>
                                                {isCurrent && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="flex h-2 w-2 rounded-full bg-brand-gold-500 animate-ping" />
                                                        <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold-600">Estado Actual</p>
                                                    </div>
                                                )}
                                                {isPast && (
                                                    <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest">Completado</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>

                    <footer className="text-center py-10 opacity-30">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Aura Forever Friends</p>
                    </footer>
                </main>
            </div>

            <style jsx global>{`
                html, body { overflow: hidden; }
                .custom-scrollbar { overflow-y: auto; }
            `}</style>
        </div>
    );
}
