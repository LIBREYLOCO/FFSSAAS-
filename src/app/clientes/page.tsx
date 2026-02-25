"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Search, Dog, Plus, Phone, Mail } from "lucide-react";
import Link from "next/link";
import RegisterClientModal from "@/components/RegisterClientModal";

export default function ClientesPage() {
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchOwners = () => {
        setLoading(true);
        fetch("/api/owners")
            .then(res => res.json())
            .then(data => {
                setOwners(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setOwners([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Gestión de Clientes</h2>
                    <p className="text-slate-400">Administra dueños y sus historias de servicio.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </header>

            <RegisterClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchOwners}
            />

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, teléfono o email..."
                    className="bg-transparent border-none outline-none flex-1 text-slate-200 placeholder:text-slate-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="glass-card h-48 rounded-3xl animate-pulse" />
                    ))
                ) : (
                    owners.length === 0 ? (
                        <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                <User className="text-slate-600" />
                            </div>
                            <p className="text-slate-500">No hay clientes registrados aún.</p>
                        </div>
                    ) : (
                        owners.map((owner) => (
                            <Link
                                key={owner.id}
                                href={`/clientes/${owner.id}`}
                                className="glass-card p-6 rounded-3xl hover:border-brand-gold-500/50 transition-colors group cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-gold-600/20 flex items-center justify-center text-brand-gold-500">
                                        <User size={24} />
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
                                        {owner.contracts?.length > 0 && (
                                            <span className="bg-brand-gold-500/10 text-brand-gold-500 py-1 px-2 rounded-lg border border-brand-gold-500/20">
                                                Previsión
                                            </span>
                                        )}
                                        {owner.serviceOrders?.length > 0 && (
                                            <span className="bg-accent-500/10 text-accent-500 py-1 px-2 rounded-lg border border-accent-500/20">
                                                Inmediato
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-bold group-hover:text-brand-gold-500 transition-colors">
                                            {owner.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                            <Dog size={14} />
                                            <span>{owner._count?.pets || 0} Mascotas registradas</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 text-sm text-slate-400">
                                        {owner.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-slate-500" />
                                                <span>{owner.phone}</span>
                                            </div>
                                        )}
                                        {owner.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-slate-500" />
                                                <span>{owner.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                                        <button className="text-xs font-semibold uppercase tracking-widest text-brand-gold-500 hover:text-brand-gold-400 transition-colors">
                                            Ver Detalles →
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
