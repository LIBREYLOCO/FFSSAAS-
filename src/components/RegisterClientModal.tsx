"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Dog, HeartHandshake, ArrowRight, Check } from "lucide-react";

interface RegisterClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterClientModal({ isOpen, onClose, onSuccess }: RegisterClientModalProps) {
    const [step, setStep] = useState(1);
    const [serviceType, setServiceType] = useState<"IMMEDIATE" | "PREVISION" | null>(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        petName: "",
        petSpecies: "Perro",
        petBreed: "",
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/owners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    serviceType
                }),
            });

            if (response.ok) {
                onSuccess();
                onClose();
                // Reset state
                setStep(1);
                setServiceType(null);
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    address: "",
                    petName: "",
                    petSpecies: "Perro",
                    petBreed: "",
                });
            }
        } catch (error) {
            console.error("Error creating client:", error);
        } finally {
            setLoading(false);
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
                    className="glass-card w-full max-w-xl rounded-3xl overflow-hidden relative shadow-2xl border-white/10"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div>
                            <h2 className="text-xl font-bold aura-gradient bg-clip-text text-transparent">Nuevo Registro</h2>
                            <p className="text-xs text-slate-400">Paso {step} de {serviceType === "IMMEDIATE" ? 3 : 2}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4 text-brand-gold-500">
                                        <User size={20} />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Información del Dueño</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre Completo</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                                placeholder="Ej. María García"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Teléfono</label>
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                                placeholder="Ej. +52 ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                            placeholder="maria@ejemplo.com"
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={handleNext}
                                        disabled={!formData.name}
                                        className="btn-primary"
                                    >
                                        Siguiente <ArrowRight size={18} className="ml-2" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold">Selecciona el tipo de servicio</h3>
                                    <p className="text-sm text-slate-400">Determina cómo se procesará el alta de este cliente.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setServiceType("IMMEDIATE")}
                                        className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${serviceType === "IMMEDIATE"
                                                ? "border-brand-gold-500 bg-brand-gold-500/10"
                                                : "border-white/5 bg-white/5 hover:border-white/20"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${serviceType === "IMMEDIATE" ? "bg-brand-gold-500 text-bg-deep" : "bg-white/5 text-brand-gold-500"
                                            }`}>
                                            <Dog size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Servicio Inmediato</h4>
                                            <p className="text-xs text-slate-500 mt-1">Cremación de emergencia para una mascota hoy mismo.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setServiceType("PREVISION")}
                                        className={`p-6 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 group ${serviceType === "PREVISION"
                                                ? "border-accent-500 bg-accent-500/10"
                                                : "border-white/5 bg-white/5 hover:border-white/20"
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${serviceType === "PREVISION" ? "bg-accent-500 text-bg-deep" : "bg-white/5 text-accent-500"
                                            }`}>
                                            <HeartHandshake size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">Contrato Previsión</h4>
                                            <p className="text-xs text-slate-500 mt-1">Plan a futuro con pagos mensuales o pago único.</p>
                                        </div>
                                    </button>
                                </div>

                                <div className="pt-4 flex justify-between items-center">
                                    <button onClick={handleBack} className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
                                        ← Volver
                                    </button>
                                    <button
                                        onClick={serviceType === "IMMEDIATE" ? handleNext : handleSubmit}
                                        disabled={!serviceType || loading}
                                        className="btn-primary"
                                    >
                                        {loading ? "Procesando..." : serviceType === "IMMEDIATE" ? "Siguiente" : "Finalizar Alta"}
                                        {!loading && <Check size={18} className="ml-2" />}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && serviceType === "IMMEDIATE" && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 mb-4 text-brand-gold-500">
                                        <Dog size={20} />
                                        <h3 className="font-bold uppercase tracking-widest text-sm">Información de la Mascota</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre de la Mascota</label>
                                        <input
                                            type="text"
                                            value={formData.petName}
                                            onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                            placeholder="Ej. Toby"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Especie</label>
                                            <select
                                                value={formData.petSpecies}
                                                onChange={(e) => setFormData({ ...formData, petSpecies: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                            >
                                                <option value="Perro">Perro</option>
                                                <option value="Gato">Gato</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Raza</label>
                                            <input
                                                type="text"
                                                value={formData.petBreed}
                                                onChange={(e) => setFormData({ ...formData, petBreed: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors"
                                                placeholder="Ej. Labrador"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center">
                                    <button onClick={handleBack} className="text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors">
                                        ← Volver
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!formData.petName || loading}
                                        className="btn-primary"
                                    >
                                        {loading ? "Registrando..." : "Crear Servicio Inmediato"}
                                        {!loading && <Check size={18} className="ml-2" />}
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
