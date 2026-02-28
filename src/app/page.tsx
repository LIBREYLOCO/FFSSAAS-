"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Users,
  Dog,
  HeartHandshake,
  TrendingUp,
  Clock,
  ChevronRight,
  Settings,
  Map as MapIcon,
  Search,
  Flame,
  AlertCircle,
  CheckCircle2,
  Building2,
  Activity,
  RefreshCcw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const iconMap: Record<string, any> = {
  Users: Users,
  Dog: Dog,
  HeartHandshake: HeartHandshake,
  TrendingUp: TrendingUp,
};

const COLORS = ["#D4AF37", "#8E6F3E", "#A67C52", "#C0C0C0", "#4A4A4A"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  COMPLETED:  { label: "Completado",  color: "text-emerald-400" },
  PROCESS:    { label: "En proceso",  color: "text-blue-400" },
  PENDING:    { label: "Pendiente",   color: "text-brand-gold-400" },
  CANCELLED:  { label: "Cancelado",  color: "text-red-400" },
};

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sucursales, setSucursales] = useState<{ id: string; nombre: string; codigo: string }[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const fetchStats = useCallback((sucursalId?: string) => {
    const url = sucursalId ? `/api/stats?sucursalId=${sucursalId}` : "/api/stats";
    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    fetch("/api/sucursales")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSucursales(Array.isArray(d) ? d.filter((s: any) => s.isActive) : []))
      .catch(() => {});
  }, []);

  const handleSucursalChange = (id: string) => {
    setSelectedSucursal(id);
    fetchStats(id || undefined);
  };

  const quickActions = [
    { label: "Seguimiento", path: "/seguimiento", icon: Search },
    { label: "Mapa Logística", path: "/mapa", icon: MapIcon },
    { label: "Registrar Mascota", path: "/mascotas", icon: Dog },
    { label: "Configuración", path: "/config", icon: Settings },
  ];

  const statsWithConfig = (data?.stats || []).map((stat: any) => {
    const configs: Record<string, { color: string; border: string; glow: string }> = {
      "Clientes Totales": { color: "text-blue-400", border: "group-hover:border-blue-500/50", glow: "from-blue-500/20 to-transparent" },
      "Mascotas Activas":  { color: "text-emerald-400", border: "group-hover:border-emerald-500/50", glow: "from-emerald-500/20 to-transparent" },
      "Planes Previsión":  { color: "text-purple-400", border: "group-hover:border-purple-500/50", glow: "from-purple-500/20 to-transparent" },
      "Ingresos Totales":  { color: "text-brand-gold-400", border: "group-hover:border-brand-gold-500/50", glow: "from-brand-gold-500/20 to-transparent" },
    };
    return { ...stat, config: configs[stat.label] || configs["Ingresos Totales"] };
  });

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto px-4">
      {/* ── Header ───────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-5"
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-brand-gold-500/20 blur-xl rounded-full animate-pulse" />
            <img
              src="/logo.png"
              alt="AURA"
              className="w-16 h-16 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(197,160,89,0.4)]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-5 bg-brand-gold-500/50" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold-500/60">
                Management Terminal
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
              <span className="aura-gradient bg-clip-text text-transparent">FOREVER</span>
              {" "}
              <span className="aura-gradient bg-clip-text text-transparent italic opacity-90">FRIENDS</span>
            </h1>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
              Sistema de Gestión
              <span className="w-1 h-1 rounded-full bg-brand-gold-500 animate-pulse" />
              V1.2.0
            </p>
          </div>
        </motion.div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStats(selectedSucursal || undefined)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-500 hover:text-brand-gold-500 hover:border-brand-gold-500/30 transition-all"
            title="Actualizar"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          {sucursales.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card px-4 py-2.5 rounded-2xl border border-white/5 flex items-center gap-3"
            >
              <Building2 size={16} className="text-brand-gold-500 flex-shrink-0" />
              <select
                value={selectedSucursal}
                onChange={(e) => handleSucursalChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="">Todas las Sedes</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.nombre}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </div>
      </header>

      {/* ── KPI Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(loading ? [1, 2, 3, 4] : statsWithConfig).map((stat: any, index: number) => {
          const Icon = !loading ? (iconMap[stat.icon] || TrendingUp) : TrendingUp;
          const href =
            stat.label === "Clientes Totales" ? "/clientes" :
            stat.label === "Mascotas Activas" ? "/mascotas" :
            stat.label === "Planes Previsión" ? "/prevision" : null;

          const card = (
            <div className={cn(
              "glass-card p-6 rounded-3xl border border-white/5 transition-all duration-500 overflow-hidden h-full",
              !loading && stat.config?.border,
              href && "group cursor-pointer hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
            )}>
              {!loading && (
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br", stat.config?.glow)} />
              )}
              <div className="relative z-10 flex flex-col h-full">
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4",
                  !loading ? stat.config?.color : "text-slate-700"
                )}>
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <p className="text-3xl font-black tracking-tighter italic text-white leading-none mb-1">
                  {loading ? "—" : stat.value}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  {loading ? "Cargando..." : stat.label}
                </p>
              </div>
            </div>
          );

          return (
            <motion.div
              key={loading ? index : stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="relative"
            >
              {href ? <Link href={href} className="block h-full">{card}</Link> : card}
            </motion.div>
          );
        })}
      </div>

      {/* ── Operational Strip ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          {
            label: "Hornos en uso",
            value: loading ? "—" : (data?.ops?.hornosEnUso ?? 0),
            icon: Flame,
            color: data?.ops?.hornosEnUso > 0 ? "text-orange-400" : "text-slate-600",
            bg: data?.ops?.hornosEnUso > 0 ? "bg-orange-500/10" : "bg-white/5",
            border: data?.ops?.hornosEnUso > 0 ? "border-orange-500/30" : "border-white/5",
            href: "/hornos",
            pulse: (data?.ops?.hornosEnUso ?? 0) > 0,
          },
          {
            label: "Cremaciones hoy",
            value: loading ? "—" : (data?.ops?.cremacionesHoy ?? 0),
            icon: Activity,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            href: "/operacion",
            pulse: false,
          },
          {
            label: "Órdenes pendientes",
            value: loading ? "—" : (data?.ops?.ordenesPendientes ?? 0),
            icon: AlertCircle,
            color: (data?.ops?.ordenesPendientes ?? 0) > 0 ? "text-amber-400" : "text-slate-600",
            bg: (data?.ops?.ordenesPendientes ?? 0) > 0 ? "bg-amber-500/10" : "bg-white/5",
            border: (data?.ops?.ordenesPendientes ?? 0) > 0 ? "border-amber-500/20" : "border-white/5",
            href: "/operacion",
            pulse: false,
          },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="group">
            <div className={cn(
              "glass-card p-4 rounded-2xl border flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]",
              item.border
            )}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center relative flex-shrink-0", item.bg)}>
                <item.icon size={18} className={item.color} />
                {item.pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
                )}
              </div>
              <div>
                <p className={cn("text-xl font-black tracking-tight", item.color)}>{item.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{item.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* ── Analytics Row ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card-strong p-8 rounded-[3rem] border border-white/5 h-[420px] relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-brand-gold-500/5 blur-[80px] -z-10 rounded-full" />
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">
                Ingresos & Proyección
              </h4>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                Volumen de ventas — últimos 6 meses
              </p>
            </div>
            <Link href="/reportes" className="text-[9px] font-black uppercase tracking-widest text-brand-gold-500 hover:text-brand-gold-400 transition-colors flex items-center gap-1">
              Ver reportes <ChevronRight size={12} />
            </Link>
          </div>

          <div className="w-full h-[280px]">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-[2rem]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#ffffff04" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff15" fontSize={10} tickLine={false} axisLine={false} dy={8} />
                  <YAxis stroke="#ffffff15" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} dx={-8} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13,26,38,0.95)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      borderRadius: "16px",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(20px)",
                    }}
                    itemStyle={{ color: "#D4AF37", fontWeight: "900", fontSize: "12px" }}
                    labelStyle={{ color: "#64748b", fontSize: "10px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-strong p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between shadow-2xl"
        >
          <div>
            <h4 className="text-xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent mb-0.5">
              Servicios
            </h4>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Distribución por tipo</p>
          </div>

          <div className="w-full h-[180px]">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={72}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    {data?.serviceDistribution?.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13,26,38,0.95)",
                      border: "1px solid rgba(212,175,55,0.1)",
                      borderRadius: "14px",
                      backdropFilter: "blur(10px)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-white/5 pt-4">
            {data?.serviceDistribution?.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {item.name.split("_").join(" ")}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card p-8 rounded-[3rem] border border-white/5 flex flex-col min-h-[420px] shadow-2xl"
        >
          <div className="flex items-center justify-between mb-7">
            <div>
              <h4 className="text-xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">
                Flujo Operativo
              </h4>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Últimos movimientos</p>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl text-brand-gold-500 border border-white/10">
              <Clock size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : (data?.recentActivity?.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 py-16 gap-3">
                <Search size={36} className="opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Sin actividad reciente</p>
              </div>
            ) : (
              data?.recentActivity?.map((activity: any, idx: number) => {
                const s = STATUS_LABELS[activity.status] || { label: activity.status, color: "text-slate-400" };
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + idx * 0.05 }}
                  >
                    <Link
                      href={`/clientes/${activity.ownerId}`}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-brand-gold-500/30 hover:bg-white/[0.05] transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold-500 group-hover:bg-brand-gold-500 group-hover:text-black transition-all border border-white/5 flex-shrink-0">
                        <Dog size={18} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black italic tracking-tight text-white group-hover:text-brand-gold-200 transition-colors truncate">
                          {activity.serviceType === "IMMEDIATE" ? "Cremación Inmediata" : "Servicio Previsión"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] truncate">
                          {activity.pet?.name ?? "—"} · {activity.owner?.name ?? "—"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={cn("text-[9px] font-black uppercase tracking-widest", s.color)}>
                          {s.label}
                        </span>
                        <span className="text-[9px] text-slate-600 font-bold">
                          {new Date(activity.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card-strong p-8 rounded-[3rem] border border-white/5 flex flex-col gap-8 shadow-2xl"
        >
          <div>
            <h4 className="text-xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">Accesos</h4>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Operaciones rápidas</p>
          </div>

          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.path}
                className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-brand-gold-500 transition-all duration-400 hover:shadow-[0_8px_24px_rgba(212,175,55,0.2)] hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-brand-gold-500 group-hover:bg-black transition-all border border-white/5">
                    <action.icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-300 group-hover:text-black transition-colors">
                    {action.label}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          {/* System status */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sistema Operativo</p>
                <p className="text-[10px] font-bold text-slate-500">Todos los servicios activos</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
