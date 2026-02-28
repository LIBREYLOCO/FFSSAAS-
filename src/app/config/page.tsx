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
    CheckCircle2,
    Bell,
    FileText,
    FlaskConical,
    RefreshCcw,
    Trash2,
    KeyRound,
    X,
    Building2,
    Check,
    ImageIcon,
    Plus,
    Package,
    ChevronRight,
} from "lucide-react";
import { BACKGROUNDS } from "@/lib/backgrounds";

const TABS = [
    { id: "users", label: "Usuarios & Roles", icon: Users },
    { id: "pricing", label: "Precios & Tabuladores", icon: DollarSign },
    { id: "accessories", label: "Venta de Accesorios", icon: Package },
    { id: "sucursales", label: "Sucursales", icon: Building2 },
    { id: "system", label: "Sistema & Marca", icon: Settings },
    { id: "templates", label: "Plantillas de Contratos", icon: FileText },
    { id: "security", label: "Seguridad", icon: Shield },
];

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState<{ id: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // State for real data from API
    const [users, setUsers] = useState<any[]>([]);
    const [sucursales, setSucursales] = useState<{ id: string; nombre: string; codigo: string }[]>([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "VENDEDOR", sucursalId: "" });

    // Accessory State
    const [products, setProducts] = useState<any[]>([]);
    const [showNewProduct, setShowNewProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", stock: "", category: "ACCESSORY" });

    const [pricing, setPricing] = useState({
        "0-5kg": 2500,
        "5-15kg": 3500,
        "15-30kg": 4500,
        "30kg+": 6000,
        "immediate_surcharge": 1200,
    });

    const [system, setSystem] = useState({
        appName: "Aura Forever Friends",
        legalName: "Aura Mascotas S.A. de C.V.",
        legalRepresentative: "Roberto Martínez Cruz",
        contactPhone: "55 1234 5678",
        contactWhatsApp: "55 8765 4321",
        primaryColor: "#D4AF37",
        backgroundId: "none",
        allowPublicTracking: true,
    });

    const [demoLoading, setDemoLoading] = useState(false);
    const [demoMsg, setDemoMsg] = useState("");

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/products");
            if (res.ok) setProducts(await res.json());
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const runDemo = async (action: "load" | "clear") => {
        setDemoLoading(true);
        setDemoMsg("");
        try {
            const res = await fetch("/api/demo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const result = await res.json();
            setDemoMsg(result.message || (action === "load" ? "✅ Datos cargados" : "🗑️ Datos eliminados"));
            setTimeout(() => { setDemoMsg(""); }, 3000);
            if (action === "load") fetchUsers(); // Refresh users if loaded
        } catch {
            setDemoMsg("❌ Error al procesar la acción");
        } finally {
            setDemoLoading(false);
        }
    };

    const fetchSystemConfig = async () => {
        try {
            const res = await fetch("/api/system-config");
            if (res.ok) {
                const data = await res.json();
                setSystem({
                    ...data,
                    // Parse boolean values stored as strings
                    allowPublicTracking: data.allowPublicTracking === "true" || data.allowPublicTracking === true,
                });
            }
        } catch (error) {
            console.error("Error fetching system config:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) setUsers(await res.json());
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchSucursales = async () => {
        try {
            const res = await fetch("/api/sucursales");
            if (res.ok) setSucursales(await res.json());
        } catch { }
    };

    useEffect(() => {
        fetchUsers();
        fetchSystemConfig();
        fetchSucursales();
    }, []);

    const dashboardItems = [
        { id: "system", label: "Sistema & Marca", desc: "Configuración global, identidad visual y contactos.", icon: Settings, color: "from-brand-gold-500/20 to-transparent", textColor: "text-brand-gold-400" },
        { id: "users", label: "Usuarios & Roles", desc: "Gestión de accesos, perfiles y permisos del equipo.", icon: Users, color: "from-purple-500/20 to-transparent", textColor: "text-purple-400" },
        { id: "pricing", label: "Precios & Costos", desc: "Tabuladores de peso, recargos y planes de previsión.", icon: DollarSign, color: "from-emerald-500/20 to-transparent", textColor: "text-emerald-400" },
        { id: "accessories", label: "Inventario Aura", desc: "Catálogo de urnas, accesorios y control de stock.", icon: Package, color: "from-blue-500/20 to-transparent", textColor: "text-blue-400" },
        { id: "sucursales", label: "Sucursales", desc: "Gestión de sedes, conductores y logística local.", icon: Building2, color: "from-orange-500/20 to-transparent", textColor: "text-orange-400" },
        { id: "templates", label: "Contratos", desc: "Plantillas legales y generación automática de PDFs.", icon: FileText, color: "from-slate-500/20 to-transparent", textColor: "text-slate-400" },
    ];

    const handleAddUser = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (res.ok) {
                await fetchUsers();
                setIsAddUserModalOpen(false);
                setNewUser({ name: "", email: "", password: "", role: "VENDEDOR", sucursalId: "" });
            } else {
                alert(data.error || "Error al crear usuario");
            }
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !current }),
            });
            await fetchUsers();
        } catch {
            alert("Error al actualizar estado del usuario.");
        }
    };

    const handleChangeRole = async (id: string, role: string) => {
        try {
            await fetch(`/api/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            await fetchUsers();
        } catch {
            alert("Error al cambiar rol.");
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordModal || newPassword.length < 8) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${resetPasswordModal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });
            if (res.ok) {
                setResetPasswordModal(null);
                setNewPassword("");
            } else {
                const d = await res.json();
                alert(d.error || "Error al cambiar contraseña.");
            }
        } catch {
            alert("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string, name: string) => {
        if (!confirm(`¿Eliminar permanentemente a "${name}"? Esta acción no se puede deshacer.`)) return;
        try {
            await fetch(`/api/users/${id}`, { method: "DELETE" });
            await fetchUsers();
        } catch {
            alert("Error al eliminar usuario.");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/system-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(system),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Configuración guardada exitosamente.");
                // Notify ThemeProvider immediately so background/color apply without waiting for poll
                window.dispatchEvent(new CustomEvent("aura:config-updated", { detail: system }));
            } else {
                alert(`Error al guardar: ${data.detail || data.error || "Error desconocido"}`);
            }
        } catch (error: any) {
            console.error("Error saving config:", error);
            alert(`Error de conexión: ${error?.message ?? error}`);
        } finally {
            setLoading(false);
        }
    };

    const [saving, setSaving] = useState(false);

    const cn = (...classes: string[]) => classes.filter(Boolean).join(" ");

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4">
            {/* Header section with back button if tab is active */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <AnimatePresence mode="wait">
                            {activeTab && (
                                <motion.button
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    onClick={() => setActiveTab(null)}
                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors mr-2"
                                >
                                    <X size={18} />
                                </motion.button>
                            )}
                        </AnimatePresence>
                        <Settings className="text-brand-gold-500" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold-500/60">
                            {activeTab ? TABS.find(t => t.id === activeTab)?.label : "Panel de Gestión"}
                        </span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent leading-tight">
                        {activeTab ? "Configuración" : "Sistema & Operaciones"}
                    </h2>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Control total sobre infraestructura, identidad y logística.</p>
                </div>

                {activeTab && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="h-14 px-10 rounded-[2rem] bg-brand-gold-500 text-black font-black text-sm hover:bg-brand-gold-400 shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2"
                        >
                            {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                )}
            </header>

            <AnimatePresence mode="wait">
                {!activeTab ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, y: 30 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8"
                    >
                        {dashboardItems.map((item, idx) => (
                            <motion.button
                                key={item.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08, duration: 0.5 }}
                                onClick={() => setActiveTab(item.id)}
                                className="group relative glass-card p-10 rounded-[3.5rem] border border-white/5 hover:border-brand-gold-500/40 transition-all duration-700 text-left overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col h-full min-h-[300px]"
                            >
                                {/* Background glow effect */}
                                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br", item.color)} />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className={cn("w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 mb-8", item.textColor)}>
                                        <item.icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black italic tracking-tight text-white mb-2 group-hover:text-brand-gold-200 transition-colors">
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-all">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-px bg-white/10 group-hover:w-12 group-hover:bg-brand-gold-500 transition-all duration-500" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 group-hover:text-brand-gold-500 transition-colors">
                                                Administrar
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        ))}

                        {/* Interactive Demo Control Card (Optional addition for extra "eye-candy") */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-4 p-1 rounded-[3rem] bg-gradient-to-r from-brand-gold-500/20 via-transparent to-brand-gold-500/20">
                            <div className="glass-card p-10 rounded-[2.9rem] flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h4 className="text-xl font-bold mb-1">Entorno de Pruebas</h4>
                                    <p className="text-xs text-slate-500">¿Quieres ver cómo luce Aura con datos reales de ejemplo?</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => runDemo("load")} disabled={demoLoading} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Cargar Demo
                                    </button>
                                    <button onClick={() => runDemo("clear")} disabled={demoLoading} className="px-8 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all">
                                        Limpiar Todo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="tabs-content"
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -20 }}
                        className="glass-card-strong rounded-[4rem] border border-white/5 overflow-hidden shadow-2xl min-h-[700px] flex flex-col"
                    >
                        {/* Sticky Tab switcher inside active tab view */}
                        <div className="sticky top-0 z-50 p-3 border-b border-white/[0.05] bg-black/60 backdrop-blur-2xl flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border",
                                        activeTab === tab.id
                                            ? "bg-brand-gold-500 border-brand-gold-500 text-black shadow-lg shadow-brand-gold-500/20"
                                            : "text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/10"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-12 overflow-y-auto">
                            {activeTab === "users" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-xl font-bold">Gestión de Personal</h2>
                                            <p className="text-xs text-slate-500 mt-1">{users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}</p>
                                        </div>
                                        <button
                                            onClick={() => setIsAddUserModalOpen(true)}
                                            className="text-[10px] font-black bg-white/5 text-slate-300 px-4 py-2 rounded-xl hover:text-white transition-colors border border-white/5 flex items-center gap-2 uppercase tracking-widest"
                                        >
                                            <UserPlus size={14} /> Añadir Usuario
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {users.length === 0 && (
                                            <div className="text-center py-12 text-slate-500 text-sm">
                                                No hay usuarios. Crea el primero.
                                            </div>
                                        )}
                                        {users.map((user) => (
                                            <div key={user.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${user.isActive ? "bg-white/5 border-white/5 hover:border-brand-gold-500/20" : "bg-white/2 border-white/5 opacity-50"}`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${user.isActive ? "bg-brand-gold-500/10 text-brand-gold-500" : "bg-white/5 text-slate-600"}`}>
                                                        <Users size={22} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm">{user.name}</h4>
                                                            {!user.isActive && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 uppercase tracking-widest">Inactivo</span>}
                                                        </div>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                        {user.sucursal && (
                                                            <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                                                                {user.sucursal.nombre}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Selector de rol */}
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all ${user.role === "ADMIN"
                                                            ? "bg-brand-gold-500/10 border-brand-gold-500/20 text-brand-gold-500"
                                                            : user.role === "GERENTE_SUCURSAL"
                                                                ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                                                                : user.role === "OPERADOR"
                                                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                                                    : user.role === "DRIVER"
                                                                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                            }`}
                                                    >
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="GERENTE_SUCURSAL">GERENTE SUC.</option>
                                                        <option value="OPERADOR">OPERADOR</option>
                                                        <option value="VENDEDOR">VENDEDOR</option>
                                                        <option value="DRIVER">DRIVER</option>
                                                    </select>
                                                    {/* Reset contraseña */}
                                                    <button
                                                        onClick={() => { setResetPasswordModal({ id: user.id, name: user.name }); setNewPassword(""); }}
                                                        title="Cambiar contraseña"
                                                        className="p-2 rounded-xl text-slate-500 hover:text-brand-gold-500 hover:bg-brand-gold-500/10 transition-all"
                                                    >
                                                        <KeyRound size={16} />
                                                    </button>
                                                    {/* Toggle activo/inactivo */}
                                                    <button
                                                        onClick={() => handleToggleActive(user.id, user.isActive)}
                                                        title={user.isActive ? "Desactivar acceso" : "Activar acceso"}
                                                        className={`p-2 rounded-xl transition-all ${user.isActive ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10"}`}
                                                    >
                                                        {user.isActive
                                                            ? <CheckCircle2 size={16} />
                                                            : <X size={16} />
                                                        }
                                                    </button>
                                                    {/* Eliminar */}
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        title="Eliminar usuario"
                                                        className="p-2 rounded-xl text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <Trash2 size={16} />
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

                            {activeTab === "accessories" && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold">Catálogo de Artículos</h2>
                                            <p className="text-xs text-slate-500 mt-1">Gestión de urnas, reliquarios y otros accesorios disponibles.</p>
                                        </div>
                                        <button
                                            onClick={() => setShowNewProduct(true)}
                                            className="text-[10px] font-black bg-brand-gold-500 text-black px-6 py-3 rounded-2xl hover:bg-brand-gold-400 transition-all flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-brand-gold-500/10"
                                        >
                                            <Plus size={16} /> Nuevo Artículo
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {products.length === 0 && (
                                            <div className="col-span-full text-center py-20 bg-white/5 border border-white/10 rounded-[2.5rem] border-dashed">
                                                <Package className="mx-auto text-slate-600 mb-4" size={48} />
                                                <p className="text-slate-400 font-bold mb-2">No hay artículos registrados</p>
                                                <p className="text-xs text-slate-600">Comienza agregando urnas o accesorios al inventario.</p>
                                            </div>
                                        )}
                                        {products.map((product) => (
                                            <div key={product.id} className="glass-card p-6 rounded-[2rem] border border-white/5 hover:border-brand-gold-500/30 transition-all group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 border border-brand-gold-500/20">
                                                        <Package size={24} />
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black italic tracking-tighter text-white">${Number(product.price).toLocaleString()}</p>
                                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Precio Venta</p>
                                                    </div>
                                                </div>
                                                <h4 className="text-lg font-bold leading-tight mb-1">{product.name}</h4>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-mono">{product.sku}</span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${product.stock > 10 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                                        {product.stock} en stock
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Modal Nuevo Producto */}
                                    {showNewProduct && (
                                        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-10 rounded-[3rem] border border-white/10 w-full max-w-md shadow-2xl relative text-white">
                                                <button onClick={() => setShowNewProduct(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={24} /></button>
                                                <div className="mb-8">
                                                    <h2 className="text-2xl font-black italic aura-gradient bg-clip-text text-transparent">Nuevo Artículo</h2>
                                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Catálogo de Accesorios</p>
                                                </div>
                                                <div className="space-y-6">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                                                        <input type="text" className="w-full bg-[#0d1a26] border border-white/10 rounded-2xl py-4 px-6 text-sm" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej. Urna Clasica" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio</label>
                                                            <input type="number" className="w-full bg-[#0d1a26] border border-white/10 rounded-2xl py-4 px-6 text-sm" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock</label>
                                                            <input type="number" className="w-full bg-[#0d1a26] border border-white/10 rounded-2xl py-4 px-6 text-sm" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" />
                                                        </div>
                                                    </div>
                                                    <button onClick={async () => {
                                                        const res = await fetch('/api/products', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify(newProduct)
                                                        });
                                                        if (res.ok) {
                                                            fetchProducts();
                                                            setShowNewProduct(false);
                                                            setNewProduct({ name: "", price: "", stock: "", category: "ACCESSORY" });
                                                        }
                                                    }} className="w-full py-4 bg-brand-gold-500 text-black font-black rounded-2xl mt-4 uppercase tracking-[0.2em] text-xs">Guardar Inventario</button>
                                                </div>
                                            </motion.div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "sucursales" && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold mb-2">Gestión de Sucursales</h2>
                                            <p className="text-slate-500 text-xs text-balance">
                                                Administra las sedes del crematorio. Cada sucursal tiene sus propios usuarios,
                                                conductores e inventario.
                                            </p>
                                        </div>
                                        <a href="/config/sucursales" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                            <Building2 size={18} /> Administrar Sucursales
                                        </a>
                                    </div>
                                    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[300px] text-center">
                                        <Building2 size={48} className="text-brand-gold-500 mb-4 opacity-50" />
                                        <h3 className="font-bold text-lg mb-2">Multi-Sucursal</h3>
                                        <p className="text-sm text-slate-400 max-w-sm mb-6">
                                            Crea y gestiona múltiples sedes. Cada gerente de sucursal solo verá
                                            las operaciones e inventario de su sede.
                                        </p>
                                        <a href="/config/sucursales" className="text-brand-gold-500 font-bold text-sm tracking-widest uppercase hover:underline">
                                            Ir a Sucursales →
                                        </a>
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
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-colors"
                                                onChange={(e) => setSystem({ ...system, appName: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Razón Social Legal</label>
                                                <input
                                                    value={system.legalName}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-colors"
                                                    onChange={(e) => setSystem({ ...system, legalName: e.target.value })}
                                                    placeholder="Ej. Aura Mascotas S.A."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Representante Legal (Firma)</label>
                                                <input
                                                    value={system.legalRepresentative}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-colors"
                                                    onChange={(e) => setSystem({ ...system, legalRepresentative: e.target.value })}
                                                    placeholder="Nombre de quien firma contratos"
                                                />
                                            </div>
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

                                    {/* ── Fondo de Pantalla ───────────────────────── */}
                                    <div className="pt-8 border-t border-white/[0.06]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <ImageIcon size={16} className="text-brand-gold-500" />
                                            <h2 className="text-base font-bold text-slate-200">Fondo de Pantalla</h2>
                                        </div>
                                        <p className="text-[11px] text-slate-500 mb-6">
                                            Elige una fotografía emocional como fondo. Aparecerá difuminada detrás del sistema, sin afectar la legibilidad.
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                            {BACKGROUNDS.map((bg) => {
                                                const isSelected = system.backgroundId === bg.id;
                                                return (
                                                    <button
                                                        key={bg.id}
                                                        type="button"
                                                        onClick={() => setSystem({ ...system, backgroundId: bg.id })}
                                                        className={`relative group rounded-2xl overflow-hidden aspect-[3/2] transition-all duration-200 ${isSelected
                                                            ? "ring-2 ring-brand-gold-500 shadow-[0_0_20px_rgba(197,160,89,0.35)]"
                                                            : "ring-1 ring-white/10 hover:ring-brand-gold-500/40 hover:shadow-[0_0_12px_rgba(197,160,89,0.2)]"
                                                            }`}
                                                    >
                                                        {/* Thumbnail image or placeholder */}
                                                        {bg.thumb ? (
                                                            <img
                                                                src={bg.thumb}
                                                                alt={bg.label}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#0d1a26] flex items-center justify-center">
                                                                <div className="text-center space-y-1">
                                                                    <div className="text-xl">✦</div>
                                                                    <div className="text-[9px] text-brand-gold-500 font-bold uppercase tracking-widest">Estrellas</div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Dark overlay + label */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                                        <div className="absolute bottom-0 left-0 right-0 p-2">
                                                            <p className="text-[10px] font-bold text-white/90 truncate leading-tight">{bg.label}</p>
                                                        </div>

                                                        {/* Selected checkmark */}
                                                        {isSelected && (
                                                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-gold-500 flex items-center justify-center shadow-lg">
                                                                <Check size={11} className="text-[#0d1a26]" strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-white/10">
                                        <h2 className="text-xl font-bold mb-2 text-brand-gold-500">Herramientas de Desarrollador</h2>
                                        <p className="text-slate-500 text-xs mb-6 max-w-lg">Carga o elimina datos de prueba (Demo) en la base de datos para simular gráficas y listas de uso rápido en la interfaz.</p>

                                        <div className="flex flex-wrap items-center gap-4 p-5 rounded-3xl bg-brand-gold-500/5 border border-brand-gold-500/20 max-w-3xl">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-9 h-9 rounded-2xl bg-brand-gold-500/15 flex items-center justify-center text-brand-gold-400">
                                                    <FlaskConical size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase tracking-widest text-brand-gold-400">Datos Demo</p>
                                                    <p className="text-[10px] text-slate-500 font-bold">
                                                        {demoMsg ? demoMsg : "Cargar 100 usuarios, planes, contratos, veterinarias"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => runDemo("load")}
                                                    disabled={demoLoading}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                                                >
                                                    {demoLoading ? <RefreshCcw size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                                    Cargar Demo
                                                </button>
                                                <button
                                                    onClick={() => runDemo("clear")}
                                                    disabled={demoLoading}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-40"
                                                >
                                                    {demoLoading ? <RefreshCcw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    Borrar Demo
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "templates" && (
                                <div className="space-y-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold mb-2">Editor de Contratos</h2>
                                            <p className="text-slate-500 text-xs text-balance">
                                                Crea plantillas dinámicas usando variables mágicas que se llenarán solas al
                                                momento de hacer una venta (ej. {"{{CLIENTE_NOMBRE}}"}).
                                            </p>
                                        </div>
                                        <a href="/config/templates" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                            <FileText size={18} /> Abrir Gestor de Plantillas
                                        </a>
                                    </div>
                                    <div className="glass-card rounded-[32px] p-8 border border-white/5 bg-white/5 flex flex-col items-center justify-center min-h-[300px] text-center">
                                        <FileText size={48} className="text-brand-gold-500 mb-4 opacity-50" />
                                        <h3 className="font-bold text-lg mb-2">Módulo Avanzado</h3>
                                        <p className="text-sm text-slate-400 max-w-sm mb-6">
                                            El gestor de plantillas se abre en pantalla completa para que tengas espacio
                                            suficiente para revisar la redacción legal de tus contratos.
                                        </p>
                                        <a href="/config/templates" className="text-brand-gold-500 font-bold text-sm tracking-widest uppercase hover:underline">
                                            Ir al Editor →
                                        </a>
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal: Nuevo Usuario */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-10 rounded-[3rem] border border-white/10 w-full max-w-md shadow-2xl relative"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black italic aura-gradient bg-clip-text text-transparent">Nuevo Usuario</h2>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Acceso al Sistema</p>
                            </div>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="Juan Pérez"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all placeholder:text-slate-700"
                                    placeholder="usuario@aura.lat"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all font-mono tracking-widest"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol</label>
                                <select
                                    className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all appearance-none text-white focus:bg-slate-900"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value, sucursalId: "" })}
                                >
                                    <option value="ADMIN">ADMINISTRADOR</option>
                                    <option value="GERENTE_SUCURSAL">GERENTE SUCURSAL</option>
                                    <option value="OPERADOR">OPERADOR DE HORNO</option>
                                    <option value="VENDEDOR">VENDEDOR / VENTAS</option>
                                    <option value="DRIVER">CONDUCTOR / LOGÍSTICA</option>
                                </select>
                            </div>
                            {(newUser.role === "GERENTE_SUCURSAL" || newUser.role === "OPERADOR" || newUser.role === "DRIVER") && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sucursal</label>
                                    <select
                                        className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all appearance-none text-white focus:bg-slate-900"
                                        value={newUser.sucursalId}
                                        onChange={(e) => setNewUser({ ...newUser, sucursalId: e.target.value })}
                                    >
                                        <option value="">Seleccionar Sucursal</option>
                                        {sucursales.map(s => (
                                            <option key={s.id} value={s.id}>{s.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button onClick={handleAddUser} disabled={loading || !newUser.name || !newUser.email || newUser.password.length < 8} className="flex-1 py-4 rounded-[1.5rem] bg-brand-gold-500 text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-gold-500/20 hover:scale-105 transition-all">
                                {loading ? "Procesando..." : "Crear Usuario"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Modal: Reset Contraseña */}
            {resetPasswordModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-10 rounded-[3rem] border border-white/10 w-full max-w-sm shadow-2xl relative"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                <KeyRound size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold tracking-tight">Nueva Contraseña</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{resetPasswordModal.name}</p>
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña (mín. 8 car.)</label>
                                <input
                                    type="password"
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all font-mono tracking-widest"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setResetPasswordModal(null)} className="flex-1 py-4 rounded-xl bg-white/5 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={loading || newPassword.length < 8}
                                className="flex-2 py-4 px-8 rounded-xl bg-brand-gold-500 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-gold-500/20 hover:scale-105 transition-all"
                            >
                                {loading ? "Guardando..." : "Actualizar"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
