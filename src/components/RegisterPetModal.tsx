"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Dog, User, Calendar, Loader2, Search } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterPetModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState<any[]>([]);
    const [searchOwner, setSearchOwner] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        species: "Perro",
        breed: "",
        birthDate: "",
        ownerId: "",
        weightKg: "",
        color: ""
    });

    useEffect(() => {
        if (isOpen) {
            fetch("/api/owners")
                .then(res => res.json())
                .then(setOwners);
        }
    }, [isOpen]);

    const filteredOwners = owners.filter(o =>
        o.name.toLowerCase().includes(searchOwner.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.ownerId) return alert("Por favor selecciona un dueño");

        setLoading(true);
        try {
            const res = await fetch("/api/pets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                onSuccess();
                onClose();
                setFormData({ name: "", species: "Perro", breed: "", birthDate: "", ownerId: "", weightKg: "", color: "" });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
                                    </div>
                                </div>
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
                                disabled={loading || !formData.ownerId}
                                type="submit"
                                className="btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group mt-4 font-bold"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : "Vincular Mascota"}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
