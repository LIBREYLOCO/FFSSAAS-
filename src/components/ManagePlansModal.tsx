"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Search, Plus, Trash2, HeartHandshake } from "lucide-react";
import { formatMXN } from "@/lib/format";

interface ManagePlansModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ManagePlansModal({ isOpen, onClose, onSuccess }: ManagePlansModalProps) {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        installmentsCount: "1",
    });

    const fetchPlans = () => {
        setLoading(true);
        fetch("/api/prevision/plans")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setPlans(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch plans error:", err);
                setPlans([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (isOpen) {
            fetchPlans();
            setIsCreating(false);
            setFormData({
                name: "",
                description: "",
                price: "",
                installmentsCount: "1",
            });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!formData.name || !formData.price || !formData.installmentsCount) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/prevision/plans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    installmentsCount: parseInt(formData.installmentsCount, 10),
                }),
            });

            if (response.ok) {
                await fetchPlans(); // Refrescar lista
                setIsCreating(false);
                setFormData({ name: "", description: "", price: "", installmentsCount: "1" });
                onSuccess(); // Para que RegisterContractModal también se actualice si está abierto
            }
        } catch (error) {
            console.error("Error creating plan:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-deep/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden relative shadow-2xl border-white/10 flex flex-col max-h-[85vh]"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold aura-gradient bg-clip-text text-transparent">Gestión de Planes de Previsión</h2>
                            <p className="text-xs text-slate-400">Ver y crear planes para ventas</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        {isCreating ? (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-brand-gold-500 mb-4 flex items-center gap-2">
                                        <HeartHandshake size={18} />
                                        Nuevo Plan
                                    </h3>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre del Plan</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                            placeholder="Ej. Plan Diamante"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descripción corta</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                            placeholder="Ej. Cremación individual con urna especial"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Precio Total al Público</label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-3 text-slate-400">$</span>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pl-8 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                                    placeholder="15000"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mensualidades</label>
                                            <select
                                                value={formData.installmentsCount}
                                                onChange={(e) => setFormData({ ...formData, installmentsCount: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors appearance-none"
                                                disabled={isSubmitting}
                                            >
                                                <option value="1">1 (Pago de Contado)</option>
                                                <option value="3">3 Mensualidades</option>
                                                <option value="6">6 Mensualidades</option>
                                                <option value="12">12 Mensualidades</option>
                                                <option value="24">24 Mensualidades</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center border-t border-white/5 mt-8">
                                    <button
                                        onClick={() => setIsCreating(false)}
                                        className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!formData.name || !formData.price || isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? "Guardando..." : "Guardar Plan"}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl mb-6 border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <HeartHandshake className="text-brand-gold-500" size={24} />
                                        <div>
                                            <h3 className="font-bold text-slate-200">Catálogo Actual</h3>
                                            <p className="text-xs text-slate-500">{plans.length} planes configurados</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="bg-brand-gold-500 text-bg-deep px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-gold-400 transition-colors flex items-center gap-2"
                                    >
                                        <Plus size={16} /> Crear Plan
                                    </button>
                                </div>

                                <div className="grid gap-4">
                                    {loading ? (
                                        [1, 2].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
                                    ) : plans.length === 0 ? (
                                        <p className="text-center text-slate-500 py-10">No hay planes registrados.</p>
                                    ) : (
                                        plans.map(plan => (
                                            <div key={plan.id} className="p-5 rounded-2xl border border-white/10 bg-white/5 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center group hover:border-brand-gold-500/30 transition-colors">
                                                <div>
                                                    <h4 className="font-bold text-brand-gold-100 group-hover:text-brand-gold-500 transition-colors">{plan.name}</h4>
                                                    <p className="text-xs text-slate-400 mt-1">{plan.description || "Sin descripción"}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-lg font-bold">{formatMXN(plan.price)}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-black/20 px-2 py-1 rounded inline-block mt-1 border border-white/5">
                                                        {plan.installmentsCount === 1 ? 'CONTADO' : `${plan.installmentsCount} MESES`}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
