"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Loader2, Calendar, History } from "lucide-react";
import { formatMXN } from "@/lib/format";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    contract: any;
    onSuccess: () => void;
}

export default function PaymentHistoryModal({ isOpen, onClose, contract, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState<any[]>([]);
    const [newPaymentAmount, setNewPaymentAmount] = useState(0);

    useEffect(() => {
        if (isOpen && contract) {
            setPayments(contract.payments || []);
            setNewPaymentAmount(contract.installmentAmount);
        }
    }, [isOpen, contract]);

    const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const remainingBalance = Math.max(0, Number(contract?.plan?.price ?? 0) - totalPaid);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/prevision/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contractId: contract.id,
                    amount: newPaymentAmount,
                    type: "INSTALLMENT"
                })
            });
            if (res.ok) {
                onSuccess();
                // We refresh data by calling onSuccess, typically the parent will re-fetch
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !contract) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-2xl overflow-hidden rounded-[2.5rem] relative"
                >
                    <div className="p-8">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Historial de Pagos</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Contrato: {contract.owner.name} • {contract.plan.name}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-300 flex items-center gap-2">
                                    <History size={16} className="text-brand-gold-500" /> Registro Detallado
                                </h3>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {payments.length === 0 ? (
                                        <p className="text-sm text-slate-500 italic">No hay pagos registrados.</p>
                                    ) : (
                                        payments.map((payment) => (
                                            <div key={payment.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-200">
                                                        {payment.type === 'DOWN_PAYMENT' ? 'Enganche' : 'Mensualidad'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                                                        <Calendar size={10} /> {new Date(payment.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-emerald-500">{formatMXN(payment.amount)}</p>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/50">Pagado</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 p-6 rounded-3xl bg-black/20 border border-white/5">
                                <h3 className="text-sm font-bold uppercase tracking-tight text-slate-300 flex items-center gap-2">
                                    <DollarSign size={16} className="text-brand-gold-500" /> Registrar Abono
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center ml-1 mb-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Monto a Abonar</label>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                                Saldo restante: {formatMXN(remainingBalance)}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                max={remainingBalance}
                                                value={newPaymentAmount}
                                                onChange={e => setNewPaymentAmount(Math.min(Number(e.target.value), remainingBalance))}
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold"
                                            />
                                        </div>
                                        {newPaymentAmount > remainingBalance && (
                                            <p className="text-[10px] text-rose-400 font-bold ml-1">El monto no puede superar el saldo restante.</p>
                                        )}
                                    </div>

                                    <div className="p-4 rounded-xl bg-brand-gold-500/10 border border-brand-gold-500/20">
                                        <p className="text-[10px] text-brand-gold-500 font-bold uppercase tracking-widest leading-relaxed">
                                            Confirmación: Se registrará el pago y se actualizará el progreso del contrato.
                                        </p>
                                    </div>

                                    <button
                                        disabled={loading || remainingBalance <= 0 || newPaymentAmount <= 0 || newPaymentAmount > remainingBalance}
                                        type="submit"
                                        className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-2 font-bold disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : remainingBalance <= 0 ? "Contrato Liquidado" : "Registrar Pago"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
