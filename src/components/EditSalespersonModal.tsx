"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Save, Loader2, DollarSign, Upload, User } from "lucide-react";
import AddressFormSection, { AddressValues, emptyAddress } from "./AddressFormSection";
import { supabase } from "@/lib/supabaseClient";

interface Salesperson {
    id: string;
    name: string;
    level: string;
    commissionRate: number | string;
    previsionCommissionRate: number | string;
    phone?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    streetName?: string | null;
    streetNumber?: string | null;
    interiorNum?: string | null;
    neighborhood?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zipCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    sucursal?: { nombre: string; codigo: string } | null;
}

interface EditSalespersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    person: Salesperson | null;
}

const INPUT = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-slate-200 outline-none focus:border-brand-gold-500/50 transition-colors placeholder:text-slate-600 text-sm";
const LABEL = "text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1";
const LEVELS = ["JUNIOR", "SENIOR", "EXPERT", "MASTER"];

export default function EditSalespersonModal({ isOpen, onClose, onSuccess, person }: EditSalespersonModalProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: "", level: "JUNIOR", commissionRate: "5.0", previsionCommissionRate: "5.0",
        phone: "", email: "", photoUrl: "",
    });
    const [address, setAddress] = useState<AddressValues>(emptyAddress());

    useEffect(() => {
        if (person && isOpen) {
            setFormData({
                name: person.name ?? "",
                level: person.level ?? "JUNIOR",
                commissionRate: String(Number(person.commissionRate).toFixed(1)),
                previsionCommissionRate: String(Number(person.previsionCommissionRate).toFixed(1)),
                phone: person.phone ?? "",
                email: person.email ?? "",
                photoUrl: person.photoUrl ?? "",
            });
            setAddress({
                streetName: person.streetName ?? "",
                streetNumber: person.streetNumber ?? "",
                interiorNum: person.interiorNum ?? "",
                neighborhood: person.neighborhood ?? "",
                city: person.city ?? "",
                state: person.state ?? "",
                country: person.country ?? "México",
                zipCode: person.zipCode ?? "",
                latitude: person.latitude != null ? String(person.latitude) : "",
                longitude: person.longitude != null ? String(person.longitude) : "",
            });
            setPreviewUrl(person.photoUrl ?? null);
            setSelectedFile(null);
        }
    }, [person, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!person || !formData.name.trim()) return;
        setLoading(true);
        let photoUrl = formData.photoUrl;

        try {
            // Upload photo to Supabase if a new file was selected
            if (selectedFile) {
                setUploadingPhoto(true);
                const ext = selectedFile.name.split('.').pop();
                const path = `vendedores/${person.id}-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from('pets-photos')
                    .upload(path, selectedFile, { upsert: true });

                if (uploadError) {
                    alert(`No se pudo subir la foto: ${uploadError.message}`);
                    setUploadingPhoto(false);
                    setLoading(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('pets-photos')
                    .getPublicUrl(path);
                photoUrl = publicUrl;
                setUploadingPhoto(false);
            }

            const res = await fetch(`/api/vendedores/${person.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, photoUrl, ...address }),
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                alert(data.error || "Error al guardar");
            }
        } catch {
            alert("Error de conexión");
        } finally {
            setLoading(false);
            setUploadingPhoto(false);
        }
    };

    if (!isOpen || !person) return null;

    const isBusy = loading || uploadingPhoto;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="glass-card w-full max-w-xl rounded-[40px] border border-white/10 shadow-2xl max-h-[92vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 glass-card px-8 pt-8 pb-4 rounded-t-[40px] flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500">
                                <TrendingUp size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold">Editar Vendedor</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{person.name}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors rounded-xl hover:bg-white/5">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="px-8 py-6 space-y-5">
                        {/* Photo upload */}
                        <div className="flex flex-col items-center gap-3 py-2">
                            <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 bg-white/5 overflow-hidden group cursor-pointer">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="foto" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                                        <User size={36} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload size={18} className="text-white" />
                                    <span className="text-[9px] text-white font-bold mt-1">Cambiar</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {uploadingPhoto ? "Subiendo foto…" : "Foto de perfil (opcional)"}
                            </p>
                        </div>

                        {/* Professional info */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Información del Vendedor</p>

                            <div className="space-y-1">
                                <label className={LABEL}>Nombre Completo *</label>
                                <input type="text" value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className={INPUT} placeholder="Juan Pérez García" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className={LABEL}>Nivel</label>
                                    <select value={formData.level}
                                        onChange={e => setFormData(p => ({ ...p, level: e.target.value }))}
                                        className={`${INPUT} appearance-none cursor-pointer`}>
                                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className={LABEL}>Comisión Cremación (%)</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="number" step="0.5" min="0" max="100"
                                            value={formData.commissionRate}
                                            onChange={e => setFormData(p => ({ ...p, commissionRate: e.target.value }))}
                                            className={`${INPUT} pl-9`} placeholder="5.0" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className={LABEL}>Comisión Previsión (%)</label>
                                    <div className="relative">
                                        <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input type="number" step="0.5" min="0" max="100"
                                            value={formData.previsionCommissionRate}
                                            onChange={e => setFormData(p => ({ ...p, previsionCommissionRate: e.target.value }))}
                                            className={`${INPUT} pl-9`} placeholder="5.0" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className={LABEL}>Correo Electrónico</label>
                                    <input type="email" value={formData.email}
                                        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                        className={INPUT} placeholder="vendedor@ejemplo.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className={LABEL}>Teléfono</label>
                                    <input type="tel" value={formData.phone}
                                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                        className={INPUT} placeholder="55 1234 5678" />
                                </div>
                            </div>
                        </div>

                        {/* Address with map */}
                        <div className="border-t border-white/5 pt-5">
                            <AddressFormSection
                                values={address}
                                onChange={updated => setAddress(prev => ({ ...prev, ...updated }))}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 glass-card px-8 pb-8 pt-4 rounded-b-[40px] border-t border-white/5 flex gap-3">
                        <button onClick={onClose} disabled={isBusy}
                            className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold uppercase tracking-widest transition-all disabled:opacity-40">
                            Cancelar
                        </button>
                        <button onClick={handleSubmit} disabled={isBusy || !formData.name.trim()}
                            className="flex-1 py-3 rounded-2xl bg-brand-gold-500 text-black font-black text-sm uppercase tracking-widest shadow-lg disabled:opacity-40 hover:bg-brand-gold-400 transition-all flex items-center justify-center gap-2">
                            {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {uploadingPhoto ? "Subiendo foto…" : isBusy ? "Guardando…" : "Guardar Cambios"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
