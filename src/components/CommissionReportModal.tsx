"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, DollarSign, FileText, CheckCircle2, Clock, ChevronDown, ChevronUp, User } from "lucide-react";
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

    useEffect(() => {
        if (isOpen && personId) {
            setLoading(true);
            fetch(`/api/vendedores/${personId}`)
                .then(r => r.ok ? r.json() : null)
                .then(data => { setPerson(data); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [isOpen, personId]);

    if (!isOpen) return null;

    const commissionRate = person ? Number(person.commissionRate) / 100 : 0;

    // Summarize all contracts
    const contracts = person?.contracts || [];
    const totalSales = contracts.reduce((acc: number, c: any) => acc + Number(c.plan?.price ?? 0), 0);
    const totalPaidByClients = contracts.reduce((acc: number, c: any) =>
        acc + (c.payments ?? []).reduce((s: number, p: any) => s + (p.status === "PAID" ? Number(p.amount) : 0), 0), 0);
    const totalCommission = totalPaidByClients * commissionRate;

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
                                {/* Avatar */}
                                <div className="w-14 h-14 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 overflow-hidden flex items-center justify-center">
                                    {person?.photoUrl ? (
                                        <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={28} className="text-brand-gold-500" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{loading ? "Cargando…" : (person?.name ?? "Vendedor")}</h2>
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

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-brand-gold-500/30 border-t-brand-gold-500 rounded-full animate-spin" />
                        </div>
                    ) : person ? (
                        <div className="px-8 py-6 space-y-6">
                            {/* KPI cards */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Contratos</p>
                                    <p className="text-2xl font-black">{contracts.length}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Total en Ventas</p>
                                    <p className="text-lg font-black text-brand-gold-500">{formatMXN(totalSales)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                                    <p className="text-[10px] font-bold text-emerald-500/70 uppercase">Comisión Generada</p>
                                    <p className="text-lg font-black text-emerald-400">{formatMXN(totalCommission)}</p>
                                    <p className="text-[9px] text-emerald-500/60 font-bold">{(commissionRate * 100).toFixed(1)}% de lo cobrado</p>
                                </div>
                            </div>

                            {/* Contracts list */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <FileText size={16} className="text-brand-gold-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">Detalle por Contrato</span>
                                </div>

                                {contracts.length === 0 ? (
                                    <div className="py-12 text-center text-slate-500 glass-card rounded-3xl">
                                        <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
                                        <p className="text-sm font-bold">Sin contratos asignados aún</p>
                                    </div>
                                ) : contracts.map((contract: any) => {
                                    const paidAmt = (contract.payments ?? []).reduce((s: number, p: any) =>
                                        s + (p.status === "PAID" ? Number(p.amount) : 0), 0);
                                    const planPrice = Number(contract.plan?.price ?? 0);
                                    const progress = planPrice > 0 ? Math.min(100, (paidAmt / planPrice) * 100) : 0;
                                    const commissionEarned = paidAmt * commissionRate;
                                    const isExpanded = expanded === contract.id;

                                    return (
                                        <div key={contract.id} className="rounded-3xl bg-white/5 border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => setExpanded(isExpanded ? null : contract.id)}
                                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <div className={`p-2 rounded-xl ${contract.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>
                                                        {contract.status === "ACTIVE" ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">{contract.owner?.name ?? "—"}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{contract.plan?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Comisión</p>
                                                        <p className="text-sm font-black text-emerald-400">{formatMXN(commissionEarned)}</p>
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
                                                            {/* Progress bar */}
                                                            <div className="space-y-1">
                                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                                                                    <span>Cobrado</span>
                                                                    <span>{Math.round(progress)}%</span>
                                                                </div>
                                                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${progress}%` }}
                                                                        className="h-full bg-brand-gold-500"
                                                                    />
                                                                </div>
                                                                <div className="flex justify-between text-[10px] text-slate-500">
                                                                    <span>Cobrado: {formatMXN(paidAmt)}</span>
                                                                    <span>Total plan: {formatMXN(planPrice)}</span>
                                                                </div>
                                                            </div>

                                                            {/* Payment rows */}
                                                            {contract.payments?.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase">Pagos registrados</p>
                                                                    {contract.payments.map((p: any) => (
                                                                        <div key={p.id} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                                                                            <div>
                                                                                <span className="font-bold">{p.type === "DOWN_PAYMENT" ? "Enganche" : "Mensualidad"}</span>
                                                                                <span className="text-slate-500 ml-2">{new Date(p.createdAt || p.paymentDate).toLocaleDateString("es-MX")}</span>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="font-bold text-emerald-400">{formatMXN(p.amount)}</p>
                                                                                <p className="text-[9px] text-slate-500">Comisión: {formatMXN(Number(p.amount) * commissionRate)}</p>
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
                                    );
                                })}
                            </div>

                            {/* Summary total */}
                            {contracts.length > 0 && (
                                <div className="p-5 rounded-3xl bg-brand-gold-500/10 border border-brand-gold-500/20 flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] font-black text-brand-gold-500 uppercase tracking-widest">Total a Pagar</p>
                                        <p className="text-2xl font-black">{formatMXN(totalCommission)}</p>
                                        <p className="text-[10px] text-slate-400">sobre {formatMXN(totalPaidByClients)} cobrado</p>
                                    </div>
                                    <DollarSign size={48} className="text-brand-gold-500/20" />
                                </div>
                            )}
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
