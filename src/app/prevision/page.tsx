"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, Plus, Clock, CheckCircle2, DollarSign, User } from "lucide-react";
import { cn } from "@/lib/utils";
import RegisterContractModal from "@/components/RegisterContractModal";
import PaymentHistoryModal from "@/components/PaymentHistoryModal";
import ManagePlansModal from "@/components/ManagePlansModal";
import { generatePrevisionContractPDF, generateInstallmentReceiptsPDF } from "@/lib/pdfGenerator";
import { formatMXN } from "@/lib/format";

export default function PrevisionPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isManagePlansOpen, setIsManagePlansOpen] = useState(false);

    const fetchContracts = () => {
        setLoading(true);
        fetch("/api/prevision/contracts")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setContracts(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch contracts error:", err);
                setContracts([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handlePrintReceipts = async (contract: any) => {
        try {
            const sysRes = await fetch("/api/system-config");
            const systemConfig = sysRes.ok ? await sysRes.json() : {};
            await generateInstallmentReceiptsPDF({
                owner: { name: contract.owner.name, phone: contract.owner.phone },
                plan: { name: contract.plan.name, price: Number(contract.plan.price), installmentsCount: contract.plan.installmentsCount },
                contract: { id: contract.id, startDate: contract.startDate || new Date().toISOString(), downPayment: Number(contract.downPayment), installmentAmount: Number(contract.installmentAmount) },
                system: { legalName: systemConfig?.legalName || "", contactPhone: systemConfig?.contactPhone || "" }
            });
        } catch (error) { console.error("Error generating receipts", error); }
    };

    const handleDownloadPDF = async (contract: any) => {
        try {
            const sysRes = await fetch("/api/system-config");
            const systemConfig = sysRes.ok ? await sysRes.json() : {};

            await generatePrevisionContractPDF({
                owner: {
                    name: contract.owner.name || "",
                    address: contract.owner.address || "",
                    phone: contract.owner.phone || "",
                    email: contract.owner.email || ""
                },
                plan: {
                    name: contract.plan.name || "",
                    price: Number(contract.plan.price) || 0,
                    installmentsCount: contract.plan.installmentsCount || 12
                },
                contract: {
                    id: contract.id || "Pendiente",
                    startDate: contract.startDate || new Date().toISOString(),
                    downPayment: Number(contract.downPayment) || 0,
                    installmentAmount: Number(contract.installmentAmount) || 0
                },
                system: {
                    legalName: systemConfig?.["legalName"] || systemConfig?.find?.((c: any) => c.key === "legalName")?.value || "",
                    legalRepresentative: systemConfig?.["legalRepresentative"] || systemConfig?.find?.((c: any) => c.key === "legalRepresentative")?.value || "",
                    contactPhone: systemConfig?.["contactPhone"] || systemConfig?.find?.((c: any) => c.key === "contactPhone")?.value || ""
                }
            });
        } catch (error) {
            console.error("Error generating PDF", error);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Ventas de Previsión</h2>
                    <p className="text-slate-400">Contratos de previsión activa y seguimiento de pagos.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsManagePlansOpen(true)}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-widest text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
                    >
                        Gestionar Planes
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 w-fit"
                    >
                        <Plus size={20} />
                        Nueva Venta
                    </button>
                </div>
            </header>

            <ManagePlansModal
                isOpen={isManagePlansOpen}
                onClose={() => setIsManagePlansOpen(false)}
                onSuccess={fetchContracts} // Refresca si es necesario
            />


            <RegisterContractModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchContracts}
            />

            <PaymentHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => {
                    setIsHistoryOpen(false);
                    setSelectedContract(null);
                }}
                contract={selectedContract}
                onSuccess={fetchContracts}
            />

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="glass-card h-40 rounded-3xl animate-pulse" />
                    ))
                ) : contracts.length === 0 ? (
                    <div className="py-20 text-center space-y-4 glass-card rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <HeartHandshake className="text-slate-600" />
                        </div>
                        <p className="text-slate-500">No hay contratos de previsión aún.</p>
                    </div>
                ) : (
                    contracts.map((contract) => {
                        const paidAmount = contract.payments?.reduce((acc: number, p: any) => acc + (p.status === "PAID" ? Number(p.amount) : 0), 0) || 0;
                        const planPrice = Number(contract.plan.price);
                        const progress = (paidAmount / planPrice) * 100;

                        return (
                            <motion.div
                                key={contract.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-6 items-center"
                            >
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</p>
                                    <h3 className="text-lg font-bold flex items-center gap-2 text-brand-gold-500">
                                        <User size={16} /> {contract.owner.name}
                                    </h3>
                                    <p className="text-sm text-slate-400 italic">{contract.plan.name}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plan & Financiamiento</p>
                                    <p className="text-sm">Total: <span className="font-bold">{formatMXN(contract.plan.price)}</span></p>
                                    <p className="text-xs text-slate-400">
                                        Enganche: {formatMXN(contract.downPayment)} + {contract.plan.installmentsCount} cuotas de {formatMXN(contract.installmentAmount)}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                                        <span>Progreso de Pago</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full aura-gradient shadow-[0_0_10px_rgba(197,160,89,0.5)]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 text-right">Pagado: {formatMXN(paidAmount)} de {formatMXN(contract.plan.price)}</p>
                                </div>

                                <div className="flex flex-col items-end gap-3 mt-4 md:mt-0">
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                                        contract.status === "ACTIVE"
                                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                    )}>
                                        {contract.status === "ACTIVE" ? "Activo" : "Completado"}
                                    </span>
                                    <div className="flex flex-col gap-2 items-end">
                                        <button
                                            onClick={() => handleDownloadPDF(contract)}
                                            className="text-xs font-bold text-brand-gold-500 hover:underline flex items-center gap-1 bg-white/5 px-3 py-2 rounded-lg"
                                        >
                                            Descargar Contrato PDF
                                        </button>
                                        <button
                                            onClick={() => handlePrintReceipts(contract)}
                                            className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 bg-white/5 px-3 py-2 rounded-lg"
                                        >
                                            Imprimir Recibos ({contract.plan.installmentsCount})
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedContract(contract);
                                                setIsHistoryOpen(true);
                                            }}
                                            className="text-xs font-bold text-primary-500 hover:underline bg-white/5 px-3 py-2 rounded-lg"
                                        >
                                            Ver Historial de Pagos
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

