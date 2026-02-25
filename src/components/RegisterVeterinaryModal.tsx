"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Stethoscope, DollarSign, Loader2, Info } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterVeterinaryModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        fixedFee: 500
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/veterinarias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ name: "", fixedFee: 500 });
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
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Nueva Veterinaria</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Alta en Red de Referidos</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre de la Clínica / Especialista</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-brand-gold-500/50"
                                    placeholder="Ej. Clínica Veterinaria del Valle"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Pago Fijo por Recomendación (MXN)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gold-500" size={20} />
                                    <input
                                        required
                                        type="number"
                                        value={formData.fixedFee}
                                        onChange={e => setFormData({ ...formData, fixedFee: Number(e.target.value) })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xl font-bold text-slate-200 outline-none transition-all focus:border-brand-gold-500/50"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/20 flex gap-4 items-start">
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                                    <Info size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-blue-400 text-sm">Política de Referidos</p>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        Este monto se liquidará automáticamente al momento de la firma de un contrato de previsión o pago de servicio inmediato referido por esta clínica.
                                    </p>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Vincular Veterinaria"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
