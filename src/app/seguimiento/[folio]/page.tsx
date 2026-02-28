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
    Users
} from "lucide-react";
import Link from "next/link";
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

export default function TrackingStatus({ params }: { params: Promise<{ folio: string }> }) {
    const { folio } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-brand-gold-500">
            <Clock className="animate-spin" size={48} />
        </div>
    );

    if (error || !order) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-slate-400 mb-8">{error || "No se pudo encontrar la orden."}</p>
            <Link href="/seguimiento" className="text-brand-gold-500 flex items-center gap-2">
                <ChevronLeft size={20} /> Volver a buscar
            </Link>
        </div>
    );

    const currentStatusIndex = STATUS_STEPS.findIndex(step => step.id === order.status);

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 font-sans">
            <header className="max-w-4xl mx-auto flex items-center justify-between mb-10">
                <Link href="/seguimiento" className="p-2 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </Link>
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

                {/* Session details (Dynamic Info) */}
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
                        {/* Timeline Line */}
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
                                    {/* Tooltip / Status Dot */}
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
    );
}
