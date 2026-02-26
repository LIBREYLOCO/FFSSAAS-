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
    X,
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
            "relative flex flex-col h-screen transition-all duration-300 glass-card border-r border-white/10",
            isOpen ? "w-64" : "w-20"
        )}>
            <div className="flex items-center justify-between p-6">
                <AnimatePresence mode="wait">
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col"
                        >
                            <h1 className="text-xl font-black aura-gradient bg-clip-text text-transparent leading-tight -mb-1">
                                FOREVER
                            </h1>
                            <h1 className="text-xl font-black aura-gradient bg-clip-text text-transparent leading-tight">
                                FRIENDS
                            </h1>
                            <span className="text-[7px] text-brand-gold-500 font-bold tracking-[0.2em] uppercase mt-1">
                                by Airapí
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-brand-gold-500"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-brand-gold-600/20 text-brand-gold-500 border border-brand-gold-500/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={22} className={cn(
                                "transition-colors",
                                isActive ? "text-brand-gold-500" : "group-hover:text-white"
                            )} />
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="font-medium"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute left-0 w-1 h-6 bg-brand-gold-500 rounded-r-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full aura-gradient p-[2px]">
                        <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center font-bold">
                            U
                        </div>
                    </div>
                    {isOpen && (
                        <div className="flex flex-col flex-1">
                            <span className="text-sm font-semibold">Usuario Demo</span>
                            <span className="text-xs text-slate-500">Administrador</span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
