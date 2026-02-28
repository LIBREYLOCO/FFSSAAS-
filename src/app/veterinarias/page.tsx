"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Plus, Stethoscope, Heart, Search, X,
  DollarSign, BarChart2, Phone, Mail,
} from "lucide-react";
import RegisterVeterinaryModal from "@/components/RegisterVeterinaryModal";
import EditVeterinaryModal from "@/components/EditVeterinaryModal";
import VetCommissionReportModal from "@/components/VetCommissionReportModal";

function fmt$(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}

export default function VeterinariasPage() {
  const [veterinaries, setVeterinaries]   = useState<any[]>([]);
  const [loading,      setLoading]        = useState(true);
  const [isModalOpen,  setIsModalOpen]    = useState(false);
  const [editingVet,   setEditingVet]     = useState<any | null>(null);
  const [reportVetId,  setReportVetId]    = useState<string | null>(null);
  const [globalReport, setGlobalReport]   = useState(false);
  const [query,        setQuery]          = useState("");

  const fetchVeterinaries = () => {
    setLoading(true);
    fetch("/api/veterinarias")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setVeterinaries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setVeterinaries([]); setLoading(false); });
  };

  useEffect(() => { fetchVeterinaries(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return veterinaries;
    return veterinaries.filter((v) =>
      v.name?.toLowerCase().includes(q) ||
      v.address?.toLowerCase().includes(q) ||
      v.contactName?.toLowerCase().includes(q)
    );
  }, [veterinaries, query]);

  // Stats
  const totalVets     = veterinaries.length;
  const totalReferidas = veterinaries.reduce((s, v) => s + (v._count?.referredPets ?? 0), 0);
  const totalComision = veterinaries.reduce((s, v) => s + (Number(v.fixedFee) || 0) * (v._count?.referredPets ?? 0), 0);

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight aura-gradient bg-clip-text text-transparent">
            Red de Veterinarias
          </h2>
          <p className="text-slate-500 text-sm mt-1">Convenios con clínicas y especialistas aliados.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGlobalReport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-sm font-bold text-slate-300 transition-all"
          >
            <BarChart2 size={16} className="text-brand-gold-500" />
            Reporte Global
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-gold-500 hover:bg-brand-gold-400 text-black font-black rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 text-xs uppercase tracking-widest"
          >
            <Plus size={16} />
            Nueva Veterinaria
          </button>
        </div>
      </header>

      <RegisterVeterinaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchVeterinaries}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Veterinarias", value: totalVets, icon: Stethoscope, color: "text-brand-gold-400", bg: "bg-brand-gold-500/10", border: "border-brand-gold-500/20" },
          { label: "Mascotas referidas", value: totalReferidas, icon: Heart, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
          { label: "Comisiones estimadas", value: fmt$(totalComision), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-5 rounded-2xl border ${s.border} flex items-center gap-4`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className={`text-2xl font-black tracking-tight ${s.color}`}>
                {loading ? "—" : s.value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, dirección o contacto..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-gold-500/40 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results */}
      {!loading && (
        <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest -mt-4">
          {filtered.length} {filtered.length === 1 ? "veterinaria" : "veterinarias"}
          {query && ` para "${query}"`}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card h-52 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center glass-card rounded-3xl border border-white/5 space-y-3"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <Stethoscope className="text-slate-600" size={28} />
          </div>
          <p className="text-slate-500 font-bold">
            {query ? `Sin resultados para "${query}"` : "No hay veterinarias registradas."}
          </p>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-brand-gold-500 hover:text-brand-gold-400 font-bold underline underline-offset-4"
            >
              Limpiar búsqueda
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((vet, idx) => (
              <motion.div
                key={vet.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
                className="glass-card rounded-3xl border border-white/5 overflow-hidden group hover:border-brand-gold-500/30 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(212,175,55,0.1)] transition-all duration-300"
              >
                {/* Top accent bar */}
                <div className="h-1 w-full bg-gradient-to-r from-brand-gold-600 to-brand-gold-400 opacity-70" />

                <div className="p-6 space-y-5">
                  {/* Name + icon */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 flex items-center justify-center flex-shrink-0">
                      <Stethoscope size={22} className="text-brand-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black italic tracking-tight text-white group-hover:text-brand-gold-300 transition-colors leading-tight">
                        {vet.name}
                      </h3>
                      {vet.address && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                          <MapPin size={11} />
                          <span className="truncate">{vet.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-rose-400 mb-1">
                        <Heart size={14} />
                        <span className="text-lg font-black">{vet._count?.referredPets ?? 0}</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Referidas</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
                        <span className="text-lg font-black">{fmt$(Number(vet.fixedFee) || 0)}</span>
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Fijo/Ref.</p>
                    </div>
                  </div>

                  {/* Contact info if available */}
                  {(vet.contactName || vet.phone || vet.email) && (
                    <div className="border-t border-white/5 pt-3 space-y-1.5">
                      {vet.contactName && (
                        <p className="text-xs text-slate-400 font-medium">{vet.contactName}</p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {vet.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Phone size={11} /> {vet.phone}
                          </div>
                        )}
                        {vet.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Mail size={11} /> {vet.email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setEditingVet(vet)}
                      className="flex-1 py-2.5 rounded-xl bg-brand-gold-500/10 hover:bg-brand-gold-500/20 border border-brand-gold-500/20 transition-all text-[10px] font-black uppercase tracking-widest text-brand-gold-400"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setReportVetId(vet.id)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white"
                    >
                      Comisiones
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditVeterinaryModal
        isOpen={!!editingVet}
        onClose={() => setEditingVet(null)}
        onSuccess={fetchVeterinaries}
        vet={editingVet}
      />

      {(reportVetId || globalReport) && (
        <VetCommissionReportModal
          isOpen={true}
          onClose={() => { setReportVetId(null); setGlobalReport(false); }}
          vetId={reportVetId}
        />
      )}
    </div>
  );
}
