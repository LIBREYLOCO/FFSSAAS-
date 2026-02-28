"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Dog, HeartHandshake, History, Calendar,
    CheckCircle2, Loader2, DollarSign, Info
} from "lucide-react";
import Link from "next/link";
import { formatMXN } from "@/lib/format";

interface NewServiceOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    owner: any;
    onSuccess: () => void;
    initialPetId?: string;
}

export default function NewServiceOrderModal({ isOpen, onClose, owner, onSuccess, initialPetId }: NewServiceOrderModalProps) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [serviceType, setServiceType] = useState<"IMMEDIATE" | "PREVISION" | null>(null);
    const [formData, setFormData] = useState({
        petId: initialPetId || "",
        contractId: owner?.contracts?.[0]?.id || "",
        price: 3500,
        serviceDate: new Date().toISOString().split('T')[0]
    });

    const [products, setProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

    // Fetch products on mount
    useState(() => {
        fetch("/api/inventory")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProducts(data);
            })
            .catch(err => console.error(err));
    });

    const toggleProduct = (product: any) => {
        const existing = selectedProducts.find(p => p.id === product.id);
        if (existing) {
            setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: string, delta: number) => {
        setSelectedProducts(selectedProducts.map(p => {
            if (p.id === productId) {
                return { ...p, quantity: Math.max(1, p.quantity + delta) };
            }
            return p;
        }));
    };

    const calculateTotal = () => {
        const serviceCost = formData.price || 0;
        const productsCost = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        return serviceCost + productsCost;
    };

    const handleSubmit = async () => {
        if (!formData.petId || !serviceType) return;

        setLoading(true);
        try {
            const response = await fetch("/api/service-orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ownerId: owner.id,
                    petId: formData.petId,
                    serviceType: serviceType,
                    contractId: serviceType === "PREVISION" ? formData.contractId : null,
                    price: serviceType === "IMMEDIATE" ? formData.price : null,
                    serviceDate: formData.serviceDate,
                    selectedProducts: selectedProducts.map(p => ({
                        id: p.id,
                        quantity: p.quantity,
                        price: p.price
                    }))
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setStep(1);
                setServiceType(null);
                setSelectedProducts([]);
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
                    className="glass-card w-full max-w-xl overflow-hidden rounded-[2.5rem] relative max-h-[90vh] flex flex-col"
                >
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold-500/10 blur-[100px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 blur-[100px] -z-10" />

                    <div className="p-8 flex-1 overflow-y-auto">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Nueva Orden de Servicio</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Cliente: {owner.name}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        {/* Progress Bar */}
                        <div className="flex gap-2 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-brand-gold-500" : "bg-white/10"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Stephens Logic */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Seleccionar Mascota</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {owner.pets?.filter((p: any) => !p.deathDate).length === 0 ? (
                                            <div className="p-4 text-center border-2 border-dashed border-white/10 rounded-2xl text-slate-500 italic">
                                                No hay mascotas activas registradas para este cliente.
                                            </div>
                                        ) : (
                                            owner.pets?.filter((p: any) => !p.deathDate).map((pet: any) => (
                                                <button
                                                    key={pet.id}
                                                    onClick={() => setFormData({ ...formData, petId: pet.id })}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${formData.petId === pet.id
                                                        ? "bg-brand-gold-500/10 border-brand-gold-500/50 text-brand-gold-500 shadow-[0_0_20px_rgba(197,160,89,0.1)]"
                                                        : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                                                        }`}
                                                >
                                                    <div className={`p-2 rounded-xl ${formData.petId === pet.id ? "bg-brand-gold-500/20" : "bg-white/5"}`}>
                                                        <Dog size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm tracking-tight">{pet.name}</p>
                                                        <p className="text-[10px] uppercase opacity-60 font-medium">{pet.species} • {pet.breed || "Raza única"}</p>
                                                    </div>
                                                    {formData.petId === pet.id && <CheckCircle2 size={18} className="text-brand-gold-500" />}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        disabled={!formData.petId}
                                        onClick={() => setStep(2)}
                                        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continuar
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Servicio</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setServiceType("IMMEDIATE")}
                                            className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all gap-3 ${serviceType === "IMMEDIATE"
                                                ? "bg-brand-gold-500/10 border-brand-gold-500/50 text-brand-gold-500"
                                                : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                                                }`}
                                        >
                                            <div className="p-4 rounded-2xl bg-white/5">
                                                <DollarSign size={24} />
                                            </div>
                                            <span className="font-bold text-sm">Cremación Directa</span>
                                        </button>
                                        <button
                                            disabled={!owner.contracts?.length}
                                            onClick={() => setServiceType("PREVISION")}
                                            className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all gap-3 relative ${serviceType === "PREVISION"
                                                ? "bg-brand-gold-500/10 border-brand-gold-500/50 text-brand-gold-500"
                                                : "bg-white/5 border-white/5 text-slate-400 hover:border-white/10"
                                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                        >
                                            <div className="p-4 rounded-2xl bg-white/5">
                                                <HeartHandshake size={24} />
                                            </div>
                                            <span className="font-bold text-sm">Usar Previsión</span>
                                        </button>
                                    </div>
                                </div>

                                {serviceType === "IMMEDIATE" && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                                        <div className="flex items-center gap-2 text-brand-gold-500 mb-2">
                                            <Info size={16} />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Información de Cobro</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Costo del Servicio (MXN)</label>
                                            <div className="relative mt-2">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold-500" size={18} />
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xl font-bold aura-input transition-all"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all text-xs uppercase tracking-widest border border-white/5">
                                        Atrás
                                    </button>
                                    <button
                                        disabled={!serviceType}
                                        onClick={() => setStep(3)}
                                        className="btn-primary flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 group"
                                    >
                                        Siguiente: Productos
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Agregar Productos Adicionales</label>
                                        <Link href="/configuracion/inventario" className="text-[10px] font-bold text-brand-gold-500 hover:underline">
                                            Gestionar Inventario
                                        </Link>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                        {products.length === 0 ? (
                                            <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-slate-500 italic">
                                                No hay productos disponibles en inventario.
                                            </div>
                                        ) : (
                                            products.map(product => {
                                                const isSelected = selectedProducts.find(p => p.id === product.id);
                                                return (
                                                    <div key={product.id} className={`p-4 rounded-2xl border transition-all ${isSelected ? "bg-brand-gold-500/10 border-brand-gold-500/30" : "bg-white/5 border-white/5"}`}>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div>
                                                                <p className="font-bold text-sm text-white">{product.name}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{formatMXN(product.price)} • Stock: {product.stock}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => toggleProduct(product)}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-red-500/20 text-red-500" : "bg-brand-gold-500/20 text-brand-gold-500"}`}
                                                            >
                                                                {isSelected ? <X size={16} /> : <CheckCircle2 size={16} />}
                                                            </button>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Cantidad:</span>
                                                                <div className="flex items-center gap-3">
                                                                    <button onClick={() => updateQuantity(product.id, -1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                                                                    <span className="font-mono font-bold text-sm">{isSelected.quantity}</span>
                                                                    <button onClick={() => updateQuantity(product.id, 1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10" disabled={isSelected.quantity >= product.stock}>+</button>
                                                                </div>
                                                                <div className="flex-1 text-right font-bold text-brand-gold-500 text-sm">
                                                                    {formatMXN(product.price * isSelected.quantity)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-bold text-slate-400">Servicio Base</span>
                                            <span className="font-mono text-sm">{formatMXN(formData.price || 0)}</span>
                                        </div>
                                        {selectedProducts.length > 0 && (
                                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                                                <span className="text-xs font-bold text-slate-400">Productos ({selectedProducts.length})</span>
                                                <span className="font-mono text-sm">{formatMXN(selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0))}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-black uppercase tracking-widest text-brand-gold-500">Total a Pagar</span>
                                            <span className="text-2xl font-black text-white italic tracking-tighter">{formatMXN(calculateTotal())}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button onClick={() => setStep(2)} className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold transition-all text-xs uppercase tracking-widest border border-white/5">
                                        Atrás
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={handleSubmit}
                                        className="btn-primary flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Orden"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
