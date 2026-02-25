"use client";

import { useEffect, useState } from "react";
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
  Search
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

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const quickActions = [
    { label: "Seguimiento", path: "/seguimiento", icon: Search },
    { label: "Mapa Logística", path: "/mapa", icon: MapIcon },
    { label: "Registrar Mascota", path: "/mascotas", icon: Dog },
    { label: "Configuración", path: "/configuracion", icon: Settings },
  ];

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col"
        >
          <span className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2 border-b border-brand-gold-500/30 w-fit pb-1">
            Panel de Administración
          </span>
          <h2 className="text-5xl font-black tracking-tighter flex flex-col leading-none">
            <span className="aura-gradient bg-clip-text text-transparent">FOREVER</span>
            <span className="aura-gradient bg-clip-text text-transparent italic">FRIENDS</span>
          </h2>
          <p className="text-brand-gold-500/80 text-sm font-bold tracking-[0.3em] uppercase mt-2">
            by Airapí • Cremación & Homenajes
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(data?.stats || [1, 2, 3, 4]).map((stat: any, index: number) => {
          const Icon = iconMap[stat.icon] || TrendingUp;
          const href = stat.label === "Clientes Totales" ? "/clientes" :
            stat.label === "Mascotas Activas" ? "/mascotas" :
              stat.label === "Planes Previsión" ? "/prevision" : null;

          const CardContent = (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className={cn(
                "glass-card p-6 rounded-3xl h-full transition-all duration-300",
                loading ? "animate-pulse" : href ? "hover:border-brand-gold-500/50 hover:bg-white/10 cursor-pointer group" : ""
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-2xl bg-white/5 transition-colors",
                  !loading && stat.color ? stat.color : "text-slate-400",
                  href && "group-hover:bg-brand-gold-500 group-hover:text-black"
                )}>
                  {!loading && <Icon size={24} />}
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-brand-gold-500">Global</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl font-bold tracking-tighter italic group-hover:text-white transition-colors">
                  {loading ? "---" : stat.value}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300">{stat.label}</p>
              </div>
            </motion.div>
          );

          const uniqueKey = stat.label || index;

          return href && !loading ? (
            <Link key={uniqueKey} href={href}>
              {CardContent}
            </Link>
          ) : (
            <div key={uniqueKey}>{CardContent}</div>
          );
        })}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-card p-8 rounded-[40px] h-[400px]"
        >
          <h4 className="text-xl font-bold italic tracking-tighter text-brand-gold-100 mb-6">Ingresos Mensuales</h4>
          <div className="w-full h-[300px]">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-3xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#ffffff40"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#ffffff40"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D4AF37"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Service Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-8 rounded-[40px] flex flex-col items-center justify-center text-center"
        >
          <h4 className="text-xl font-bold italic tracking-tighter text-brand-gold-100 w-full text-left mb-6">Servicios</h4>
          <div className="w-full h-[250px]">
            {loading ? (
              <div className="w-full h-full bg-white/5 animate-pulse rounded-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.serviceDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data?.serviceDistribution?.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 w-full text-left">
            {data?.serviceDistribution?.map((item: any, i: number) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-slate-400 capitalize">{item.name.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 glass-card p-8 rounded-[40px] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-bold italic tracking-tighter text-brand-gold-100">Actividad Reciente</h4>
            <div className="p-2 bg-white/5 rounded-xl text-slate-500">
              <Clock size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
              ))
            ) : data?.recentActivity?.length === 0 ? (
              <div className="text-center py-10 opacity-50 italic">No hay actividad registrada</div>
            ) : (
              data?.recentActivity?.map((activity: any) => (
                <Link
                  key={activity.id}
                  href={`/clientes/${activity.ownerId}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-brand-gold-500/30 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 group-hover:bg-brand-gold-500 group-hover:text-black transition-colors">
                    <Dog size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-brand-gold-100 transition-colors">
                      {activity.serviceType === 'IMMEDIATE' ? 'Cremación Inmediata' : 'Servicio de Previsión'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {activity.pet?.name || 'Mascota'} • {activity.owner?.name || 'Cliente'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${activity.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                      activity.status === 'PROCESS' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-brand-gold-500/10 text-brand-gold-500'
                      }`}>
                      {activity.status}
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1 font-mono">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-8 rounded-[40px] space-y-6"
        >
          <h4 className="text-xl font-bold italic tracking-tighter text-brand-gold-100">Acciones Rápidas</h4>
          <div className="space-y-4">
            {quickActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.path}
                className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-gold-500/10 flex items-center justify-center text-brand-gold-500 group-hover:scale-110 transition-transform">
                    <action.icon size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors capitalize">
                    {action.label.toLowerCase()}
                  </span>
                </div>
                <ChevronRight size={18} className="text-slate-600 group-hover:text-brand-gold-500 transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
