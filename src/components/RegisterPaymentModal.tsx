"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, DollarSign, Package, Plus, Search } from "lucide-react";
import { useEffect } from "react";


import { cn } from "@/lib/utils";

interface Props {

    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    contractId: string;
    planName: string;
}

export default function RegisterPaymentModal({ isOpen, onClose, onSuccess, contractId, planName }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        type: "Mensualidad",
        notes: "",
        selectedProducts: [] as any[]
    });
    const [catalog, setCatalog] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetch("/api/products")
                .then(res => res.json())
                .then(data => setCatalog(data));
        }
    }, [isOpen]);

    const toggleProduct = (product: any) => {
        const exists = formData.selectedProducts.find(p => p.id === product.id);
        if (exists) {
            setFormData({
                ...formData,
                selectedProducts: formData.selectedProducts.filter(p => p.id !== product.id)
            });
        } else {
            setFormData({
                ...formData,
                selectedProducts: [...formData.selectedProducts, { ...product, quantity: 1 }]
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/prevision/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contractId,
                    amount: parseFloat(formData.amount),
                    type: formData.type,
                    notes: formData.notes,
                    products: formData.selectedProducts.map(p => ({ id: p.id, quantity: 1 }))
                })
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ amount: "", type: "Mensualidad", notes: "", selectedProducts: [] });
            } else {
                const data = await res.json();
                alert(data.error || "Error al registrar pago");
            }
        } catch (error) {
            console.error(error);
            alert("Error de conexión");
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
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Registrar Pago</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Plan: {planName}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Monto (MXN) <span className="text-brand-gold-500">*</span></label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-slate-200 outline-none font-bold"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Pago</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                    >
                                        <option value="Mensualidad">Mensualidad</option>
                                        <option value="Anticipo">Anticipo</option>
                                        <option value="Enganche">Enganche</option>
                                        <option value="Liquidación">Liquidación</option>
                                        <option value="Extraordinario">Extraordinario</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Anexar Accesorios (Urnas, Reliquarios, etc)</label>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Buscar en catálogo..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs font-bold"
                                        />
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                        {catalog.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => toggleProduct(product)}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                                                    formData.selectedProducts.find(p => p.id === product.id)
                                                        ? "bg-brand-gold-500 text-black border-brand-gold-500 shadow-lg shadow-brand-gold-500/10"
                                                        : "bg-white/5 text-slate-500 border-white/5 hover:border-brand-gold-500/30"
                                                )}
                                            >
                                                {product.name} (${product.price})
                                            </button>
                                        ))}
                                    </div>
                                    {formData.selectedProducts.length > 0 && (
                                        <div className="pt-2 border-t border-white/5">
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-gold-500 mb-2">Seleccionados:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {formData.selectedProducts.map(p => (
                                                    <span key={p.id} className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-[9px] font-bold border border-emerald-500/20">
                                                        {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Datos Adicionales / Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none resize-none h-24"
                                    placeholder="Información adicional sobre el pago..."
                                />
                            </div>

                            <button
                                disabled={loading}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Registrar Pago"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
