"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Settings,
    DollarSign,
    Shield,
    Save,
    UserPlus,
    MoreVertical,
    CheckCircle2,
    Palette,
    Bell
} from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or similar is available or I can use a simpler alert

const TABS = [
    { id: "users", label: "Usuarios & Roles", icon: Users },
    { id: "pricing", label: "Precios & Tabuladores", icon: DollarSign },
    { id: "system", label: "Sistema & Marca", icon: Settings },
    { id: "security", label: "Seguridad", icon: Shield },
];

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(false);

    // Mock states for UI demonstration
    const [users, setUsers] = useState([
        { id: 1, name: "Admin Aura", email: "admin@aura.lat", role: "ADMIN" },
        { id: 2, name: "Chofer 1", email: "chofer1@aura.lat", role: "DRIVER" },
        { id: 3, name: "Vendedor Alpha", email: "ventas@aura.lat", role: "VENDEDOR" },
    ]);

    const [pricing, setPricing] = useState({
        "0-5kg": 2500,
        "5-15kg": 3500,
        "15-30kg": 4500,
        "30kg+": 6000,
        "immediate_surcharge": 1200,
    });

    const [system, setSystem] = useState({
        appName: "Aura Forever Friends",
        contactPhone: "55 1234 5678",
        contactWhatsApp: "55 8765 4321",
        primaryColor: "#D4AF37",
        allowPublicTracking: true,
    });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert("Configuración guardada correctamente");
        }, 1000);
    };

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic aura-gradient bg-clip-text text-transparent tracking-tighter">
                        Panel de Control
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
                        Aura Management System v1.0
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2 self-start md:self-center"
                >
                    <Save size={18} /> {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 shrink-0">
                    <nav className="glass-card p-2 rounded-[32px] border border-white/5 space-y-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${isActive
                                            ? "bg-brand-gold-500 text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    <Icon size={20} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 glass-card p-6 rounded-[32px] border border-white/5 bg-brand-gold-500/5">
                        <div className="flex items-center gap-2 text-brand-gold-500 mb-2">
                            <Bell size={18} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Novedades</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Módulo de roles activado. Ahora puedes restringir el acceso por perfil de empleado.
                        </p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="glass-card p-8 rounded-[40px] border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold-500/5 blur-[80px] -z-10" />

                            {activeTab === "users" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-xl font-bold">Gestión de Personal</h2>
                                        <button className="text-[10px] font-black bg-white/5 text-slate-300 px-4 py-2 rounded-xl hover:text-white transition-colors border border-white/5 flex items-center gap-2 uppercase tracking-widest">
                                            <UserPlus size={14} /> Añadir Usuario
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {users.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-gold-500/20 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                                        <Users size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm">{user.name}</h4>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-brand-gold-500/20 text-brand-gold-500' :
                                                            user.role === 'DRIVER' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                    <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "pricing" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">Variables de Costo</h2>
                                        <p className="text-slate-500 text-xs">Ajusta los precios base por peso y recargos por urgencia.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(pricing).map(([key, value]) => (
                                            <div key={key} className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                                    {key.replace('_', ' ')}
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold-500 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        value={value}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-8 pr-4 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all"
                                                        onChange={(e) => setPricing({ ...pricing, [key]: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "system" && (
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-xl font-bold mb-2">Identidad & Contacto</h2>
                                        <p className="text-slate-500 text-xs">Información global que aparece en tickets y rastreo público.</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre de la Aplicación</label>
                                            <input
                                                value={system.appName}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50"
                                                onChange={(e) => setSystem({ ...system, appName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono Público</label>
                                                <input
                                                    value={system.contactPhone}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none"
                                                    onChange={(e) => setSystem({ ...system, contactPhone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Color Principal (Brand)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        value={system.primaryColor}
                                                        className="w-14 h-14 bg-transparent border-none cursor-pointer"
                                                        onChange={(e) => setSystem({ ...system, primaryColor: e.target.value })}
                                                    />
                                                    <span className="text-xs font-mono text-slate-500 uppercase">{system.primaryColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "security" && (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                        <Shield size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold">Mantenimiento de Seguridad</h3>
                                    <p className="text-slate-500 text-sm max-w-xs">
                                        Esta sección permite configurar auditorías y expiración de sesiones. Próximamente disponible.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
