"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCcw, DollarSign, Calendar, Info, Layers, Palette, Package, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ConfigurationPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/prevision/plans")
            .then(res => res.json())
            .then(data => {
                setPlans(data);
                setLoading(false);
            });
    }, []);

    const handleUpdatePlan = async (planId: string, updates: any) => {
        setSaving(true);
        try {
            // This would ideally call a PATCH /api/prevision/plans/[id]
            // For now, we simulate the update or show it as ready for implementation
            console.log("Updating plan", planId, updates);
            setTimeout(() => setSaving(false), 800);
        } catch (error) {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Configuración del Sistema</h2>
                    <p className="text-slate-400">Parametrización de planes, costos y ajustes globales.</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <RefreshCcw size={18} />
                        Restaurar
                    </button>
                    <button
                        disabled={saving}
                        className="btn-primary flex items-center gap-2"
                    >
                        {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                        Guardar Cambios
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plans Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Layers className="text-brand-gold-500" size={20} />
                        <h3 className="text-xl font-bold italic">Planes de Previsión</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="glass-card h-64 animate-pulse rounded-3xl" />)
                        ) : (
                            plans.map((plan) => (
                                <motion.div
                                    key={plan.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="glass-card p-8 rounded-[2rem] space-y-6 group border border-white/5 hover:border-brand-gold-500/20 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-bold text-brand-gold-100">{plan.name}</h4>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {plan.id}</p>
                                        </div>
                                        <div className="p-3 bg-brand-gold-500/10 rounded-2xl text-brand-gold-500">
                                            <Layers size={20} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio Total</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input
                                                    type="number"
                                                    defaultValue={plan.price}
                                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Número de Cuotas</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input
                                                    type="number"
                                                    defaultValue={plan.installmentsCount}
                                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descripción corta</label>
                                            <div className="relative">
                                                <Info className="absolute left-4 top-4 text-slate-500" size={16} />
                                                <textarea
                                                    defaultValue={plan.description}
                                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm resize-none h-20"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* General Settings */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Palette className="text-brand-gold-500" size={20} />
                        <h3 className="text-xl font-bold italic">Ajustes Globales</h3>
                    </div>

                    <div className="glass-card p-8 rounded-[2rem] space-y-8 border border-white/5">
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-300">Identidad Visual</h4>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400">Modo Oscuro</span>
                                    <div className="w-10 h-5 bg-brand-gold-500 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400">Efecto Glassmorphism</span>
                                    <div className="w-10 h-5 bg-brand-gold-500 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <h4 className="text-sm font-bold text-slate-300">Moneda y Región</h4>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Símbolo Moneda</label>
                                <select className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm outline-none appearance-none">
                                    <option value="USD">USD ($)</option>
                                    <option value="MXN">MXN ($)</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20">
                            <p className="text-[10px] text-brand-gold-500 font-bold uppercase tracking-widest text-center">
                                Versión del Software: 1.2.4-stable
                            </p>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-white/5">
                            <h4 className="text-sm font-bold text-brand-gold-100 flex items-center gap-2">
                                <Package size={16} /> Catálogo de Artículos
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Urnas, Relicarios y Accesorios</p>
                            <Link
                                href="/configuracion/inventario"
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 group hover:bg-white/10 hover:border-brand-gold-500/50 transition-all font-bold text-xs uppercase tracking-widest"
                            >
                                Gestionar Inventario
                                <ChevronRight size={16} className="text-brand-gold-500 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
