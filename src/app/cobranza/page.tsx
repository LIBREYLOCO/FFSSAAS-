"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DollarSign, RefreshCw, Loader2, HeartHandshake, Wrench,
    Phone, CheckCircle2, ChevronDown, ChevronUp, X,
} from "lucide-react";

function fmt$(n: number) {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

function PayQuickModal({
    item, type, onClose, onSuccess,
}: {
    item: any;
    type: "contract" | "order";
    onClose: () => void;
    onSuccess: () => void;
}) {
    const max = type === "contract" ? item.remainingBalance : item.balanceDue;
    const suggested = type === "contract" ? item.installmentAmount : item.balanceDue;
    const [amount, setAmount] = useState(Math.min(suggested, max));
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (amount <= 0 || amount > max) return;
        setLoading(true);
        try {
            if (type === "contract") {
                const res = await fetch("/api/prevision/payments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contractId: item.id, amount, type: "INSTALLMENT" }),
                });
                if (res.ok) { onSuccess(); onClose(); }
                else { const d = await res.json(); alert(d.error || "Error al registrar pago"); }
            } else {
                const res = await fetch(`/api/service-orders/${item.id}/payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount }),
                });
                if (res.ok) { onSuccess(); onClose(); }
                else { const d = await res.json(); alert(d.error || "Error al registrar pago"); }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                className="glass-card w-full max-w-sm rounded-3xl p-7 space-y-5"
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-black text-white">Registrar Cobro</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-bold">{item.owner.name}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
                        <span>{type === "contract" ? "Plan" : "Servicio"}</span>
                        <span>Saldo Pendiente</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-300">{type === "contract" ? item.planName : item.folio}</span>
                        <span className="text-rose-400 font-black">{fmt$(max)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monto a Cobrar</label>
                        <span className="text-[10px] text-brand-gold-500 font-bold">Máx: {fmt$(max)}</span>
                    </div>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={max}
                            value={amount}
                            onChange={e => setAmount(Math.min(Number(e.target.value), max))}
                            className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold"
                        />
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-slate-400 hover:bg-white/10 transition-all">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || amount <= 0 || amount > max}
                        className="flex-1 py-3 rounded-xl bg-brand-gold-500 text-black text-sm font-black hover:bg-brand-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        {loading ? "Procesando..." : "Confirmar"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function CobranzaPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"contracts" | "orders">("contracts");
    const [payingItem, setPayingItem] = useState<{ item: any; type: "contract" | "order" } | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [checked, setChecked] = useState<Set<string>>(new Set());

    const fetchData = () => {
        setLoading(true);
        fetch("/api/cobranza")
            .then(r => r.ok ? r.json() : null)
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const toggleCheck = (id: string) => {
        setChecked(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const checkedTotal = useMemo(() => {
        if (!data) return 0;
        let total = 0;
        if (activeTab === "contracts") {
            data.contracts.forEach((c: any) => { if (checked.has(c.id)) total += c.installmentAmount; });
        } else {
            data.serviceOrders.forEach((o: any) => { if (checked.has(o.id)) total += o.balanceDue; });
        }
        return total;
    }, [data, checked, activeTab]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin text-brand-gold-500" size={32} />
            </div>
        );
    }

    const contracts: any[] = data?.contracts ?? [];
    const serviceOrders: any[] = data?.serviceOrders ?? [];
    const totals = data?.totals ?? {};

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black italic tracking-tight aura-gradient bg-clip-text text-transparent">
                        Cobranza
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Pagos pendientes agrupados para cobro rápido.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold text-slate-300 transition-all"
                >
                    <RefreshCw size={15} />
                    Actualizar
                </button>
            </header>

            {/* Summary KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Contratos pendientes", value: totals.pendingContracts, color: "text-brand-gold-400", bg: "bg-brand-gold-500/10", border: "border-brand-gold-500/20" },
                    { label: "Por cobrar (cuotas)", value: fmt$(totals.totalPendingContracts), color: "text-brand-gold-400", bg: "bg-brand-gold-500/10", border: "border-brand-gold-500/20" },
                    { label: "Servicios c/saldo", value: totals.pendingOrders, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                    { label: "Total a cobrar", value: fmt$(totals.grandTotal), color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                ].map(s => (
                    <motion.div
                        key={s.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-4 rounded-2xl border ${s.border}`}
                    >
                        <p className={`text-xl font-black ${s.color}`}>{loading ? "—" : s.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/5 pb-0">
                {[
                    { key: "contracts", label: "Previsión", count: contracts.length, icon: HeartHandshake, color: "text-brand-gold-400" },
                    { key: "orders", label: "Servicios Inmediatos", count: serviceOrders.length, icon: Wrench, color: "text-rose-400" },
                ] .map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setActiveTab(tab.key as any); setChecked(new Set()); }}
                        className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-sm font-black transition-all border-b-2 ${
                            activeTab === tab.key
                                ? "border-brand-gold-500 text-brand-gold-400 bg-brand-gold-500/5"
                                : "border-transparent text-slate-500 hover:text-slate-300"
                        }`}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                        <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-black">
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Checked total bar */}
            {checked.size > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/30"
                >
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-brand-gold-500">
                            {checked.size} seleccionado{checked.size !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xl font-black text-white">{fmt$(checkedTotal)}</p>
                    </div>
                    <button
                        onClick={() => setChecked(new Set())}
                        className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        Limpiar selección
                    </button>
                </motion.div>
            )}

            {/* Contract rows */}
            <AnimatePresence mode="wait">
                {activeTab === "contracts" && (
                    <motion.div key="contracts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {contracts.length === 0 ? (
                            <div className="py-16 text-center glass-card rounded-3xl">
                                <p className="text-slate-500 font-bold">No hay contratos con pagos pendientes.</p>
                            </div>
                        ) : contracts.map((c: any, idx: number) => {
                            const isExpanded = expandedId === c.id;
                            const isChecked = checked.has(c.id);
                            const progressPct = Math.min(100, (c.totalPaid / c.planPrice) * 100);

                            return (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`glass-card rounded-2xl border transition-all ${isChecked ? "border-brand-gold-500/40 bg-brand-gold-500/5" : "border-white/5 hover:border-white/10"}`}
                                >
                                    <div className="p-5 flex items-center gap-4">
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleCheck(c.id)}
                                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? "bg-brand-gold-500 border-brand-gold-500" : "border-white/20 hover:border-brand-gold-500/50"}`}
                                        >
                                            {isChecked && <CheckCircle2 size={14} className="text-black" />}
                                        </button>

                                        {/* Client info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-black text-white">{c.owner.name}</span>
                                                {c.owner.phone && (
                                                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                                        <Phone size={10} /> {c.owner.phone}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">{c.planName}</p>
                                            {/* Progress bar */}
                                            <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full aura-gradient" style={{ width: `${progressPct}%` }} />
                                            </div>
                                            <p className="text-[10px] text-slate-600 mt-1">
                                                {fmt$(c.totalPaid)} pagado de {fmt$(c.planPrice)} · {Math.round(progressPct)}%
                                            </p>
                                        </div>

                                        {/* Right side */}
                                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cuota mensual</p>
                                                <p className="text-lg font-black text-brand-gold-400">{fmt$(c.installmentAmount)}</p>
                                                <p className="text-[10px] text-rose-400 font-bold">Saldo total: {fmt$(c.remainingBalance)}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPayingItem({ item: c, type: "contract" })}
                                                    className="px-3 py-1.5 rounded-xl bg-brand-gold-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold-400 transition-all"
                                                >
                                                    Cobrar
                                                </button>
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                                                    className="px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                                                >
                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-white/5"
                                            >
                                                <div className="p-5 pt-4 grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Plan</p>
                                                        <p className="text-sm font-bold text-slate-200">{c.planName}</p>
                                                        <p className="text-xs text-slate-500">{c.installmentsCount} cuotas</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pagos realizados</p>
                                                        <p className="text-sm font-bold text-emerald-400">{c.paymentsCount} pagos</p>
                                                        <p className="text-xs text-slate-500">{fmt$(c.totalPaid)} total</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Último pago</p>
                                                        <p className="text-sm font-bold text-slate-200">
                                                            {c.lastPaymentDate
                                                                ? new Date(c.lastPaymentDate).toLocaleDateString("es-MX")
                                                                : "Sin pagos"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {activeTab === "orders" && (
                    <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        {serviceOrders.length === 0 ? (
                            <div className="py-16 text-center glass-card rounded-3xl">
                                <p className="text-slate-500 font-bold">No hay servicios inmediatos con saldo pendiente.</p>
                            </div>
                        ) : serviceOrders.map((o: any, idx: number) => {
                            const isChecked = checked.has(o.id);
                            return (
                                <motion.div
                                    key={o.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    className={`glass-card rounded-2xl border p-5 flex items-center gap-4 transition-all ${isChecked ? "border-rose-500/40 bg-rose-500/5" : "border-white/5 hover:border-white/10"}`}
                                >
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleCheck(o.id)}
                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? "bg-rose-500 border-rose-500" : "border-white/20 hover:border-rose-500/50"}`}
                                    >
                                        {isChecked && <CheckCircle2 size={14} className="text-white" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-black text-white">{o.owner.name}</span>
                                            {o.owner.phone && (
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                                                    <Phone size={10} /> {o.owner.phone}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {o.folio} · {o.petName} ({o.petSpecies})
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-1">
                                            Total del servicio: {fmt$(o.totalCost)} · {new Date(o.createdAt).toLocaleDateString("es-MX")}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Saldo pendiente</p>
                                            <p className="text-lg font-black text-rose-400">{fmt$(o.balanceDue)}</p>
                                        </div>
                                        <button
                                            onClick={() => setPayingItem({ item: o, type: "order" })}
                                            className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-400 transition-all"
                                        >
                                            Cobrar
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pay modal */}
            <AnimatePresence>
                {payingItem && (
                    <PayQuickModal
                        item={payingItem.item}
                        type={payingItem.type}
                        onClose={() => setPayingItem(null)}
                        onSuccess={fetchData}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
