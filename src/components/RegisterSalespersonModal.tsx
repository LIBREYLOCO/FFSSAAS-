"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Award, DollarSign, Loader2 } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterSalespersonModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        level: "Junior",
        commissionRate: 0.1
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/vendedores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ name: "", level: "Junior", commissionRate: 0.1 });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-lg overflow-hidden rounded-[2.5rem] relative"
                >
                    <div className="p-8">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Nuevo Vendedor</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Alta en Fuerza de Ventas</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-brand-gold-500/50"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nivel / Rango</label>
                                    <select
                                        value={formData.level}
                                        onChange={e => setFormData({ ...formData, level: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                    >
                                        <option value="Junior">Junior</option>
                                        <option value="Senior">Senior</option>
                                        <option value="Master">Master</option>
                                        <option value="Director">Director</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Comisión (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.commissionRate}
                                            onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none pr-12"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-brand-gold-500/5 p-6 rounded-3xl border border-brand-gold-500/20 flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-brand-gold-500/10 text-brand-gold-500">
                                    <Award size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-brand-gold-500 text-sm">Incentivos por Nivel</p>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed capitalize">
                                        El nivel seleccionado define el límite de contratos y bonos adicionales por metas mensuales logradas.
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Registrar Vendedor"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
