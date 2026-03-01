"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dog, User, Calendar, Loader2, Search, Upload, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterPetModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [owners, setOwners] = useState<any[]>([]);
    const [clinics, setClinics] = useState<any[]>([]);
    const [searchOwner, setSearchOwner] = useState("");
    const [showCreateOwner, setShowCreateOwner] = useState(false);
    const [quickOwnerData, setQuickOwnerData] = useState({ name: "", phone: "" });
    const [creatingOwner, setCreatingOwner] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        species: "Perro",
        breed: "",
        birthDate: "",
        ownerId: "",
        weightKg: "",
        color: "",
        photoUrl: "",
        referralSource: "DIRECTO",
        clinicId: ""
    });

    useEffect(() => {
        if (isOpen) {
            fetch("/api/owners")
                .then(res => res.json())
                .then(setOwners);
            fetch("/api/veterinarias")
                .then(res => res.json())
                .then(setClinics);
        }
    }, [isOpen]);

    const filteredOwners = owners.filter(o =>
        o.name.toLowerCase().includes(searchOwner.toLowerCase())
    );

    const handleQuickCreateOwner = async () => {
        if (!quickOwnerData.name) return;
        setCreatingOwner(true);
        try {
            const res = await fetch("/api/owners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: quickOwnerData.name, phone: quickOwnerData.phone || undefined })
            });
            if (res.ok) {
                const newOwner = await res.json();
                setOwners(prev => [newOwner, ...prev]);
                setFormData(prev => ({ ...prev, ownerId: newOwner.id }));
                setSearchOwner(newOwner.name);
                setShowCreateOwner(false);
                setQuickOwnerData({ name: "", phone: "" });
            }
        } finally {
            setCreatingOwner(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ownerId) return alert("Por favor selecciona un dueño");

        setLoading(true);
        let uploadedPhotoUrl = "";

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

            const res = await fetch("/api/pets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, photoUrl: uploadedPhotoUrl })
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ name: "", species: "Perro", breed: "", birthDate: "", ownerId: "", weightKg: "", color: "", photoUrl: "", referralSource: "DIRECTO", clinicId: "" });
                setPreviewUrl(null);
                setSelectedFile(null);
            } else {
                const data = await res.json();
                console.error("Error backend:", data);
                alert(`Error al registrar: ${data.error || "Falla de servidor"}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setUploadingImage(false);
        }
    };

    if (!isOpen) return null;

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
                                <h2 className="text-2xl font-bold aura-gradient bg-clip-text text-transparent">Nueva Mascota</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Registro en el Sistema</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Seleccionar Dueño</label>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre..."
                                            value={searchOwner}
                                            onChange={e => setSearchOwner(e.target.value)}
                                            className="aura-input w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm"
                                        />
                                    </div>
                                    <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {filteredOwners.map(owner => (
                                            <button
                                                key={owner.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, ownerId: owner.id });
                                                    setSearchOwner(owner.name);
                                                    setShowCreateOwner(false);
                                                }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all text-sm flex items-center gap-3 ${formData.ownerId === owner.id
                                                    ? "bg-brand-gold-500/20 border-brand-gold-500/50 text-brand-gold-100"
                                                    : "bg-white/5 border-white/5 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                    <User size={14} />
                                                </div>
                                                {owner.name}
                                            </button>
                                        ))}

                                        {searchOwner && filteredOwners.length === 0 && !showCreateOwner && (
                                            <button
                                                type="button"
                                                onClick={() => { setShowCreateOwner(true); setQuickOwnerData({ name: searchOwner, phone: "" }); }}
                                                className="w-full text-left p-3 rounded-xl border border-dashed border-brand-gold-500/40 hover:border-brand-gold-500/70 bg-brand-gold-500/5 transition-all text-sm flex items-center gap-3 text-brand-gold-400"
                                            >
                                                <UserPlus size={14} />
                                                Crear cliente &quot;{searchOwner}&quot;
                                            </button>
                                        )}

                                        {showCreateOwner && (
                                            <div className="p-4 rounded-xl border border-brand-gold-500/20 bg-brand-gold-500/5 space-y-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold-500">Nuevo Cliente</p>
                                                <input
                                                    type="text"
                                                    value={quickOwnerData.name}
                                                    onChange={e => setQuickOwnerData({ ...quickOwnerData, name: e.target.value })}
                                                    placeholder="Nombre completo"
                                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm"
                                                />
                                                <input
                                                    type="tel"
                                                    value={quickOwnerData.phone}
                                                    onChange={e => setQuickOwnerData({ ...quickOwnerData, phone: e.target.value })}
                                                    placeholder="Teléfono (opcional)"
                                                    className="aura-input w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setShowCreateOwner(false)}
                                                        className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                        Cancelar
                                                    </button>
                                                    <button type="button" onClick={handleQuickCreateOwner}
                                                        disabled={!quickOwnerData.name || creatingOwner}
                                                        className="flex-1 py-2 rounded-xl bg-brand-gold-500 text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                                        {creatingOwner ? "Creando..." : "Crear y Seleccionar"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

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
                                    {uploadingImage ? "Subiendo..." : "Foto de la Mascota (Opcional)"}
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

                            <button
                                disabled={loading || !formData.ownerId || uploadingImage}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading || uploadingImage ? <Loader2 className="animate-spin" size={20} /> : "Vincular Mascota"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
