"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Dog, Search, User, Calendar, Plus, Edit2, FileText, Activity } from "lucide-react";
import RegisterPetModal from "@/components/RegisterPetModal";
import EditPetModal from "@/components/EditPetModal";
import PetHistoryModal from "@/components/PetHistoryModal";
import Link from "next/link";

export default function MascotasPage() {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedPetToEdit, setSelectedPetToEdit] = useState<any>(null);
    const [selectedPetForHistory, setSelectedPetForHistory] = useState<any>(null);

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

            <PetHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                pet={selectedPetForHistory}
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

                                <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
                                    <button
                                        onClick={() => {
                                            setSelectedPetToEdit(pet);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 bg-bg-deep/80 backdrop-blur rounded-lg border border-white/10 text-slate-400 hover:text-brand-gold-500 transition-colors flex items-center justify-center"
                                        title="Editar Mascota"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                {/* Floating Action Buttons on Hover */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 rounded-2xl">
                                    <button
                                        onClick={() => {
                                            setSelectedPetForHistory(pet);
                                            setIsHistoryModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-brand-gold-500 text-bg-deep font-bold text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center gap-2"
                                    >
                                        <Activity size={14} /> Ver Historial
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            if (!pet.owner?.id) {
                                                alert("Esta mascota no tiene un dueño asignado aún.");
                                                e.preventDefault();
                                                return;
                                            }
                                            window.location.href = `/clientes/${pet.owner.id}?newOrder=true&petId=${pet.id}`;
                                        }}
                                        className="px-4 py-2 bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
                                    >
                                        <FileText size={14} /> Nueva Orden
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-1">{pet.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                                <User size={12} /> {pet.owner?.name}
                            </p>

                            <div className="space-y-3 text-xs text-slate-400 border-t border-white/5 pt-4">
                                {pet.birthDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-slate-500" />
                                        <span>Nació: {new Date(pet.birthDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Estado Vital</span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${pet.deathDate ? "bg-brand-gold-500/10 text-brand-gold-400 border-brand-gold-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                                        {pet.deathDate ? "En memoria" : "Vivo"}
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
