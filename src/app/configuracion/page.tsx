"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, Save, RefreshCcw, DollarSign, Calendar, Info,
    Layers, Palette, Package, ChevronRight, LayoutDashboard,
    CheckCircle2, Plus, X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState<"plans" | "accessories" | "settings">("plans");
    const [plans, setPlans] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "ACCESSORY" });

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/prevision/plans").then(res => res.json()),
            fetch("/api/products").then(res => res.json())
        ]).then(([plansData, productsData]) => {
            setPlans(plansData);
            setProducts(productsData);
            setLoading(false);
        });
    }, []);

    const handleUpdatePlan = async (planId: string, updates: any) => {
        setSaving(true);
        try {
            console.log("Updating plan", planId, updates);
            setTimeout(() => setSaving(false), 800);
        } catch (error) {
            setSaving(false);
        }
    };

    const handleCreateProduct = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            });
            if (res.ok) {
                const created = await res.json();
                setProducts([...products, created]);
                setShowNewProduct(false);
                setNewProduct({ name: "", price: "", stock: "", category: "ACCESSORY" });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings className="text-brand-gold-500 animate-pulse-slow" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold-500/60">Configuración Central</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">Sistema & Operaciones</h2>
                    <p className="text-slate-500 text-xs font-medium">Parametrización global, inventario de accesorios y lógica de costos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-12 px-6 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-bold text-sm hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                        <RefreshCcw size={18} />
                        Restaurar
                    </button>
                    <button
                        onClick={() => {
                            setSaving(true);
                            setTimeout(() => setSaving(false), 1500);
                        }}
                        disabled={saving}
                        className="h-12 px-8 rounded-2xl bg-brand-gold-500 text-black font-black text-sm hover:bg-brand-gold-400 shadow-lg shadow-brand-gold-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </header>

            {/* Navigation Tabs - Modern Apple-style Segmented Control */}
            <div className="flex items-center gap-2 p-1.5 bg-black/40 border border-white/5 backdrop-blur-xl rounded-[1.5rem] w-fit shadow-2xl">
                <button
                    onClick={() => setActiveTab("plans")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                        activeTab === "plans"
                            ? "bg-brand-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <Layers size={16} />
                    Costos de Planes
                </button>
                <button
                    onClick={() => setActiveTab("accessories")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                        activeTab === "accessories"
                            ? "bg-brand-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <Package size={16} />
                    Venta de Accesorios
                </button>
                <button
                    onClick={() => setActiveTab("settings")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                        activeTab === "settings"
                            ? "bg-brand-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <Palette size={16} />
                    Ajustes Globales
                </button>
            </div>

            <div className="min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === "plans" && (
                        <motion.div
                            key="plans"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-brand-gold-500/10 text-brand-gold-500 border border-brand-gold-500/20">
                                    <DollarSign size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold italic tracking-tight underline decoration-brand-gold-500/30 underline-offset-8">Personalización de Planes de Costos</h3>
                                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Lógica de venta por contrato</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="glass-card h-72 animate-pulse rounded-[2.5rem]" />)
                                ) : (
                                    plans.map((plan) => (
                                        <motion.div
                                            key={plan.id}
                                            whileHover={{ y: -5 }}
                                            className="glass-card p-8 rounded-[2.5rem] space-y-8 group border border-white/5 hover:border-brand-gold-500/40 transition-all shadow-2xl"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="text-xl font-bold text-white group-hover:text-brand-gold-500 transition-colors uppercase tracking-tight">{plan.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">ACTIVO • ID: {plan.id.substring(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio Total Mercado</label>
                                                    <div className="relative group/input">
                                                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gold-500/40 group-focus-within/input:text-brand-gold-500 transition-colors" size={18} />
                                                        <input
                                                            type="number"
                                                            defaultValue={plan.price}
                                                            className="aura-input w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-lg font-black tracking-tight focus:bg-white/[0.07] transition-all"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Esquema de Cuotas</label>
                                                    <div className="relative group/input">
                                                        <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gold-500/40 group-focus-within/input:text-brand-gold-500 transition-colors" size={18} />
                                                        <input
                                                            type="number"
                                                            defaultValue={plan.installmentsCount}
                                                            className="aura-input w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-lg font-black tracking-tight focus:bg-white/[0.07] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="w-full h-12 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                                <RefreshCcw size={12} />
                                                Recalcular amortización
                                            </button>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "accessories" && (
                        <motion.div
                            key="accessories"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-brand-gold-500/10 text-brand-gold-500 border border-brand-gold-500/20">
                                        <Package size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold italic tracking-tight underline decoration-brand-gold-500/30 underline-offset-8">Inventario de Accesorios</h3>
                                        <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Gestión de stock de Urnas y Reliquarios</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowNewProduct(true)}
                                    className="h-10 px-5 rounded-xl bg-brand-gold-500 text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-gold-400 transition-all shadow-lg shadow-brand-gold-500/20"
                                >
                                    <Plus size={14} />
                                    Nuevo Artículo
                                </button>
                            </div>

                            {showNewProduct && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-6 rounded-3xl border border-brand-gold-500/20 bg-brand-gold-500/5 mb-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre del Producto</label>
                                            <input
                                                value={newProduct.name}
                                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                                className="aura-input w-full bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold"
                                                placeholder="Ej: Urna Bio-Degradable"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio (MXN)</label>
                                            <input
                                                type="number"
                                                value={newProduct.price}
                                                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="aura-input w-full bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold"
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Stock Inicial</label>
                                            <input
                                                type="number"
                                                value={newProduct.stock}
                                                onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                                                className="aura-input w-full bg-black/20 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleCreateProduct}
                                                disabled={saving || !newProduct.name || !newProduct.price}
                                                className="flex-1 h-10 rounded-xl bg-brand-gold-500 text-black font-bold text-[10px] uppercase tracking-widest hover:bg-brand-gold-400 disabled:opacity-50"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setShowNewProduct(false)}
                                                className="h-10 px-4 rounded-xl bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {loading ? (
                                    [1, 2, 3, 4].map(i => <div key={i} className="glass-card h-32 animate-pulse rounded-2xl" />)
                                ) : products.length === 0 ? (
                                    <div className="col-span-full py-12 text-center text-slate-500">
                                        <p className="text-sm font-medium italic">No hay productos registrados en el catálogo.</p>
                                    </div>
                                ) : (
                                    products.map((product) => (
                                        <motion.div
                                            key={product.id}
                                            className="glass-card p-5 rounded-2xl border border-white/5 hover:border-brand-gold-500/20 transition-all group"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="p-2 rounded-lg bg-brand-gold-500/10 text-brand-gold-500">
                                                    <Package size={16} />
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full",
                                                    product.stock > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}>
                                                    {product.stock > 0 ? `EN STOCK: ${product.stock}` : "SIN STOCK"}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-200 text-sm mb-1 group-hover:text-brand-gold-100 transition-colors uppercase">{product.name}</h4>
                                            <p className="text-xl font-black text-brand-gold-500 tracking-tighter">${product.price.toLocaleString()}</p>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "settings" && (
                        <motion.div
                            key="settings"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-brand-gold-500/10 text-brand-gold-500 border border-brand-gold-500/20">
                                    <Palette size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold italic tracking-tight underline decoration-brand-gold-500/30 underline-offset-8">Identidad & Ajustes Globales</h3>
                                    <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">Configuración del núcleo AURA</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="glass-card p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-500/5 blur-[80px] group-hover:bg-brand-gold-500/10 transition-all" />

                                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold-500 mb-8">Personalización Visual</h4>

                                    <div className="space-y-4">
                                        {[
                                            { label: "Modo Oscuro Permanente", active: true },
                                            { label: "Efectos Glassmorphism Premium", active: true },
                                            { label: "Micro-animaciones Dinámicas", active: true },
                                            { label: "Alertas de Dashboard en tiempo real", active: false }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.05] transition-all">
                                                <span className="text-sm font-bold text-slate-300">{item.label}</span>
                                                <button className={cn(
                                                    "w-12 h-6 rounded-full relative transition-all",
                                                    item.active ? "bg-brand-gold-500" : "bg-white/10"
                                                )}>
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                                                        item.active ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="glass-card p-10 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-brand-gold-500 mb-8">Información Corporativa</h4>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre de Empresa en Contratos</label>
                                                <input className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold" defaultValue="Forever Friends by Airapí" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Representante Legal</label>
                                                <input className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-bold" defaultValue="Ing. Manuel Rodríguez" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Logs de sistema</span>
                                        <button className="text-brand-gold-500 text-xs font-bold hover:underline">Ver Historial de Cambios</button>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
