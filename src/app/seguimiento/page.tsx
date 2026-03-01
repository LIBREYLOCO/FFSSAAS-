"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, Clock, ChevronRight, Activity } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    PENDING_PICKUP: { label: "Recolecta Pendiente", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    IN_TRANSIT: { label: "En Tránsito", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    AT_CREMATORY: { label: "En Crematorio", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
    CREMATING: { label: "En Cremación", color: "text-brand-gold-500 bg-brand-gold-500/10 border-brand-gold-500/20" },
    READY_FOR_DELIVERY: { label: "Listo para Entrega", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    DELIVERED: { label: "Entregado", color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
};

export default function TrackingSearch() {
    const [folio, setFolio] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeOrders, setActiveOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetch("/api/service-orders/active")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setActiveOrders(Array.isArray(data) ? data : []);
                setLoadingOrders(false);
            })
            .catch(() => setLoadingOrders(false));
    }, []);

    const handleSearch = async (folioToSearch: string) => {
        if (!folioToSearch.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/tracking/${folioToSearch}`);
            if (res.ok) {
                router.push(`/seguimiento/${folioToSearch}`);
            } else {
                setError("No se encontró ninguna orden con ese folio.");
            }
        } catch (err) {
            setError("Error al buscar la orden. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col md:flex-row items-stretch overflow-hidden">
            {/* Sidebar with Active Orders */}
            <aside className="w-full md:w-80 lg:w-96 bg-white/[0.02] border-r border-white/5 flex flex-col h-[40vh] md:h-screen transition-all order-2 md:order-1">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={18} className="text-brand-gold-500" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Servicios en Curso</h2>
                    </div>
                    <span className="text-[10px] font-bold bg-white/5 px-2 py-0.5 rounded-full text-slate-500">
                        {activeOrders.length}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loadingOrders ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : activeOrders.length === 0 ? (
                        <div className="text-center py-20 px-6 opacity-30">
                            <Clock size={40} className="mx-auto mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest">No hay servicios activos</p>
                        </div>
                    ) : (
                        activeOrders.map((order) => {
                            const status = STATUS_LABELS[order.status] || { label: order.status, color: "text-slate-500 bg-white/5" };
                            return (
                                <motion.button
                                    key={order.id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => handleSearch(order.folio)}
                                    className="w-full text-left glass-card p-4 rounded-2xl border border-white/5 hover:border-brand-gold-500/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-black text-sm group-hover:text-brand-gold-500 transition-colors">{order.pet?.name || "Mascarilla"}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{order.folio}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:text-brand-gold-500 transition-colors" />
                                    </div>
                                    <div className="flex gap-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${status.color}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                </motion.button>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main Search Area */}
            <main className="flex-1 flex items-center justify-center p-6 order-1 md:order-2 bg-radial-aura relative overflow-hidden">
                {/* Decorative background effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold-500/10 rounded-full blur-[120px] pointer-events-none opacity-20" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg space-y-10 text-center relative z-10"
                >
                    <div className="space-y-3">
                        <motion.h1
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            className="text-5xl md:text-6xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent italic leading-tight"
                        >
                            SEGUIMIENTO<br />RITUAL AURA
                        </motion.h1>
                        <p className="text-brand-gold-500/60 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase">
                            Aura • Consultar Estado de Memoria
                        </p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSearch(folio); }} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="INGRESE FOLIO O ID"
                                value={folio}
                                onChange={(e) => setFolio(e.target.value)}
                                className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-6 px-8 text-2xl text-center font-black tracking-widest focus:outline-none focus:border-brand-gold-500/80 transition-all placeholder:text-slate-800 uppercase"
                                required
                            />
                            {/* Input glowing effect */}
                            <div className="absolute -inset-1 bg-brand-gold-500/20 rounded-[30px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-xs font-black bg-red-400/10 py-3 rounded-2xl border border-red-400/20 uppercase tracking-widest"
                            >
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-gold-500 text-black font-black py-6 rounded-3xl flex items-center justify-center gap-3 hover:bg-brand-gold-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(238,194,77,0.3)] group"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search size={24} className="group-hover:rotate-12 transition-transform" />}
                            <span className="text-lg tracking-[0.1em]">CONSULTAR ESTADO</span>
                        </button>
                    </form>

                    <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.3em] pt-12 opacity-50">
                        Proporcionado por Airapí • Homenajes con Dignidad
                    </p>
                </motion.div>
            </main>

            <style jsx global>{`
                .bg-radial-aura {
                    background: radial-gradient(circle at center, #111 0%, #000 100%);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(238, 194, 77, 0.2);
                }
            `}</style>
        </div>
    );
}
