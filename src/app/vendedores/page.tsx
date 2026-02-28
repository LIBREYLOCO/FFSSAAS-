"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Plus, Target, Edit2, BarChart2, User } from "lucide-react";
import RegisterSalespersonModal from "@/components/RegisterSalespersonModal";
import EditSalespersonModal from "@/components/EditSalespersonModal";
import CommissionReportModal from "@/components/CommissionReportModal";

const LEVEL_STYLE: Record<string, string> = {
    JUNIOR: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    SENIOR: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    EXPERT: "text-brand-gold-500 bg-brand-gold-500/10 border-brand-gold-500/20",
    MASTER: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

export default function VendedoresPage() {
    const [salespeople, setSalespeople] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<any | null>(null);
    const [reportPersonId, setReportPersonId] = useState<string | null>(null);

    const fetchSalespeople = () => {
        setLoading(true);
        fetch("/api/vendedores")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setSalespeople(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => { setSalespeople([]); setLoading(false); });
    };

    useEffect(() => { fetchSalespeople(); }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Fuerza de Ventas</h2>
                    <p className="text-slate-400">Gestiona vendedores y sus esquemas de comisiones.</p>
                </div>
                <button onClick={() => setIsRegisterOpen(true)} className="btn-primary flex items-center gap-2 w-fit">
                    <Plus size={20} /> Nuevo Vendedor
                </button>
            </header>

            <RegisterSalespersonModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={fetchSalespeople}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="glass-card h-56 rounded-3xl animate-pulse" />)
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
                            {/* Decorative bg icon */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Target size={90} />
                            </div>

                            {/* Edit button */}
                            <button
                                onClick={() => setEditingPerson(person)}
                                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/5 hover:bg-brand-gold-500/20 text-slate-500 hover:text-brand-gold-500 border border-transparent hover:border-brand-gold-500/30 transition-all"
                                title="Editar vendedor"
                            >
                                <Edit2 size={14} />
                            </button>

                            {/* Avatar + Name row */}
                            <div className="flex items-center gap-4 mb-5">
                                <div className="relative flex-shrink-0 w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-brand-gold-500/10">
                                    {person.photoUrl ? (
                                        <img src={person.photoUrl} alt={person.name}
                                            className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brand-gold-500 font-black text-xl">
                                            {person.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                    <h3 className="text-lg font-bold truncate">{person.name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap mt-1">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${LEVEL_STYLE[person.level] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
                                            {person.level}
                                        </span>
                                        {person.sucursal && (
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                                {person.sucursal.nombre}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact info */}
                            {(person.email || person.phone) && (
                                <div className="mb-4 px-1 space-y-0.5">
                                    {person.phone && <p className="text-[11px] text-slate-500 truncate">📞 {person.phone}</p>}
                                    {person.email && <p className="text-[11px] text-slate-500 truncate">✉️ {person.email}</p>}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Comisión</p>
                                    <p className="text-lg font-black text-brand-gold-500">{Number(person.commissionRate).toFixed(1)}%</p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Contratos</p>
                                    <p className="text-lg font-black">{person._count?.contracts ?? 0}</p>
                                </div>
                            </div>

                            {/* Commission report button */}
                            <div className="mt-4 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => setReportPersonId(person.id)}
                                    className="w-full py-3 rounded-xl bg-brand-gold-500/10 hover:bg-brand-gold-500/20 text-brand-gold-500 border border-brand-gold-500/20 transition-colors text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <BarChart2 size={14} />
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

            <CommissionReportModal
                isOpen={!!reportPersonId}
                onClose={() => setReportPersonId(null)}
                personId={reportPersonId}
            />
        </div>
    );
}
