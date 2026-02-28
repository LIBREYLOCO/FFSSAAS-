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
  UserPlus,
  Settings,
  Map as MapIcon,
  Search,
  FlaskConical,
  Trash2,
  RefreshCcw,
  CheckCircle2,
  Building2,
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
  Cell
} from "recharts";

const iconMap: Record<string, any> = {
  Users: Users,
  Dog: Dog,
  HeartHandshake: HeartHandshake,
  TrendingUp: TrendingUp
};

const COLORS = ['#D4AF37', '#8E6F3E', '#A67C52', '#C0C0C0', '#4A4A4A'];

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");
  const [sucursales, setSucursales] = useState<{ id: string; nombre: string; codigo: string }[]>([]);
  const [selectedSucursal, setSelectedSucursal] = useState("");

  const fetchStats = useCallback((sucursalId?: string) => {
    const url = sucursalId ? `/api/stats?sucursalId=${sucursalId}` : "/api/stats";
    fetch(url)
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const runDemo = async (action: "load" | "clear") => {
    setDemoLoading(true);
    setDemoMsg("");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await res.json();
      setDemoMsg(result.message || (action === "load" ? "✅ Datos cargados" : "🗑️ Datos eliminados"));
      setTimeout(() => { setDemoMsg(""); fetchStats(selectedSucursal || undefined); }, 3000);
    } catch {
      setDemoMsg("❌ Error al procesar la acción");
    } finally {
      setDemoLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [fetchStats]);

  useEffect(() => {
    fetch("/api/sucursales")
      .then(r => r.ok ? r.json() : [])
      .then(d => setSucursales(Array.isArray(d) ? d.filter((s: any) => s.isActive) : []))
      .catch(() => { });
  }, []);

  const handleSucursalChange = (id: string) => {
    setSelectedSucursal(id);
    setLoading(true);
    fetchStats(id || undefined);
  };

  const quickActions = [
    { label: "Seguimiento", path: "/seguimiento", icon: Search },
    { label: "Mapa Logística", path: "/mapa", icon: MapIcon },
    { label: "Registrar Mascota", path: "/mascotas", icon: Dog },
    { label: "Configuración", path: "/config", icon: Settings },
  ];

  const statsWithConfig = (data?.stats || []).map((stat: any, index: number) => {
    const configs: Record<string, { color: string; border: string; glow: string }> = {
      "Clientes Totales": { color: "text-blue-400", border: "group-hover:border-blue-500/50", glow: "from-blue-500/20 to-transparent" },
      "Mascotas Activas": { color: "text-emerald-400", border: "group-hover:border-emerald-500/50", glow: "from-emerald-500/20 to-transparent" },
      "Planes Previsión": { color: "text-purple-400", border: "group-hover:border-purple-500/50", glow: "from-purple-500/20 to-transparent" },
      "Ingresos Mes": { color: "text-brand-gold-400", border: "group-hover:border-brand-gold-500/50", glow: "from-brand-gold-500/20 to-transparent" },
    };
    return { ...stat, config: configs[stat.label] || configs["Ingresos Mes"] };
  });

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative group"
        >
          <div className="absolute -inset-4 bg-brand-gold-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-10 bg-brand-gold-500/50" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold-500/60">
                Aura Management Terminal
              </span>
            </div>
            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">
              <span className="aura-gradient bg-clip-text text-transparent">FOREVER</span>
              <br />
              <span className="aura-gradient bg-clip-text text-transparent italic opacity-90">FRIENDS</span>
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-3 flex items-center gap-2">
              SISTEMA DE GESTIÓN <span className="w-1.5 h-1.5 rounded-full bg-brand-gold-500 animate-pulse" /> V1.0.4
            </p>
          </div>
        </motion.div>

        {sucursales.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-1.5 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl flex items-center shadow-2xl"
          >
            <div className="flex items-center gap-4 px-6 py-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 border border-brand-gold-500/20">
                <Building2 size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sede Operativa</span>
                <select
                  value={selectedSucursal}
                  onChange={(e) => handleSucursalChange(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none pr-8"
                >
                  <option value="">Todas las Sedes</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id} className="bg-slate-900">{s.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(loading ? [1, 2, 3, 4] : statsWithConfig).map((stat: any, index: number) => {
          const Icon = !loading ? (iconMap[stat.icon] || TrendingUp) : TrendingUp;
          const href = stat.label === "Clientes Totales" ? "/clientes" :
            stat.label === "Mascotas Activas" ? "/mascotas" :
              stat.label === "Planes Previsión" ? "/prevision" : null;

          return (
            <motion.div
              key={loading ? index : stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
              className="group relative"
            >
              <Link href={href || "#"} className={cn(
                "block h-full glass-card p-10 rounded-[3rem] border border-white/5 transition-all duration-700 overflow-hidden",
                !loading && stat.config.border,
                !href && "cursor-default"
              )}>
                {/* Glow Effect */}
                {!loading && (
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br", stat.config.glow)} />
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:scale-110",
                      !loading ? stat.config.color : "text-slate-700"
                    )}>
                      <Icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-brand-gold-500 transition-colors">AURA</span>
                      <div className="h-1 w-4 bg-white/10 rounded-full mt-1 group-hover:w-8 group-hover:bg-brand-gold-500 transition-all duration-500" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-4xl lg:text-5xl font-black tracking-tighter italic text-white mb-1 group-hover:scale-105 origin-left transition-transform duration-500 leading-none">
                      {loading ? "---" : stat.value}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                      {loading ? "Cargando..." : stat.label}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card-strong p-10 rounded-[4rem] border border-white/5 h-[500px] relative overflow-hidden group shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold-500/5 blur-[100px] -z-10" />

          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">Ingresos & Proyección</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Volumen de ventas mensual</p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">2024</div>
            </div>
          </div>

          <div className="w-full h-[320px]">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-[2.5rem]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" stroke="#ffffff05" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff20"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#ffffff20"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 26, 38, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '24px',
                      boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(20px)'
                    }}
                    itemStyle={{ color: '#D4AF37', fontWeight: '900', fontSize: '12px' }}
                    labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '10px', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Service Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-strong p-10 rounded-[4rem] border border-white/5 flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-2xl"
        >
          <div className="w-full text-left">
            <h4 className="text-2xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent mb-1">Servicios</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Distribución por tipo</p>
          </div>

          <div className="w-full h-[220px] relative">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {data?.serviceDistribution?.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 26, 38, 0.9)',
                      border: '1px solid rgba(212, 175, 55, 0.1)',
                      borderRadius: '20px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full text-left pt-6 border-t border-white/5">
            {data?.serviceDistribution?.map((item: any, i: number) => (
              <div key={item.name} className="flex flex-col gap-0.5 group/item">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover/item:text-slate-300 transition-colors">
                    {item.name.split('_').join(' ')}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400 pl-3.5 italic">{item.value} serv.</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card p-10 rounded-[4rem] border border-white/5 overflow-hidden flex flex-col min-h-[500px] shadow-2xl relative"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className="text-2xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">Flujo Operativo</h4>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Últimos movimientos registrados</p>
            </div>
            <div className="p-3 bg-white/5 rounded-2xl text-brand-gold-500 border border-white/10 group hover:bg-brand-gold-500 hover:text-black transition-all cursor-pointer">
              <Clock size={20} className="group-hover:rotate-12 transition-transform" />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 rounded-[2rem] bg-white/5 animate-pulse" />
              ))
            ) : data?.recentActivity?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 italic py-20">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Sin actividad reciente</p>
              </div>
            ) : (
              data?.recentActivity?.map((activity: any, idx: number) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + (idx * 0.05) }}
                >
                  <Link
                    href={`/clientes/${activity.ownerId}`}
                    className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.03] group hover:border-brand-gold-500/40 hover:bg-white/[0.06] transition-all duration-500 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-brand-gold-500 group-hover:scale-110 group-hover:bg-brand-gold-500 group-hover:text-black transition-all duration-500 border border-white/5 shadow-xl">
                      <Dog size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-black italic tracking-tight text-white group-hover:text-brand-gold-200 transition-colors">
                        {activity.serviceType === 'IMMEDIATE' ? 'CREMACIÓN INMEDIATA' : 'SERVICIO PREVISIÓN'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-slate-400">
                        {activity.pet?.name || '---'} • {activity.owner?.name || '---'}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className={cn(
                        "text-[9px] font-black px-4 py-1.5 rounded-full border tracking-widest uppercase transition-all duration-500",
                        activity.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          activity.status === 'PROCESS' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            'bg-brand-gold-500/10 border-brand-gold-500/20 text-brand-gold-400'
                      )}>
                        {activity.status}
                      </span>
                      <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                        {new Date(activity.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card-strong p-10 rounded-[4rem] border border-white/5 space-y-10 shadow-2xl relative"
        >
          <div>
            <h4 className="text-2xl font-black italic tracking-tighter aura-gradient bg-clip-text text-transparent">Accesos</h4>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Operaciones rápidas</p>
          </div>

          <div className="space-y-4">
            {quickActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.path}
                className="w-full p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-between group hover:bg-brand-gold-500 transition-all duration-500 hover:shadow-[0_15px_30px_rgba(212,175,55,0.2)] hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-brand-gold-500 group-hover:bg-black group-hover:text-brand-gold-500 transition-all duration-500 border border-white/5">
                    <action.icon size={22} strokeWidth={1.5} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300 group-hover:text-black transition-colors">
                    {action.label}
                  </span>
                </div>
                <ChevronRight size={20} className="text-slate-700 group-hover:text-black group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-white/5 opacity-50">
            <div className="flex items-center gap-4 p-6 rounded-3xl bg-white/5 border border-white/5">
              <TrendingUp className="text-brand-gold-500" size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rendimiento</p>
                <p className="text-xs font-bold text-white">+12.5% vs mes anterior</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
