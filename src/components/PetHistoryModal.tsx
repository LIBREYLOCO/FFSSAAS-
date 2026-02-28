"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Activity, Search } from "lucide-react";
import Link from "next/link";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    pet: any;
}

export default function PetHistoryModal({ isOpen, onClose, pet }: Props) {
    if (!isOpen || !pet) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-lg overflow-hidden rounded-[2.5rem] relative flex flex-col max-h-[90vh]"
                >
                    <div className="p-8 pb-4 flex-shrink-0">
                        <header className="flex justify-between items-center mb-2">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Historial de Mascota</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    Servicios y Certificados de {pet.name}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>
                    </div>

                    <div className="px-8 pb-8 overflow-y-auto custom-scrollbar">
                        {(!pet.services || pet.services.length === 0) ? (
                            <div className="text-center py-12">
                                <div className="p-4 bg-white/5 rounded-full inline-flex mb-4">
                                    <Activity className="text-slate-500" size={24} />
                                </div>
                                <p className="text-slate-400">No hay servicios registrados para esta mascota.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pet.services.map((svc: any) => (
                                    <div key={svc.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-black text-brand-gold-500 uppercase tracking-tighter">{svc.serviceType}</p>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-xl border border-white/10">
                                                            <span className="text-[10px] font-mono text-slate-300 font-bold tracking-tighter">Folio: {svc.folio}</span>
                                                        </div>
                                                        <Link href={`/seguimiento/${svc.folio}`} className="w-full mt-2 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-gold-500 hover:bg-brand-gold-500 hover:text-black transition-all" title="Rastrear Servicio">
                                                            <Search size={12} strokeWidth={3} /> Ver Seguimiento
                                                        </Link>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                    Registrado el {new Date(svc.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${svc.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                {svc.status}
                                            </span>
                                        </div>

                                        {/* Tracking Logs Summary */}
                                        {svc.trackingLogs && svc.trackingLogs.length > 0 && (
                                            <div className="mt-4 bg-black/20 p-3.5 rounded-xl border border-white/5">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Última Actividad</p>
                                                <div className="space-y-2">
                                                    {svc.trackingLogs.slice(0, 5).map((log: any) => (
                                                        <div key={log.id} className="flex gap-3 text-xs">
                                                            <span className="text-brand-gold-500/70 min-w-16 font-medium">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                            <span className="text-slate-300">{log.event}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Certificate Download Button */}
                                        {svc.status === 'COMPLETED' && svc.sesionCremacion?.id && (
                                            <div className="mt-5 pt-5 border-t border-white/5">
                                                <a
                                                    href={`/api/sesiones-cremacion/${svc.sesionCremacion.id}/certificado`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 justify-center w-full py-3 bg-brand-gold-500 text-bg-deep rounded-xl hover:scale-[1.02] transition-transform text-xs font-bold uppercase tracking-widest"
                                                >
                                                    <FileText size={16} /> Descargar Certificado
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
