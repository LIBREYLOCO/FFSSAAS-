"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HeartHandshake, User, DollarSign, Loader2, Search, Briefcase } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterContractModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [searchOwner, setSearchOwner] = useState("");

    const [formData, setFormData] = useState({
        ownerId: "",
        planId: "",
        salespersonId: "",
        downPayment: 0
    });

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                fetch("/api/owners").then(res => res.json()),
                fetch("/api/prevision/plans").then(res => res.json()),
                fetch("/api/vendedores").then(res => res.json())
            ]).then(([ownersData, plansData, vendorsData]) => {
                setOwners(ownersData);
                setPlans(plansData);
                setVendedores(vendorsData);
            });
        }
    }, [isOpen]);

    const filteredOwners = owners.filter(o =>
        o.name.toLowerCase().includes(searchOwner.toLowerCase())
    );

    const selectedPlan = plans.find(p => p.id === formData.planId);
    const planPrice = selectedPlan ? Number(selectedPlan.price) : 0;
    const remaining = selectedPlan ? (planPrice - formData.downPayment) : 0;
    const installments = selectedPlan ? (remaining / selectedPlan.installmentsCount) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ownerId || !formData.planId) return alert("Faltan campos obligatorios");

        setLoading(true);
        try {
            const res = await fetch("/api/prevision/contracts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess();
                onClose();
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
                    className="glass-card w-full max-w-2xl overflow-hidden rounded-[2.5rem] relative"
                >
                    <div className="p-8">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Nueva Venta de Previsión</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Formalización de Contrato</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Titular del Contrato</label>
                                        <div className="relative mb-2">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar cliente..."
                                                value={searchOwner}
                                                onChange={e => setSearchOwner(e.target.value)}
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar border border-white/5 rounded-2xl p-2 bg-black/20">
                                            {filteredOwners.map(owner => (
                                                <button
                                                    key={owner.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData({ ...formData, ownerId: owner.id });
                                                        setSearchOwner(owner.name);
                                                    }}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${formData.ownerId === owner.id
                                                        ? "bg-brand-gold-500/20 border-brand-gold-500/50 text-brand-gold-100"
                                                        : "bg-white/5 border-white/5 hover:border-white/20"
                                                        }`}
                                                >
                                                    <User size={14} /> {owner.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Plan de Previsión</label>
                                        <select
                                            required
                                            value={formData.planId}
                                            onChange={e => setFormData({ ...formData, planId: e.target.value })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                        >
                                            <option value="">Selecciona un plan</option>
                                            {plans.map(plan => (
                                                <option key={plan.id} value={plan.id}>{plan.name} (${plan.price})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asesor de Ventas</label>
                                        <select
                                            value={formData.salespersonId}
                                            onChange={e => setFormData({ ...formData, salespersonId: e.target.value })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                        >
                                            <option value="">Selecciona un asesor (opcional)</option>
                                            {vendedores.map(v => (
                                                <option key={v.id} value={v.id}>{v.name} ({v.level})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Enganche / Pago Inicial</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="number"
                                                value={formData.downPayment}
                                                onChange={e => setFormData({ ...formData, downPayment: Number(e.target.value) })}
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-slate-200 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedPlan && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-6 rounded-3xl bg-brand-gold-500/10 border border-brand-gold-500/20 grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold-500 mb-1">Resumen de Pago</p>
                                        <h4 className="text-xl font-bold">${remaining.toLocaleString()} restante</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold-500 mb-1">Cuotas Mensuales</p>
                                        <h4 className="text-xl font-bold">{selectedPlan.installmentsCount} cuotas de ${installments.toFixed(2)}</h4>
                                    </div>
                                </motion.div>
                            )}

                            <button
                                disabled={loading || !formData.ownerId || !formData.planId}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Generar Contrato"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
