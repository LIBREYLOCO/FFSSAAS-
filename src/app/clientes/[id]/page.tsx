"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    User, Dog, HeartHandshake, Calendar, Phone, Mail, MapPin,
    ArrowLeft, Plus, Clock, CheckCircle2, AlertCircle, TrendingUp, Loader2, Play
} from "lucide-react";
import Link from "next/link";
import NewServiceOrderModal from "@/components/NewServiceOrderModal";
import AddPetToClientModal from "@/components/AddPetToClientModal";
import RegisterPaymentModal from "@/components/RegisterPaymentModal";
import EditPetModal from "@/components/EditPetModal";
import { Edit2 } from "lucide-react";

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [owner, setOwner] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isAddPetModalOpen, setIsAddPetModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isEditPetModalOpen, setIsEditPetModalOpen] = useState(false);
    const [selectedPetToEdit, setSelectedPetToEdit] = useState<any>(null);
    const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

    const fetchOwner = async () => {
        if (!params.id) return;
        try {
            const res = await fetch(`/api/owners/${params.id}`);
            const data = await res.json();
            setOwner(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwner();
    }, [params.id]);

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            const res = await fetch(`/api/service-orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                await fetchOwner();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdatingStatus(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold-500"></div>
            </div>
        );
    }

    if (!owner) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
                <Link href="/clientes" className="text-brand-gold-500 hover:underline mt-4 inline-block">
                    Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Navigation */}
            <header className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-brand-gold-500 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft size={16} /> Volver
                </button>
                <div className="flex gap-4">
                    <button className="bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/5 transition-colors text-slate-400">
                        Editar Perfil
                    </button>
                    <button
                        onClick={() => setIsOrderModalOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={18} /> Nueva Orden
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Owner Profile */}
                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8 rounded-3xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-500/10 blur-3xl -z-10" />

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-gold-600/20 to-accent-500/10 flex items-center justify-center text-brand-gold-500 border border-brand-gold-500/30">
                                <User size={48} strokeWidth={1.5} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{owner.name}</h1>
                                <p className="text-brand-gold-500/60 text-xs font-bold uppercase tracking-widest mt-1">Socio Premium</p>
                            </div>
                        </div>

                        <div className="mt-8 space-y-4 text-sm">
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-brand-gold-500">
                                    <Phone size={16} />
                                </div>
                                <p>{owner.phone || "No registrado"}</p>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-brand-gold-500">
                                    <Mail size={16} />
                                </div>
                                <p>{owner.email || "No registrado"}</p>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-brand-gold-500">
                                    <MapPin size={16} />
                                </div>
                                <p>{owner.address || "No registrada"}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Desde</p>
                                <p className="font-bold text-slate-300">{new Date(owner.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="text-center border-l border-white/5">
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Mascotas</p>
                                <p className="font-bold text-slate-300">{owner.pets?.length || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Pets Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 ml-2">Mascotas</h3>
                            <button
                                onClick={() => setIsAddPetModalOpen(true)}
                                className="text-brand-gold-500 hover:text-brand-gold-400 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        {owner?.pets?.length === 0 ? (
                            <div className="glass-card p-6 rounded-2xl text-center text-slate-500 text-sm">
                                <Dog size={24} className="mx-auto mb-2 opacity-20" />
                                Sin mascotas registradas
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(owner?.pets || []).map((pet: any) => (
                                    <div key={pet.id} className="glass-card p-4 rounded-2xl flex items-center gap-4 group hover:border-brand-gold-500/30 transition-colors">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold-500 overflow-hidden">
                                            {pet.photoUrl ? (
                                                <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Dog size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{pet.name}</h4>
                                            <p className="text-xs text-slate-500">{pet.species} • {pet.breed || "Raza única"}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedPetToEdit(pet);
                                                setIsEditPetModalOpen(true);
                                            }}
                                            className="p-1.5 bg-white/5 hover:bg-brand-gold-500/20 text-slate-400 hover:text-brand-gold-500 rounded-lg transition-colors border border-transparent hover:border-brand-gold-500/30"
                                            title="Editar mascota"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        {pet.deathDate ? (
                                            <span className="text-[10px] bg-white/5 text-slate-500 px-2 py-1 rounded-lg">En memoria</span>
                                        ) : (
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg font-bold uppercase">Activo</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right/Main Column: Contracts & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Plan / Contract */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-1 overflow-hidden rounded-[2.5rem]"
                    >
                        <div className="bg-[#1e2e3e] p-8 rounded-[2rem] border border-white/5">
                            <div className="flex flex-col md:flex-row gap-8 justify-between">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-brand-gold-500/10 rounded-2xl text-brand-gold-500">
                                            <HeartHandshake size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold italic tracking-tight">Plan de Previsión Activo</h3>
                                            <p className="text-xs text-slate-500">Seguridad y paz para el futuro.</p>
                                        </div>
                                    </div>

                                    {owner.contracts?.length > 0 ? (
                                        <div className="space-y-6 mt-6">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Plan Contratado</p>
                                                    <p className="text-2xl font-black aura-gradient bg-clip-text text-transparent">
                                                        {owner.contracts[0].plan?.name}
                                                    </p>
                                                </div>
                                                <div className="text-right flex flex-col items-end">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Estado de Cuenta</p>
                                                    <p className="text-emerald-500 font-bold mb-2">AL CORRIENTE</p>
                                                    <button
                                                        onClick={() => setIsPaymentModalOpen(true)}
                                                        className="bg-brand-gold-500/10 text-brand-gold-500 hover:bg-brand-gold-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors"
                                                    >
                                                        Registrar Pago +
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="text-slate-400 uppercase tracking-widest">Progreso del Pago</span>
                                                    <span className="text-brand-gold-500">65% ($7,800 / $12,000)</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                                    <div className="h-full bg-gradient-to-r from-brand-gold-600 to-brand-gold-400 rounded-full shadow-[0_0_10px_rgba(197,160,89,0.5)] w-[65%]" />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Inició</p>
                                                    <p className="text-xs font-bold">{new Date(owner.contracts[0].startDate).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Mensualidad</p>
                                                    <p className="text-xs font-bold">$875 MXN</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-slate-500 uppercase font-bold">Próximo Pago</p>
                                                    <p className="text-xs font-bold text-brand-gold-500">15 Abr, 2026</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center bg-white/5 rounded-3xl mt-4 border border-dashed border-white/10">
                                            <p className="text-sm text-slate-500">No hay contratos de previsión activos.</p>
                                            <Link href="/prevision" className="text-brand-gold-500 text-xs font-bold uppercase mt-2 hover:underline inline-block">
                                                Vincular Plan +
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                <div className="md:w-64 space-y-4">
                                    <div className="glass-card p-6 rounded-3xl bg-white/5 border-white/10">
                                        <div className="flex items-center gap-2 text-brand-gold-500 mb-4">
                                            <TrendingUp size={18} />
                                            <p className="text-xs font-bold uppercase tracking-widest">Estadísticas</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-2xl font-black">{owner.serviceOrders?.length || 0}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Servicios Utilizados</p>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black">${(owner.serviceOrders || []).reduce((acc: number, order: any) => acc + Number(order.totalCost || 0), 0).toLocaleString('en-US')}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Total Invertido</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Service Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 ml-2">
                            <Clock size={20} className="text-brand-gold-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Historial de Servicios</h3>
                        </div>

                        <div className="space-y-0 relative before:absolute before:left-8 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                            {owner?.serviceOrders?.length === 0 ? (
                                <div className="ml-16 glass-card p-8 rounded-3xl text-center text-slate-500">
                                    Sin historial de servicios aún.
                                </div>
                            ) : (
                                (owner?.serviceOrders || []).map((service: any, index: number) => (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative pl-16 pb-8 last:pb-0"
                                    >
                                        {/* Dot */}
                                        <div className={`absolute left-[30px] top-1 w-3 h-3 rounded-full ring-4 ring-bg-deep border-2 ${service.status === 'COMPLETED' ? 'bg-emerald-500 border-emerald-500/50' :
                                            service.status === 'PENDING' ? 'bg-brand-gold-500 border-brand-gold-500/50 shadow-[0_0_10px_rgba(197,160,89,0.5)]' :
                                                'bg-slate-500 border-slate-500/50'
                                            }`} />

                                        <div className="glass-card p-6 rounded-[2rem] hover:border-brand-gold-500/30 transition-colors group">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-brand-gold-500 transition-colors overflow-hidden">
                                                        {service.pet?.photoUrl ? (
                                                            <img src={service.pet.photoUrl} alt={service.pet.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Dog size={24} />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold">Cremación {service.serviceType === 'IMMEDIATE' ? 'Inmediata' : 'por Plan'}</h4>
                                                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${service.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-gold-500/10 text-brand-gold-500'
                                                                }`}>
                                                                {service.status === 'COMPLETED' ? 'Terminado' : 'En proceso'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400">Mascota: <span className="text-slate-200 font-bold">{service.pet?.name || "No especificada"}</span></p>
                                                        <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(service.createdAt).toLocaleDateString()}</span>
                                                            <span className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${service.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                                service.status === 'PENDING' ? 'bg-brand-gold-500/10 border-brand-gold-500/20 text-brand-gold-500 text-[8px]' :
                                                                    'bg-blue-500/10 border-blue-500/20 text-blue-400 text-[8px]'
                                                                }`}>
                                                                {updatingStatus === service.id ? (
                                                                    <Loader2 size={10} className="animate-spin" />
                                                                ) : service.status === 'PENDING' ? (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(service.id, 'PROCESS')}
                                                                        className="flex items-center gap-1 hover:text-white"
                                                                    >
                                                                        <Play size={10} /> Iniciar Proceso
                                                                    </button>
                                                                ) : service.status === 'PROCESS' ? (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(service.id, 'COMPLETED')}
                                                                        className="flex items-center gap-1 hover:text-white"
                                                                    >
                                                                        <CheckCircle2 size={10} /> Finalizar
                                                                    </button>
                                                                ) : (
                                                                    <span className="flex items-center gap-1">
                                                                        <CheckCircle2 size={10} /> Completado
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>

                                                        {/* Products List */}
                                                        {service.products?.length > 0 && (
                                                            <div className="mt-4 pt-3 border-t border-white/5">
                                                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-brand-gold-500" />
                                                                    Productos Adicionales
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {service.products.map((p: any) => (
                                                                        <div key={p.id} className="flex items-center gap-2 text-xs bg-brand-gold-500/5 px-3 py-1.5 rounded-lg text-slate-300 border border-brand-gold-500/10">
                                                                            <span className="font-bold text-brand-gold-500">{p.quantity}x</span>
                                                                            <span>{p.product?.name || "Producto desconocido"}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right flex flex-col justify-center">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Costo / Origen</p>
                                                    <p className="text-lg font-black text-slate-300">
                                                        {service.serviceType === 'IMMEDIATE' ? `$${service.totalCost}` : 'Incluido en Plan'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <NewServiceOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                owner={owner}
                onSuccess={fetchOwner}
            />

            <AddPetToClientModal
                isOpen={isAddPetModalOpen}
                onClose={() => setIsAddPetModalOpen(false)}
                onSuccess={fetchOwner}
                ownerId={owner.id}
                ownerName={owner.name}
            />

            {owner.contracts?.length > 0 && (
                <RegisterPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    onSuccess={fetchOwner}
                    contractId={owner.contracts[0].id}
                    planName={owner.contracts[0].plan?.name || "Plan"}
                />
            )}

            <EditPetModal
                isOpen={isEditPetModalOpen}
                onClose={() => setIsEditPetModalOpen(false)}
                onSuccess={fetchOwner}
                pet={selectedPetToEdit}
            />
        </div>
    );
}
