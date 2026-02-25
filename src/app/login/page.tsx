"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });

            if (res.ok) {
                router.push("/");
            } else {
                const data = await res.json();
                alert(data.message || "Error al iniciar sesión. Por favor verifica los datos.");
            }
        } catch (error) {
            alert("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{
                    backgroundImage: "url('/login-bg.png')",
                    filter: "brightness(0.4) saturate(1.2)"
                }}
            />

            {/* Animated Light Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-gold-500/20 blur-[120px] rounded-full z-0"
            />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-md px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Brand Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 mb-6 shadow-2xl"
                        >
                            <Heart className="text-brand-gold-500" size={40} fill="currentColor" fillOpacity={0.1} />
                        </motion.div>
                        <h1 className="text-4xl font-black italic aura-gradient bg-clip-text text-transparent tracking-tighter mb-2">
                            FOREVER FRIENDS
                        </h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                            by Airapí • Memorial System
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="glass-card p-8 rounded-[48px] border border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Acceso Directo</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Portal de Administración</p>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Correo Electrónico</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-gold-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@aura.lat"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-gold-500 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold focus:outline-none focus:border-brand-gold-500/50 focus:bg-white/10 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-brand-gold-500 hover:bg-brand-gold-400 text-black font-black rounded-2xl transition-all shadow-[0_8px_32px_rgba(212,175,55,0.3)] hover:shadow-[0_12px_48_rgba(212,175,55,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 uppercase tracking-widest text-xs"
                            >
                                {loading ? "Iniciando..." : <span>Entrar al Sistema <ArrowRight size={16} className="inline ml-1" /></span>}
                            </button>


                        </form>
                    </div>

                    <p className="text-center mt-8 text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
                        Acceso exclusivo para personal autorizado.<br />
                        © 2026 Aura Crematorio & Previsión.
                    </p>
                </motion.div>
            </div>

            {/* Bottom Gradient Decor */}
            <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-black to-transparent z-0 opacity-80" />
        </div>
    );
}
