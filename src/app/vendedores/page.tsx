"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Target, Edit2 } from "lucide-react";
import RegisterSalespersonModal from "@/components/RegisterSalespersonModal";
import EditSalespersonModal from "@/components/EditSalespersonModal";

export default function VendedoresPage() {
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<any | null>(null);

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

                            {/* Edit button */}
                            <button
                                onClick={() => setEditingPerson(person)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-brand-gold-500/20 text-slate-500 hover:text-brand-gold-500 border border-transparent hover:border-brand-gold-500/30 transition-all"
                                title="Editar vendedor"
                            >
                                <Edit2 size={14} />
                            </button>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 font-bold text-xl">
                                    {person.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold truncate">{person.name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                        <span className="text-xs font-bold uppercase tracking-widest text-brand-gold-500">
                                            Nivel {person.level}
                                        </span>
                                        {person.sucursal && (
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                                {person.sucursal.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Comisión</p>
                                    <p className="text-lg font-bold">{Number(person.commissionRate).toFixed(1)}%</p>
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
            <EditSalespersonModal
                isOpen={!!editingPerson}
                onClose={() => setEditingPerson(null)}
                onSuccess={fetchSalespeople}
                person={editingPerson}
            />
        </div>
    );
}
