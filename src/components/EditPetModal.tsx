"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dog, Calendar, Loader2, Upload, FileText, Activity } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    pet: any;
}

export default function EditPetModal({ isOpen, onClose, onSuccess, pet }: Props) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [clinics, setClinics] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        species: "Perro",
        breed: "",
        birthDate: "",
        weightKg: "",
        color: "",
        photoUrl: "",
        referralSource: "DIRECTO",
        clinicId: ""
    });

    useEffect(() => {
        if (pet && isOpen) {
            setFormData({
                name: pet.name || "",
                species: pet.species || "Perro",
                breed: pet.breed || "",
                birthDate: pet.birthDate ? new Date(pet.birthDate).toISOString().split('T')[0] : "",
                weightKg: pet.weightKg ? pet.weightKg.toString() : "",
                color: pet.color || "",
                photoUrl: pet.photoUrl || "",
                referralSource: pet.referralSource || "DIRECTO",
                clinicId: pet.clinicId || ""
            });
            setPreviewUrl(pet.photoUrl || null);
            setSelectedFile(null);

            fetch("/api/veterinarias")
                .then(res => res.json())
                .then(setClinics)
                .catch(console.error);
        }
    }, [pet, isOpen]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let uploadedPhotoUrl = formData.photoUrl;

        try {
            if (selectedFile) {
                setUploadingImage(true);
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `pets/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('pets-photos')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    console.error("Error uploading image:", uploadError);
                    alert(`No se pudo subir la imagen: ${uploadError.message || "Error desconocido en Supabase"}`);
                    setUploadingImage(false);
                    setLoading(false);
                    return;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('pets-photos')
                    .getPublicUrl(filePath);

                uploadedPhotoUrl = publicUrl;
                setUploadingImage(false);
            }

            const res = await fetch(`/api/pets/${pet.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, photoUrl: uploadedPhotoUrl })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                console.error("Error backend:", data);
                alert(`Error al guardar: ${data.error || "Falla en el servidor"}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    if (!isOpen || !pet) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card w-full max-w-lg overflow-hidden rounded-[2.5rem] relative"
                >
                    <div className="p-8">
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Editar Mascota</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Actualizar Datos</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Photo Upload Area */}
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Dog size={32} className="text-slate-500" />
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Upload size={20} className="text-white" />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    {uploadingImage ? "Subiendo..." : "Cambiar Foto (Opcional)"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none"
                                        placeholder="Ej. Max"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Especie</label>
                                    <select
                                        value={formData.species}
                                        onChange={e => setFormData({ ...formData, species: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                    >
                                        <option value="Perro">Perro</option>
                                        <option value="Gato">Gato</option>
                                        <option value="Ave">Ave</option>
                                        <option value="Hámster">Hámster</option>
                                        <option value="Exótico">Exótico</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Raza</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={e => setFormData({ ...formData, breed: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none"
                                        placeholder="Ej. Golden Retriever"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Fecha Nacimiento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-slate-200 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Peso (Kg) <span className="text-brand-gold-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.weightKg}
                                        onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Color</label>
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none"
                                        placeholder="Ej. Negro"
                                    />
                                </div>
                            </div>

                            {/* Referral Source Section */}
                            <div className="border-t border-white/5 pt-6 space-y-4">
                                <h3 className="text-sm font-bold text-slate-300">Origen del Cliente</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Origen</label>
                                        <select
                                            value={formData.referralSource}
                                            onChange={e => setFormData({ ...formData, referralSource: e.target.value, clinicId: "" })}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                        >
                                            <option value="DIRECTO">Directo</option>
                                            <option value="VETERINARIA">Veterinaria</option>
                                        </select>
                                    </div>
                                    {formData.referralSource === "VETERINARIA" && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Clínica Veterinaria</label>
                                            <select
                                                required
                                                value={formData.clinicId}
                                                onChange={e => setFormData({ ...formData, clinicId: e.target.value })}
                                                className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-slate-200 outline-none appearance-none"
                                            >
                                                <option value="" disabled>Seleccione una clínica</option>
                                                {clinics.map(clinic => (
                                                    <option key={clinic.id} value={clinic.id}>
                                                        {clinic.name || clinic.businessName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 gap-4 border-t border-white/5">
                                <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading || uploadingImage} className="btn-primary flex items-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
                                </button>
                            </div>
                        </form>

                        {/* Pet Service History & Certificates Section */}
                        {pet.services && pet.services.length > 0 && (
                            <div className="mt-8 border-t border-white/10 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-brand-gold-500/10 rounded-xl text-brand-gold-500">
                                        <Activity size={20} />
                                    </div>
                                    <h3 className="text-lg font-bold">Historial de Servicios</h3>
                                </div>

                                <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {pet.services.map((svc: any) => (
                                        <div key={svc.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-sm text-brand-gold-500">{svc.serviceType} / Folio {svc.folio}</p>
                                                    <p className="text-xs text-slate-400">Creado el {new Date(svc.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${svc.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                    {svc.status}
                                                </span>
                                            </div>

                                            {/* Tracking Logs Summary */}
                                            {svc.trackingLogs && svc.trackingLogs.length > 0 && (
                                                <div className="mt-3 bg-black/20 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Últimos movimientos</p>
                                                    <div className="space-y-2">
                                                        {svc.trackingLogs.slice(0, 3).map((log: any) => (
                                                            <div key={log.id} className="flex gap-2 text-xs">
                                                                <span className="text-slate-500 min-w-16">{new Date(log.timestamp).toLocaleDateString()}</span>
                                                                <span className="text-slate-300">{log.event}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Certificate Download Button */}
                                            {svc.status === 'COMPLETED' && svc.sesionCremacion?.id && (
                                                <div className="mt-4 pt-4 border-t border-white/5">
                                                    <a
                                                        href={`/api/sesiones-cremacion/${svc.sesionCremacion.id}/certificado`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 justify-center w-full py-2 bg-brand-gold-500/10 hover:bg-brand-gold-500/20 text-brand-gold-400 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest"
                                                    >
                                                        <FileText size={16} /> Ver Certificado de Cremación
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
