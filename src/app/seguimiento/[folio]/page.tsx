"use client";

import { useEffect, useState } from "react";
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
    Clock
} from "lucide-react";
import Link from "next/link";
import { generateServiceCertificate } from "@/lib/pdf-generator";

const STATUS_STEPS = [
    { id: "PENDING_PICKUP", label: "Recolección Pendiente", icon: Clock, color: "text-slate-400" },
    { id: "PICKED_UP", label: "En Camino", icon: Truck, color: "text-blue-400" },
    { id: "ARRIVED", label: "En Instalaciones", icon: Building2, color: "text-emerald-400" },
    { id: "IN_PROCESS", label: "Ritual Iniciado", icon: Flame, color: "text-orange-400" },
    { id: "READY_FOR_DELIVERY", label: "Listo para Entrega", icon: Package, color: "text-purple-400" },
    { id: "DELIVERED", label: "Entregado", icon: Dog, color: "text-brand-gold-500" },
];

export default function TrackingStatus({ params }: { params: { folio: string } }) {
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/tracking/${params.folio}`)
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
    }, [params.folio]);

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
                    {order.status === 'DELIVERED' && (
                        <button
                            onClick={() => generateServiceCertificate(order)}
                            className="text-[10px] font-bold bg-brand-gold-500 text-black px-3 py-1 rounded-full hover:bg-white transition-colors flex items-center gap-1 uppercase tracking-tighter"
                        >
                            <Package size={12} /> Descargar Certificado
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
                                            <h4 className={`text-lg font-bold tracking-tight ${isCurrent ? 'text-brand-gold-500' : 'text-slate-300'}`}>
                                                {step.label}
                                            </h4>
                                            {isCurrent && (
                                                <p className="text-[10px] uppercase font-black tracking-widest text-brand-gold-600 animate-pulse">En progreso</p>
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
