"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, DollarSign, FileText, CheckCircle2, Clock, ChevronDown, ChevronUp, User, Loader2 } from "lucide-react";
import { formatMXN } from "@/lib/format";

interface CommissionReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    personId: string | null;
}

export default function CommissionReportModal({ isOpen, onClose, personId }: CommissionReportModalProps) {
    const [loading, setLoading] = useState(false);
    const [person, setPerson] = useState<any>(null);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchPerson = () => {
        if (!personId) return;
        setLoading(true);
        fetch(`/api/vendedores/${personId}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { setPerson(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (isOpen && personId) {
            fetchPerson();
        }
    }, [isOpen, personId]);

    const handleMarkAsPaid = async (commissionId: string) => {
        setUpdatingId(commissionId);
        try {
            const res = await fetch("/api/commissions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commissionId, status: "PAID" })
            });
            if (res.ok) {
                fetchPerson();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setUpdatingId(null);
        }
    };

    if (!isOpen) return null;

    // Actual commissions from DB
    const commissions = person?.commissions || [];
    const totalGenerated = commissions.reduce((acc: number, c: any) => acc + Number(c.amount), 0);
    const totalPaid = commissions.filter((c: any) => c.status === "PAID").reduce((acc: number, c: any) => acc + Number(c.amount), 0);
    const totalPending = totalGenerated - totalPaid;

    const levelColor: Record<string, string> = {
        JUNIOR: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        SENIOR: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        EXPERT: "text-brand-gold-500 bg-brand-gold-500/10 border-brand-gold-500/20",
        MASTER: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card w-full max-w-2xl rounded-[40px] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 glass-card px-8 pt-8 pb-5 rounded-t-[40px] border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 overflow-hidden flex items-center justify-center">
                                    {person?.photoUrl ? (
                                        <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={28} className="text-brand-gold-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{loading && !person ? "Cargando…" : (person?.name ?? "Vendedor")}</h2>
                                    {person && (
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${levelColor[person.level] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
                                            {person.level}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {loading && !person ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-brand-gold-500/30 border-t-brand-gold-500 rounded-full animate-spin" />
                        </div>
                    ) : person ? (
                        <div className="px-8 py-6 space-y-6">
                            {/* KPI cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total Generado</p>
                                    <p className="text-lg font-black text-brand-gold-500">{formatMXN(totalGenerated)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-500/70 uppercase">Pagado</p>
                                    <p className="text-xl font-black text-emerald-400">{formatMXN(totalPaid)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-brand-gold-500 uppercase">Pendiente</p>
                                    <p className="text-xl font-black text-brand-gold-500">{formatMXN(totalPending)}</p>
                                </div>
                            </div>

                            {/* Commissions list */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <DollarSign size={16} className="text-brand-gold-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">Detalle de Comisiones de Previsión</span>
                                </div>

                                {commissions.length === 0 ? (
                                    <div className="py-12 text-center text-slate-500 glass-card rounded-3xl">
                                        <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm font-bold">No hay comisiones de previsión registradas.</p>
                                    </div>
                                ) : commissions.map((c: any) => {
                                    const isExpanded = expanded === c.id;
                                    const isPaid = c.status === "PAID";

                                    return (
                                        <div key={c.id} className="rounded-3xl bg-white/5 border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : c.id)}
                                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className={`p-2 rounded-xl ${isPaid ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-gold-500/10 text-brand-gold-500"}`}>
                                                        {isPaid ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{c.contract?.owner?.name ?? "Cliente"}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{c.contract?.plan?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Monto</p>
                                                        <p className={`text-sm font-black ${isPaid ? "text-emerald-400" : "text-brand-gold-500"}`}>{formatMXN(c.amount)}</p>
                                                    </div>
                                                    {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="border-t border-white/5"
                                                    >
                                                        <div className="p-5 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                                                <div>
                                                                    <p className="text-slate-500 uppercase font-bold">Pago de Cliente</p>
                                                                    <p className="text-white font-bold">{formatMXN(c.payment?.amount)} ({c.payment?.type})</p>
                                                                    <p className="text-slate-500 mt-1">{new Date(c.payment?.paymentDate || c.createdAt).toLocaleDateString("es-MX")}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-slate-500 uppercase font-bold">Estatus Comisión</p>
                                                                    <span className={`inline-block px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-[9px] mt-1 ${isPaid ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-gold-500/10 text-brand-gold-500"}`}>
                                                                        {isPaid ? "Pagada" : "Pendiente"}
                                                                    </span>
                                                                    {c.paidAt && <p className="text-slate-500 mt-1">Pagada el: {new Date(c.paidAt).toLocaleDateString("es-MX")}</p>}
                                                                </div>
                                                            </div>

                                                            {!isPaid && (
                                                                <button
                                                                    disabled={updatingId === c.id}
                                                                    onClick={(e) => { e.stopPropagation(); handleMarkAsPaid(c.id); }}
                                                                    className="w-full py-3 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                                                                >
                                                                    {updatingId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                                                    Marcar como Pagada
                                                                </button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 py-16">No se pudo cargar la información.</p>
                    )}

                    <div className="px-8 pb-8 pt-4">
                        <button onClick={onClose}
                            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold uppercase tracking-widest transition-all">
                            Cerrar
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
