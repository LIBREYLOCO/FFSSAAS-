"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Stethoscope, Heart, Info } from "lucide-react";
import RegisterVeterinaryModal from "@/components/RegisterVeterinaryModal";
import EditVeterinaryModal from "@/components/EditVeterinaryModal";
import VetCommissionReportModal from "@/components/VetCommissionReportModal";

export default function VeterinariasPage() {
    const [veterinaries, setVeterinaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVet, setEditingVet] = useState<any | null>(null);
    const [reportVetId, setReportVetId] = useState<string | null>(null);
    const [globalReportMode, setGlobalReportMode] = useState(false);

    const fetchVeterinaries = () => {
        setLoading(true);
        fetch("/api/veterinarias")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setVeterinaries(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch veterinaries error:", err);
                setVeterinaries([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchVeterinaries();
    }, []);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Red de Veterinarias</h2>
                    <p className="text-slate-400">Convenios con clínicas y especialistas locales.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setGlobalReportMode(true)}
                        className="btn-secondary flex items-center gap-2 w-fit"
                    >
                        Reporte Global de Comisiones
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus size={20} />
                        Nueva Veterinaria
                    </button>
                </div>
            </header>

            <RegisterVeterinaryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchVeterinaries}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="glass-card h-48 rounded-3xl animate-pulse" />
                    ))
                ) : veterinaries.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <Stethoscope className="text-slate-600" />
                        </div>
                        <p className="text-slate-500">No hay veterinarias registradas.</p>
                    </div>
                ) : (
                    veterinaries.map((vet) => (
                        <motion.div
                            key={vet.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 rounded-3xl relative overflow-hidden group border-l-4 border-l-brand-gold-500"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-brand-gold-600/10 flex items-center justify-center text-brand-gold-500">
                                    <Stethoscope size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-brand-gold-500">{vet.name}</h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                                        <MapPin size={10} /> <span>Ubicación registrada</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <Heart size={16} className="text-brand-gold-500" />
                                        <span>Mascotas Referidas</span>
                                    </div>
                                    <span className="text-lg font-bold">{vet._count?.referredPets || 0}</span>
                                </div>

                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                                        <DollarSign size={16} className="text-brand-gold-100" />
                                        <span>Fijo por Rec.</span>
                                    </div>
                                    <span className="text-lg font-bold">${vet.fixedFee}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 flex gap-2">
                                <button
                                    onClick={() => setEditingVet(vet)}
                                    className="flex-1 py-3 rounded-xl bg-brand-gold-600/10 hover:bg-brand-gold-600/20 transition-colors text-xs font-bold uppercase tracking-widest text-brand-gold-500"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => setReportVetId(vet.id)}
                                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-slate-300"
                                >
                                    Ver Comisiones
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <EditVeterinaryModal
                isOpen={!!editingVet}
                onClose={() => setEditingVet(null)}
                onSuccess={fetchVeterinaries}
                vet={editingVet}
            />

            {(reportVetId || globalReportMode) && (
                <VetCommissionReportModal
                    isOpen={true}
                    onClose={() => { setReportVetId(null); setGlobalReportMode(false); }}
                    vetId={reportVetId}
                />
            )}
        </div>
    );
}

function DollarSign({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    );
}
