"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Award, DollarSign, Target } from "lucide-react";
import RegisterSalespersonModal from "@/components/RegisterSalespersonModal";

export default function VendedoresPage() {
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSalespeople = () => {
        setLoading(true);
        fetch("/api/vendedores")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setSalespeople(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch salespeople error:", err);
                setSalespeople([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSalespeople();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Fuerza de Ventas</h2>
                    <p className="text-slate-400">Gestiona vendedores y sus esquemas de comisiones.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus size={20} />
                    Nuevo Vendedor
                </button>
            </header>

            <RegisterSalespersonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSalespeople}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="glass-card h-48 rounded-3xl animate-pulse" />
                    ))
                ) : salespeople.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <TrendingUp className="text-slate-600" />
                        </div>
                        <p className="text-slate-500">No hay vendedores registrados.</p>
                    </div>
                ) : (
                    salespeople.map((person) => (
                        <motion.div
                            key={person.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 rounded-3xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target size={80} />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 font-bold text-xl">
                                    {person.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{person.name}</h3>
                                    <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-500">
                                        Nivel {person.level}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Comisión</p>
                                    <p className="text-lg font-bold">{(person.commissionRate * 100).toFixed(0)}%</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Ventas</p>
                                    <p className="text-lg font-bold">{person._count.contracts}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest">
                                    Ver Reporte de Comisiones
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
