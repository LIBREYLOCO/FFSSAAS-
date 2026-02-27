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
} from "lucide-react";

const TABS = [
    { id: "users", label: "Usuarios & Roles", icon: Users },
    { id: "pricing", label: "Precios & Tabuladores", icon: DollarSign },
    { id: "sucursales", label: "Sucursales", icon: Building2 },
    { id: "system", label: "Sistema & Marca", icon: Settings },
    { id: "templates", label: "Plantillas de Contratos", icon: FileText },
    { id: "security", label: "Seguridad", icon: Shield },
];

export default function ConfigPage() {
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState<{ id: string; name: string } | null>(null);
    const [newPassword, setNewPassword] = useState("");

    // State for real data from API
    const [users, setUsers] = useState<any[]>([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "VENDEDOR" });

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
        allowPublicTracking: true,
    });

    const [demoLoading, setDemoLoading] = useState(false);
    const [demoMsg, setDemoMsg] = useState("");

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
                setSystem(data);
            }
        } catch (error) {
            console.error("Error fetching system config:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSystemConfig();
    }, []);

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
                setNewUser({ name: "", email: "", password: "", role: "VENDEDOR" });
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
            // Guardar configuración del sistema (sólo estamos enfocándonos en "system" por ahora)
            const res = await fetch("/api/system-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(system),
            });
            if (res.ok) {
                alert("Configuración de marca y contratos guardada exitosamente.");
            } else {
                alert("Hubo un error al guardar la configuración.");
            }
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Error de conexión al guardar.");
        } finally {
            setLoading(false);
        }
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
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Selector de rol */}
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                        className={`text-[10px] font-black px-3 py-1.5 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-all ${
                                                            user.role === "ADMIN"
                                                                ? "bg-brand-gold-500/10 border-brand-gold-500/20 text-brand-gold-500"
                                                                : user.role === "DRIVER"
                                                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                        }`}
                                                    >
                                                        <option value="ADMIN">ADMIN</option>
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
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
            {/* Modal: Nuevo Usuario */}
            {isAddUserModalOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card p-8 rounded-[48px] border border-white/10 w-full max-w-md shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">Nuevo Usuario</h2>
                            <button onClick={() => setIsAddUserModalOpen(false)} className="p-2 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all"
                                    placeholder="Juan Pérez"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all"
                                    placeholder="usuario@aura.lat"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Inicial (mín. 8 caracteres)</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all font-mono tracking-widest"
                                    placeholder="••••••••"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol de Acceso</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all appearance-none"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="ADMIN">Administrador — Acceso total</option>
                                    <option value="VENDEDOR">Vendedor — Ventas y previsión</option>
                                    <option value="DRIVER">Driver — Logística y rutas</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => setIsAddUserModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={loading || !newUser.name || !newUser.email || newUser.password.length < 8}
                                className="flex-1 py-4 rounded-2xl bg-brand-gold-500 text-black font-black text-sm uppercase tracking-widest shadow-lg disabled:opacity-40 hover:bg-brand-gold-400 transition-all"
                            >
                                {loading ? "Creando..." : "Crear Acceso"}
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
                        className="glass-card p-8 rounded-[48px] border border-white/10 w-full max-w-sm shadow-2xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                <KeyRound size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Nueva Contraseña</h2>
                                <p className="text-xs text-slate-500">{resetPasswordModal.name}</p>
                            </div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña (mín. 8 caracteres)</label>
                            <input
                                type="password"
                                autoFocus
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 transition-all font-mono tracking-widest"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setResetPasswordModal(null)} className="flex-1 py-4 rounded-2xl bg-white/5 font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={loading || newPassword.length < 8}
                                className="flex-1 py-4 rounded-2xl bg-brand-gold-500 text-black font-black text-sm uppercase tracking-widest disabled:opacity-40 hover:bg-brand-gold-400 transition-all"
                            >
                                {loading ? "Guardando..." : "Cambiar"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
