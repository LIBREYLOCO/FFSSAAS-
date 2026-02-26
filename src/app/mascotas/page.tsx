"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dog, Search, User, Calendar, Plus, Edit2 } from "lucide-react";
import RegisterPetModal from "@/components/RegisterPetModal";
import EditPetModal from "@/components/EditPetModal";

export default function MascotasPage() {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPetToEdit, setSelectedPetToEdit] = useState<any>(null);

    const fetchPets = () => {
        setLoading(true);
        fetch("/api/pets")
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                setPets(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch pets error:", err);
                setPets([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPets();
    }, []);

    const filteredPets = Array.isArray(pets) ? pets.filter(pet =>
        pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pet.species?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold italic tracking-tight">Gestión de Mascotas</h2>
                    <p className="text-slate-400">Listado completo de compañeros fieles.</p>
                </div>
                <button
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus size={20} />
                    Registrar Mascota
                </button>
            </header>

            <RegisterPetModal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                onSuccess={fetchPets}
            />

            <EditPetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchPets}
                pet={selectedPetToEdit}
            />

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar mascota por nombre, especie o dueño..."
                    className="bg-transparent border-none outline-none flex-1 text-slate-200 placeholder:text-slate-500"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card h-64 rounded-3xl animate-pulse" />
                    ))
                ) : filteredPets.length === 0 ? (
                    <div className="col-span-full py-20 text-center space-y-4 glass-card rounded-3xl">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                            <Dog className="text-slate-600" />
                        </div>
                        <p className="text-slate-500">No se encontraron mascotas que coincidan.</p>
                    </div>
                ) : (
                    filteredPets.map((pet) => (
                        <motion.div
                            key={pet.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-6 rounded-3xl group"
                        >
                            <div className="relative mb-6">
                                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-brand-gold-600/20 to-accent-500/10 flex items-center justify-center text-brand-gold-500 transition-transform group-hover:scale-105 overflow-hidden">
                                    {pet.photoUrl ? (
                                        <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Dog size={48} strokeWidth={1.5} />
                                    )}
                                </div>
                                <div className="absolute top-2 right-2 px-3 py-1 bg-bg-deep/80 backdrop-blur rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-wider text-brand-gold-500">
                                    {pet.species}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedPetToEdit(pet);
                                        setIsEditModalOpen(true);
                                    }}
                                    className="absolute top-2 left-2 p-1.5 bg-bg-deep/80 backdrop-blur rounded-lg border border-white/10 text-slate-400 hover:text-brand-gold-500 transition-colors z-10"
                                    title="Editar Mascota"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold mb-1">{pet.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                <User size={12} /> {pet.owner?.name}
                            </p>

                            <div className="space-y-2 text-xs text-slate-400">
                                {pet.birthDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-500" />
                                        <span>Nació: {new Date(pet.birthDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="p-2 bg-white/5 rounded-xl border border-white/5 mt-4">
                                    <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">Estado</p>
                                    <span className={pet.deathDate ? "text-brand-gold-500" : "text-emerald-500"}>
                                        {pet.deathDate ? "En memoria" : "Vivo / Activo"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
