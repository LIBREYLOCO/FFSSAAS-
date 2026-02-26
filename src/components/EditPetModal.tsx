"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dog, Calendar, Loader2, Upload } from "lucide-react";
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

    const [formData, setFormData] = useState({
        name: "",
        species: "Perro",
        breed: "",
        birthDate: "",
        weightKg: "",
        color: "",
        photoUrl: ""
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
                photoUrl: pet.photoUrl || ""
            });
            setPreviewUrl(pet.photoUrl || null);
            setSelectedFile(null);
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
                    alert("No se pudo subir la imagen.");
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

                            <button
                                disabled={loading || uploadingImage}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading || uploadingImage ? <Loader2 className="animate-spin" size={20} /> : "Guardar Cambios"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
