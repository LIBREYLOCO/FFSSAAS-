"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, FileText, Download, BarChart2, Loader2, Hospital, Building2 } from "lucide-react";
import { formatMXN } from "@/lib/format";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    vetId: string | null; // if null, it's global mode
}

interface ReferralDetail {
    id: string;
    petName: string;
    ownerName: string;
    status: string;
    createdAt: string;
    commissionEarned: number;
    hasActiveContract: boolean;
    paidAmount: number;
}

interface VetReport {
    id: string;
    name: string;
    fixedFee: number;
    totalReferrals: number;
    totalCommission: number;
    currentMonthCommission: number;
    referralsDetail: ReferralDetail[];
    referredPets: {
        id: string;
        name: string;
        species: string;
        deathDate: string | null;
        createdAt: string;
        owner: { name: string } | null;
    }[];
}

export default function VetCommissionReportModal({ isOpen, onClose, vetId }: Props) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<VetReport[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedVetId, setExpandedVetId] = useState<string | null>(null);

    // Filters
    const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const isGlobal = !vetId;

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        const url = isGlobal ? "/api/veterinarias/commissions" : `/api/veterinarias/commissions?vetId=${vetId}`;

        fetch(url)
            .then(res => res.json())
            .then(resData => {
                setData(resData || []);
                if (!isGlobal && resData?.length === 1) {
                    setExpandedVetId(resData[0].id); // auto-expand if individual
                }
            })
            .catch(err => console.error("Error fetching vet commissions", err))
            .finally(() => setLoading(false));

    }, [isOpen, vetId, isGlobal]);

    if (!isOpen) return null;

    // Apply Date Filters
    const processedData = data.map(vet => {
        const filteredReferrals = vet.referralsDetail.filter(ref => {
            const d = new Date(ref.createdAt);
            const refMonth = d.getMonth().toString();
            const refYear = d.getFullYear().toString();

            const matchMonth = selectedMonth === "ALL" || refMonth === selectedMonth;
            const matchYear = selectedYear === "ALL" || refYear === selectedYear;

            return matchMonth && matchYear;
        });

        const filteredPets = vet.referredPets.filter(pet => {
            const d = new Date(pet.createdAt);
            const refMonth = d.getMonth().toString();
            const refYear = d.getFullYear().toString();

            const matchMonth = selectedMonth === "ALL" || refMonth === selectedMonth;
            const matchYear = selectedYear === "ALL" || refYear === selectedYear;

            return matchMonth && matchYear;
        });

        return {
            ...vet,
            totalReferrals: filteredReferrals.length,
            totalCommission: filteredReferrals.reduce((acc, r) => acc + r.commissionEarned, 0),
            referralsDetail: filteredReferrals,
            referredPets: filteredPets
        };
    });

    // Filter by name (global mode) or just display
    const filteredData = processedData.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Global KPIs
    const totalCommissionsAll = processedData.reduce((acc, v) => acc + v.totalCommission, 0);
    const totalReferralsAll = processedData.reduce((acc, v) => acc + v.totalReferrals, 0);
    const activeClinics = processedData.filter(v => v.totalReferrals > 0).length;

    const availableYears = Array.from(new Set(
        data.flatMap(v => v.referralsDetail.map(r => new Date(r.createdAt).getFullYear().toString()))
    )).sort((a, b) => Number(b) - Number(a)); // Descending

    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const toggleExpand = (id: string) => {
        if (expandedVetId === id) setExpandedVetId(null);
        else setExpandedVetId(id);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-5xl max-h-[90vh] bg-[#0E121B] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 p-6 sm:p-8 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 border border-brand-gold-500/20 shadow-[0_0_30px_rgba(197,160,89,0.1)]">
                                {isGlobal ? <Building2 size={28} /> : <Hospital size={28} />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">
                                    {isGlobal ? "Reporte Global de Comisiones" : "Comisiones por Veterinaria"}
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    {isGlobal ? "Rendimiento y pagos fijos de la red de clínicas aliadas" : "Detalle de referencias y pagos generados por la clínica"}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-10 h-10 animate-spin text-brand-gold-500" />
                                <p className="text-slate-400 animate-pulse text-sm">Calculando comisiones de la red...</p>
                            </div>
                        ) : (
                            <>
                                {/* KPIs */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                                                <FileText size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-400">Total Referencias</span>
                                        </div>
                                        <div className="text-3xl font-black">{totalReferralsAll}</div>
                                    </div>
                                    <div className="glass-card p-6 rounded-3xl">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                                                <BarChart2 size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-400">{isGlobal ? "Clínicas Activas" : "Promedio (n/a)"}</span>
                                        </div>
                                        <div className="text-3xl font-black">{isGlobal ? activeClinics : "-"}</div>
                                    </div>
                                    <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-brand-gold-500/5 group-hover:bg-brand-gold-500/10 transition-colors" />
                                        <div className="relative">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 rounded-xl bg-brand-gold-500/20 text-brand-gold-400">
                                                    <Download size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-brand-gold-500">Total Comisiones</span>
                                            </div>
                                            <div className="text-3xl font-black text-brand-gold-500">
                                                {formatMXN(totalCommissionsAll)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Filters Block */}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    {isGlobal && (
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="text"
                                                placeholder="Buscar veterinaria..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-brand-gold-500/50 transition-colors"
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-1 gap-2">
                                        <select
                                            value={selectedMonth}
                                            onChange={e => setSelectedMonth(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-brand-gold-500/50 transition-colors text-slate-200"
                                        >
                                            <option value="ALL">Mes: Todos</option>
                                            {months.map((m, i) => (
                                                <option key={i} value={i.toString()}>{m}</option>
                                            ))}
                                        </select>

                                        <select
                                            value={selectedYear}
                                            onChange={e => setSelectedYear(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-brand-gold-500/50 transition-colors text-slate-200"
                                        >
                                            <option value="ALL">Año: Todos</option>
                                            {availableYears.map(y => (
                                                <option key={y} value={y}>{y}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Vet List */}
                                <div className="space-y-4">
                                    {filteredData.length === 0 ? (
                                        <div className="text-center py-10 bg-white/5 rounded-3xl border border-white/5">
                                            <p className="text-slate-500">No se encontraron datos.</p>
                                        </div>
                                    ) : (
                                        filteredData.map(vet => (
                                            <div key={vet.id} className="glass-card rounded-3xl overflow-hidden border border-white/5">
                                                {/* Vet Summary Header */}
                                                <button
                                                    onClick={() => toggleExpand(vet.id)}
                                                    className="w-full flex flex-col md:flex-row md:items-center justify-between p-5 sm:p-6 hover:bg-white/[0.02] transition-colors text-left gap-4"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                                                            <Hospital size={20} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg">{vet.name}</h3>
                                                            <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">
                                                                Tarifa Fija: <span className="text-brand-gold-500">{formatMXN(vet.fixedFee)}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Comisión del Periodo</p>
                                                            <p className="font-bold text-brand-gold-500">{formatMXN(vet.totalCommission)}</p>
                                                        </div>
                                                        <div className="text-right hidden sm:block">
                                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Servicios (Completos)</p>
                                                            <p className="font-bold">{vet.totalReferrals}</p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Referrals Expansion */}
                                                <AnimatePresence>
                                                    {expandedVetId === vet.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="p-5 sm:p-6 bg-black/40 border-t border-white/5 space-y-3">
                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 mt-8">Historial de Mascotas Referidas por la Clínica</h4>

                                                                {(!vet.referredPets || vet.referredPets.length === 0) ? (
                                                                    <p className="text-sm text-slate-500 italic">No hay mascotas referidas por esta clínica aún.</p>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {vet.referredPets.map((pet) => (
                                                                            <div key={pet.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3 mb-1">
                                                                                        <p className="font-bold text-sm">{pet.name}</p>
                                                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${pet.deathDate ? 'bg-brand-gold-500/10 text-brand-gold-400 border border-brand-gold-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                                                            {pet.deathDate ? 'En Memoria' : 'Viva'}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-xs text-slate-500">Tutor: {pet.owner?.name || 'Incompleto'} • Registrada el {new Date(pet.createdAt).toLocaleDateString()}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 mt-8">Detalle de Comisiones (Servicios Completados)</h4>

                                                                {/* Optional details per service */}
                                                                {vet.referralsDetail.length === 0 ? (
                                                                    <p className="text-sm text-slate-500 italic">No hay referencias con comisión (completadas) para esta clínica.</p>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {vet.referralsDetail.map((ref: any) => (
                                                                            <div key={ref.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 gap-4">
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center gap-3 mb-1">
                                                                                        <p className="font-bold text-sm">{ref.petName}</p>
                                                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ref.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                                                            {ref.status}
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-xs text-slate-500">Tutor: {ref.ownerName} • Servicio {new Date(ref.createdAt).toLocaleDateString()}</p>
                                                                                </div>
                                                                                <div className="flex flex-col sm:items-end flex-shrink-0">
                                                                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Comisión Generada</p>
                                                                                    <p className="text-brand-gold-500 font-bold text-lg">{formatMXN(ref.commissionEarned)}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
