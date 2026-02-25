"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

export default function TrackingSearch() {
    const [folio, setFolio] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!folio.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/tracking/${folio}`);
            if (res.ok) {
                router.push(`/seguimiento/${folio}`);
            } else {
                setError("No se encontró ninguna orden con ese folio.");
            }
        } catch (err) {
            setError("Error al buscar la orden. Intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md space-y-8 text-center"
            >
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent italic">
                        PASEO DEL AMIGO
                    </h1>
                    <p className="text-brand-gold-500/80 text-xs font-bold tracking-[0.3em] uppercase">
                        Aura • Seguimiento Ritual
                    </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Ingrese Folio o ID"
                            value={folio}
                            onChange={(e) => setFolio(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xl text-center font-bold tracking-wider focus:outline-none focus:border-brand-gold-500/50 transition-all"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm font-bold bg-red-400/10 py-2 rounded-xl border border-red-400/20">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-gold-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-gold-400 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                        CONSULTAR ESTADO
                    </button>
                </form>

                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest pt-10">
                    Proporcionado por Airapí • Homenajes con Dignidad
                </p>
            </motion.div>
        </div>
    );
}
