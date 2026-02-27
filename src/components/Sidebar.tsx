"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Dog,
    HeartHandshake,
    TrendingUp,
    MapPin,
    Settings,
    Menu,
    LogOut,
    Wrench
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Clientes", href: "/clientes", icon: Users },
    { name: "Mascotas", href: "/mascotas", icon: Dog },
    { name: "Previsión", href: "/prevision", icon: HeartHandshake },
    { name: "Vendedores", href: "/vendedores", icon: TrendingUp },
    { name: "Operación", href: "/operacion", icon: Wrench },
    { name: "Veterinarias", href: "/veterinarias", icon: MapPin },
    { name: "Configuración", href: "/config", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
    };

    return (
        <div className={cn(
            "relative flex flex-col h-screen transition-all duration-300 glass-card-strong border-r border-white/[0.07]",
            isOpen ? "w-64" : "w-[72px]"
        )}>
            {/* Logo / Brand */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.06]">
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="logo-expanded"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-3 min-w-0"
                        >
                            <div className="w-9 h-9 rounded-xl aura-gradient flex items-center justify-center flex-shrink-0 shadow-[0_4px_14px_rgba(197,160,89,0.35)]">
                                <span className="text-[#0d1a26] text-sm font-black tracking-tight">AF</span>
                            </div>
                            <div className="flex flex-col leading-none min-w-0">
                                <span className="text-[14px] font-black aura-gradient bg-clip-text text-transparent tracking-tight whitespace-nowrap">
                                    Forever Friends
                                </span>
                                <span className="text-[9px] text-brand-gold-600 font-bold tracking-[0.18em] uppercase mt-0.5">
                                    by Airapí
                                </span>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="logo-collapsed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            className="w-9 h-9 rounded-xl aura-gradient flex items-center justify-center shadow-[0_4px_14px_rgba(197,160,89,0.35)]"
                        >
                            <span className="text-[#0d1a26] text-sm font-black tracking-tight">AF</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-1.5 hover:bg-white/[0.07] rounded-lg transition-colors text-slate-500 hover:text-brand-gold-500 flex-shrink-0"
                    title={isOpen ? "Colapsar menú" : "Expandir menú"}
                >
                    <Menu size={18} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={!isOpen ? item.name : undefined}
                            className={cn(
                                "flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                isActive
                                    ? "bg-brand-gold-600/15 text-brand-gold-400 shadow-[0_0_0_1px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.05)]"
                                    : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-300"
                            )}
                        >
                            <item.icon
                                size={20}
                                className={cn(
                                    "flex-shrink-0 transition-colors",
                                    isActive ? "text-brand-gold-500" : "group-hover:text-slate-200"
                                )}
                            />
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-semibold text-sm truncate"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-gold-500 rounded-r-full"
                                    style={{
                                        boxShadow: "0 0 8px rgba(197, 160, 89, 0.7), 0 0 20px rgba(197, 160, 89, 0.3)"
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Footer */}
            <div className="px-3 pb-4 pt-3 border-t border-white/[0.06]">
                <div className={cn(
                    "flex items-center gap-3 p-2 rounded-2xl transition-colors",
                    isOpen && "hover:bg-white/[0.04]"
                )}>
                    <div className="w-9 h-9 rounded-xl aura-gradient p-[1.5px] shadow-[0_2px_8px_rgba(197,160,89,0.2)] flex-shrink-0">
                        <div className="w-full h-full rounded-[10px] bg-bg-deep flex items-center justify-center font-black text-brand-gold-500 text-sm">
                            U
                        </div>
                    </div>

                    {isOpen && (
                        <>
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-200 truncate">Usuario Demo</span>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Administrador</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
