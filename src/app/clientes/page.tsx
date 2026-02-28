"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Dog,
  Plus,
  Phone,
  Mail,
  HeartHandshake,
  Activity,
  ChevronRight,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import RegisterClientModal from "@/components/RegisterClientModal";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : parts[0].slice(0, 2);
  return <span className="font-black text-lg tracking-tight">{letters.toUpperCase()}</span>;
}

const AVATAR_COLORS = [
  "from-brand-gold-600 to-brand-gold-400",
  "from-blue-600 to-blue-400",
  "from-emerald-600 to-emerald-400",
  "from-purple-600 to-purple-400",
  "from-rose-600 to-rose-400",
  "from-cyan-600 to-cyan-400",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

type View = "grid" | "list";
type Filter = "todos" | "prevision" | "inmediato";

export default function ClientesPage() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("grid");
  const [filter, setFilter] = useState<Filter>("todos");

  const fetchOwners = () => {
    setLoading(true);
    fetch("/api/owners")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setOwners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setOwners([]); setLoading(false); });
  };

  useEffect(() => { fetchOwners(); }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return owners.filter((o) => {
      const matchQuery =
        !q ||
        o.name?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q);

      const matchFilter =
        filter === "todos" ||
        (filter === "prevision" && (o.contracts?.length ?? 0) > 0) ||
        (filter === "inmediato" && (o.serviceOrders?.length ?? 0) > 0);

      return matchQuery && matchFilter;
    });
  }, [owners, query, filter]);

  // Stats
  const totalClientes = owners.length;
  const conPrevision = owners.filter((o) => (o.contracts?.length ?? 0) > 0).length;
  const conServicio = owners.filter((o) => (o.serviceOrders?.length ?? 0) > 0).length;

  const stats = [
    { label: "Total Clientes", value: totalClientes, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { label: "Con Previsión", value: conPrevision, icon: HeartHandshake, color: "text-brand-gold-400", bg: "bg-brand-gold-500/10", border: "border-brand-gold-500/20" },
    { label: "Con Servicio", value: conServicio, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tight aura-gradient bg-clip-text text-transparent">
            Gestión de Clientes
          </h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Dueños registrados y sus historias de servicio
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-brand-gold-500 hover:bg-brand-gold-400 text-black font-black rounded-2xl transition-all shadow-[0_8px_24px_rgba(212,175,55,0.25)] hover:-translate-y-0.5 text-xs uppercase tracking-widest w-fit"
        >
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </header>

      <RegisterClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchOwners}
      />

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-card p-5 rounded-2xl border ${s.border} flex items-center gap-4`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.border} border flex items-center justify-center ${s.color}`}>
              <s.icon size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {loading ? "—" : s.value}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search box */}
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={16}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
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

        {/* Filter chips */}
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5">
          {(["todos", "prevision", "inmediato"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-brand-gold-500 text-black shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {f === "todos" ? "Todos" : f === "prevision" ? "Previsión" : "Servicios"}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 gap-1">
          <button
            onClick={() => setView("grid")}
            className={`p-2 rounded-xl transition-all ${view === "grid" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-xl transition-all ${view === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest -mt-4">
          {filtered.length} {filtered.length === 1 ? "cliente" : "clientes"} encontrados
          {query && ` para "${query}"`}
        </p>
      )}

      {/* Grid / List */}
      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={`glass-card animate-pulse rounded-3xl ${view === "grid" ? "h-52" : "h-20"}`} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full py-24 text-center space-y-4 glass-card rounded-3xl"
        >
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/10">
            <Users className="text-slate-600" size={28} />
          </div>
          <p className="text-slate-500 font-bold">
            {query ? `Sin resultados para "${query}"` : "No hay clientes registrados aún."}
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
      ) : view === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((owner, idx) => (
              <motion.div
                key={owner.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Link
                  href={`/clientes/${owner.id}`}
                  className="block glass-card p-6 rounded-3xl border border-white/5 hover:border-brand-gold-500/40 transition-all duration-300 group hover:shadow-[0_8px_32px_rgba(212,175,55,0.12)] hover:-translate-y-1"
                >
                  {/* Avatar + badges */}
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarColor(owner.name)} flex items-center justify-center text-white shadow-lg`}>
                      <Initials name={owner.name} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-start justify-end">
                      {(owner.contracts?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-brand-gold-500/10 text-brand-gold-400 py-1 px-2.5 rounded-full border border-brand-gold-500/20">
                          <HeartHandshake size={10} />
                          Previsión
                        </span>
                      )}
                      {(owner.serviceOrders?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 py-1 px-2.5 rounded-full border border-blue-500/20">
                          <Activity size={10} />
                          Servicio
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name + pets */}
                  <div className="mb-4">
                    <h3 className="text-lg font-black italic tracking-tight text-white group-hover:text-brand-gold-300 transition-colors leading-tight">
                      {owner.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                      <Dog size={12} />
                      <span className="font-bold">{owner._count?.pets ?? 0} mascota{owner._count?.pets !== 1 ? "s" : ""}</span>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 text-sm text-slate-400">
                    {owner.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-slate-600 flex-shrink-0" />
                        <span className="truncate text-xs">{owner.phone}</span>
                      </div>
                    )}
                    {owner.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-600 flex-shrink-0" />
                        <span className="truncate text-xs">{owner.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                      {(owner.contracts?.length ?? 0) + (owner.serviceOrders?.length ?? 0)} {((owner.contracts?.length ?? 0) + (owner.serviceOrders?.length ?? 0)) === 1 ? "servicio" : "servicios"}
                    </span>
                    <span className="text-[10px] font-black text-brand-gold-500 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver perfil <ChevronRight size={12} />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* List view */
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((owner, idx) => (
              <motion.div
                key={owner.id}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Link
                  href={`/clientes/${owner.id}`}
                  className="flex items-center gap-4 p-4 glass-card rounded-2xl border border-white/5 hover:border-brand-gold-500/30 transition-all duration-200 group hover:bg-white/[0.04]"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(owner.name)} flex items-center justify-center text-white flex-shrink-0 text-sm font-black`}>
                    {owner.name.trim().split(/\s+/).map((p: string) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm group-hover:text-brand-gold-300 transition-colors truncate">{owner.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {owner.phone && <span className="text-[11px] text-slate-500">{owner.phone}</span>}
                      {owner.email && <span className="text-[11px] text-slate-500 truncate">{owner.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      <Dog size={12} /> {owner._count?.pets ?? 0}
                    </span>
                    {(owner.contracts?.length ?? 0) > 0 && (
                      <span className="text-[9px] font-black bg-brand-gold-500/10 text-brand-gold-400 px-2 py-0.5 rounded-full border border-brand-gold-500/20 uppercase tracking-widest">
                        Prev.
                      </span>
                    )}
                    <ChevronRight size={16} className="text-slate-600 group-hover:text-brand-gold-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
