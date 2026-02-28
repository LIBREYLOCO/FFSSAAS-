"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart2, Flame, TrendingUp, Users2, Filter, Download,
  RefreshCcw, Calendar, Building2, Loader2,
  Activity, Clock, DollarSign, CheckCircle2, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Sucursal { id: string; nombre: string; codigo: string; }
interface Horno    { id: string; nombre: string; codigo: string; }
interface Vendedor { id: string; name: string; level: string; }

type ReportType = "servicios" | "ingresos" | "cremaciones" | "comisiones";

const TABS: { id: ReportType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: "servicios",   label: "Servicios",   icon: BarChart2,  color: "text-brand-gold-400", bg: "bg-brand-gold-500/10" },
  { id: "ingresos",    label: "Ingresos",    icon: TrendingUp, color: "text-emerald-400",    bg: "bg-emerald-500/10"    },
  { id: "cremaciones", label: "Cremaciones", icon: Flame,      color: "text-orange-400",     bg: "bg-orange-500/10"     },
  { id: "comisiones",  label: "Comisiones",  icon: Users2,     color: "text-purple-400",     bg: "bg-purple-500/10"     },
];

const STATUS_LABELS: Record<string, string> = {
  PENDING_PICKUP:     "Pendiente recolección",
  IN_TRANSIT:         "En tránsito",
  AT_CREMATORY:       "En crematorio",
  CREMATING:          "En cremación",
  READY_FOR_DELIVERY: "Listo para entrega",
  DELIVERED:          "Entregado",
  COMPLETED:          "Completado",
  PENDING:            "Pendiente",
  PROCESS:            "En proceso",
  CANCELLED:          "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PICKUP:     "bg-amber-500/15 text-amber-400 border-amber-500/20",
  IN_TRANSIT:         "bg-blue-500/15 text-blue-400 border-blue-500/20",
  AT_CREMATORY:       "bg-orange-500/15 text-orange-400 border-orange-500/20",
  CREMATING:          "bg-red-500/15 text-red-400 border-red-500/20",
  READY_FOR_DELIVERY: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  DELIVERED:          "bg-sky-500/15 text-sky-400 border-sky-500/20",
  COMPLETED:          "bg-slate-500/15 text-slate-300 border-slate-500/20",
  PENDING:            "bg-amber-500/15 text-amber-400 border-amber-500/20",
  PROCESS:            "bg-blue-500/15 text-blue-400 border-blue-500/20",
  CANCELLED:          "bg-red-500/15 text-red-400 border-red-500/20",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt$(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", { dateStyle: "short" });
}
function duracion(inicio: string, fin?: string | null) {
  const ms = new Date(fin ?? new Date()).getTime() - new Date(inicio).getTime();
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function exportCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return;
  const keys   = Object.keys(rows[0]);
  const header = keys.join(",");
  const body   = rows.map((r) =>
    keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
}

// ─── Shared components ───────────────────────────────────────────────────────

function KpiCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: string | number; icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 flex items-center gap-4 border border-white/5">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="glass-card rounded-2xl py-16 text-center space-y-3 border border-white/5">
      <AlertCircle size={32} className="mx-auto text-slate-600 opacity-50" />
      <p className="text-slate-500 text-sm font-bold">{message}</p>
    </div>
  );
}

function TableCard({ title, count, onExport, children }: {
  title: string; count: number; onExport: () => void; children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
        <p className="text-sm font-bold text-white">{count} {title}</p>
        <button onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 transition-all">
          <Download size={12} /> CSV
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="glass-card-strong rounded-2xl p-6 border border-white/5 space-y-4">
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const tooltipStyle = {
  contentStyle: { background: "rgba(10,14,20,0.97)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" },
  itemStyle: { fontWeight: 700 },
  labelStyle: { color: "#64748b", fontSize: 10, fontWeight: "bold" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportesPage() {
  const [tab,     setTab]     = useState<ReportType>("servicios");
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState<any>(null);

  const today = new Date().toISOString().slice(0, 10);
  const month = new Date(new Date().setDate(1)).toISOString().slice(0, 10);
  const [from, setFrom] = useState(month);
  const [to,   setTo]   = useState(today);

  const [sucursales,    setSucursales]    = useState<Sucursal[]>([]);
  const [hornos,        setHornos]        = useState<Horno[]>([]);
  const [vendedores,    setVendedores]    = useState<Vendedor[]>([]);
  const [sucursalId,    setSucursalId]    = useState("");
  const [status,        setStatus]        = useState("");
  const [serviceType,   setServiceType]   = useState("");
  const [hornoId,       setHornoId]       = useState("");
  const [salespersonId, setSalespersonId] = useState("");

  useEffect(() => {
    fetch("/api/sucursales").then(r => r.ok ? r.json() : []).then(setSucursales).catch(() => {});
    fetch("/api/hornos").then(r => r.ok ? r.json() : []).then(setHornos).catch(() => {});
    fetch("/api/vendedores").then(r => r.ok ? r.json() : []).then(setVendedores).catch(() => {});
  }, []);

  const loadReport = useCallback(async () => {
    setLoading(true); setData(null);
    try {
      const p = new URLSearchParams({ tipo: tab, from, to });
      if (sucursalId)    p.set("sucursalId",    sucursalId);
      if (status)        p.set("status",        status);
      if (serviceType)   p.set("serviceType",   serviceType);
      if (hornoId)       p.set("hornoId",       hornoId);
      if (salespersonId) p.set("salespersonId", salespersonId);
      const res = await fetch(`/api/reportes?${p}`);
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, [tab, from, to, sucursalId, status, serviceType, hornoId, salespersonId]);

  useEffect(() => { loadReport(); }, [loadReport]);

  useEffect(() => {
    setStatus(""); setServiceType(""); setHornoId(""); setSalespersonId("");
  }, [tab]);

  const applyPreset = (days: number) => {
    const t = new Date();
    const f = new Date(t.getTime() - days * 86400000);
    setFrom(f.toISOString().slice(0, 10));
    setTo(t.toISOString().slice(0, 10));
  };

  const activeTab = TABS.find(t => t.id === tab)!;

  return (
    <div className="space-y-8 pb-16">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-600 mb-2">Análisis</p>
          <h2 className="text-4xl font-black tracking-tighter aura-gradient bg-clip-text text-transparent">
            Reportes
          </h2>
          <p className="text-slate-500 text-sm mt-1">Analiza el desempeño por período, sucursal y categoría.</p>
        </div>
        <button onClick={loadReport} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-white/10 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all hover:border-white/20 disabled:opacity-50">
          <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </header>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border ${
              tab === t.id
                ? `${t.bg} ${t.color} border-current/30 shadow-[0_4px_16px_rgba(0,0,0,0.3)]`
                : "bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 hover:border-white/10"
            }`}>
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
          <Filter size={12} className="text-slate-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Filtros</span>
        </div>
        <div className="p-4 space-y-3">
          {/* Date presets */}
          <div className="flex flex-wrap items-center gap-2">
            {[["Hoy",0],["7 días",7],["30 días",30],["3 meses",90],["Este año",365]].map(([label,days]) => (
              <button key={label} onClick={() => applyPreset(Number(days))}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors font-bold">
                {label}
              </button>
            ))}
            <div className="flex items-center gap-2 border-l border-white/10 pl-3 ml-1">
              <Calendar size={12} className="text-slate-500" />
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-gold-500/40" />
              <span className="text-slate-600 text-xs">—</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-brand-gold-500/40" />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="flex flex-wrap gap-2">
            {sucursales.length > 0 && (
              <select value={sucursalId} onChange={e => setSucursalId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white min-w-[160px] focus:outline-none focus:border-brand-gold-500/40">
                <option value="">Todas las sucursales</option>
                {sucursales.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.nombre}</option>)}
              </select>
            )}
            {tab === "servicios" && <>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none">
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v}</option>)}
              </select>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none">
                <option value="">Todos los tipos</option>
                <option value="IMMEDIATE" className="bg-slate-900">Cremación Inmediata</option>
                <option value="PREVISION" className="bg-slate-900">Previsión Activada</option>
              </select>
            </>}
            {tab === "cremaciones" && hornos.length > 0 && (
              <select value={hornoId} onChange={e => setHornoId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white focus:outline-none">
                <option value="">Todos los hornos</option>
                {hornos.map(h => <option key={h.id} value={h.id} className="bg-slate-900">{h.nombre} ({h.codigo})</option>)}
              </select>
            )}
            {tab === "comisiones" && vendedores.length > 0 && (
              <select value={salespersonId} onChange={e => setSalespersonId(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white min-w-[180px] focus:outline-none">
                <option value="">Todos los vendedores</option>
                {vendedores.map(v => <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className={`w-12 h-12 rounded-2xl ${activeTab.bg} flex items-center justify-center`}>
            <activeTab.icon size={20} className={`${activeTab.color} animate-pulse`} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Generando reporte…</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          SERVICIOS
      ════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        {!loading && data && tab === "servicios" && (
          <motion.div key="servicios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Total órdenes"  value={data.total ?? 0}                               icon={BarChart2}  color="text-white"           bg="bg-white/10" />
              <KpiCard label="Ingresos"        value={fmt$(data.totalRevenue ?? 0)}                  icon={DollarSign} color="text-emerald-400"       bg="bg-emerald-500/10" />
              <KpiCard label="Completados"     value={data.byStatus?.COMPLETED ?? 0}                icon={CheckCircle2} color="text-emerald-400"     bg="bg-emerald-500/10" />
              <KpiCard label="En proceso"      value={(data.total ?? 0) - (data.byStatus?.COMPLETED ?? 0)} icon={Activity} color="text-brand-gold-400" bg="bg-brand-gold-500/10" />
            </div>

            {/* Status chips */}
            {data.byStatus && Object.keys(data.byStatus).length > 0 && (
              <div className="glass-card rounded-2xl p-4 border border-white/5 flex flex-wrap gap-2">
                {Object.entries(data.byStatus as Record<string, number>).map(([k, v]) => (
                  <div key={k} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${STATUS_COLORS[k] ?? "bg-white/5 text-slate-400 border-white/10"}`}>
                    {STATUS_LABELS[k] ?? k}
                    <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table */}
            <TableCard title="órdenes" count={data.orders?.length ?? 0}
              onExport={() => exportCSV((data.orders ?? []).map((o: any) => ({
                Folio: o.folio, Estado: STATUS_LABELS[o.status] ?? o.status, Tipo: o.serviceType,
                Mascota: o.pet?.name, Dueño: o.owner?.name, Sucursal: o.sucursal?.nombre, Total: o.totalCost,
                Certificado: o.sesionCremacion?.numeroCertificado ?? "", Fecha: fmtDate(o.createdAt),
              })), `servicios_${from}_${to}.csv`)}>
              {(data.orders ?? []).length === 0
                ? <div className="py-12 text-center text-slate-500 text-sm">Sin resultados.</div>
                : <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                      {["Folio","Mascota","Dueño","Estado","Tipo","Sucursal","Total","Fecha"].map(h => (
                        <th key={h} className={`px-4 py-3 text-left ${h === "Total" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.orders ?? []).map((o: any) => (
                      <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-brand-gold-400 text-[11px]">{o.folio}</td>
                        <td className="px-4 py-3 font-medium text-white">{o.pet?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-slate-400">{o.owner?.name ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${STATUS_COLORS[o.status] ?? ""}`}>
                            {STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{o.serviceType === "IMMEDIATE" ? "Inmediata" : "Previsión"}</td>
                        <td className="px-4 py-3 text-slate-400">{o.sucursal?.nombre ?? "—"}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-400">{fmt$(Number(o.totalCost) || 0)}</td>
                        <td className="px-4 py-3 text-slate-500">{fmtDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
            </TableCard>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════
            INGRESOS
        ════════════════════════════════════════════════════ */}
        {!loading && data && tab === "ingresos" && (
          <motion.div key="ingresos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              <KpiCard label="Total ingresos"    value={fmt$(data.total          ?? 0)} icon={DollarSign} color="text-emerald-400"     bg="bg-emerald-500/10" />
              <KpiCard label="Servicios"          value={fmt$(data.totalServicios ?? 0)} icon={BarChart2}  color="text-brand-gold-400"  bg="bg-brand-gold-500/10" />
              <KpiCard label="Previsión cobrada"  value={fmt$(data.totalPrevision ?? 0)} icon={Users2}    color="text-purple-400"       bg="bg-purple-500/10" />
            </div>

            {(data.monthlyData ?? []).length > 0 ? (
              <ChartCard title="Ingresos por mes" subtitle="Servicios vs previsión">
                <div className="flex items-center justify-end">
                  <button onClick={() => exportCSV(data.monthlyData ?? [], `ingresos_${from}_${to}.csv`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white border border-white/10 transition-all">
                    <Download size={12} /> CSV
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={data.monthlyData}>
                    <defs>
                      <linearGradient id="gServ" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#c5a059" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#c5a059" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPrev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip {...tooltipStyle} formatter={(v: number | undefined) => fmt$(v ?? 0)} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    <Area type="monotone" dataKey="servicios" name="Servicios" stroke="#c5a059" fill="url(#gServ)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="prevision" name="Previsión" stroke="#a78bfa" fill="url(#gPrev)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
            ) : (
              <EmptyState message="Sin datos de ingresos en este período." />
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════
            CREMACIONES
        ════════════════════════════════════════════════════ */}
        {!loading && data && tab === "cremaciones" && (
          <motion.div key="cremaciones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Total sesiones"    value={data.total       ?? 0}            icon={Flame}        color="text-orange-400"  bg="bg-orange-500/10" />
              <KpiCard label="Completadas"        value={data.completadas ?? 0}            icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" />
              <KpiCard label="En curso"           value={data.enCurso     ?? 0}            icon={Activity}     color="text-orange-400"  bg="bg-orange-500/10" />
              <KpiCard label="Duración promedio"  value={`${data.avgMinutes ?? 0} min`}   icon={Clock}        color="text-brand-gold-400" bg="bg-brand-gold-500/10" />
            </div>

            {data.byHorno && Object.keys(data.byHorno).length > 0 && (
              <ChartCard title="Sesiones por horno">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(data.byHorno as Record<string, number>).map(([n, v]) => ({ name: n, sesiones: v }))}>
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="sesiones" name="Sesiones" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            <TableCard title="sesiones" count={data.sesiones?.length ?? 0}
              onExport={() => exportCSV((data.sesiones ?? []).map((s: any) => ({
                Certificado: s.numeroCertificado, Horno: s.horno?.nombre,
                Sucursal: s.horno?.sucursal?.nombre ?? "—", Mascota: s.serviceOrder?.pet?.name,
                Especie: s.serviceOrder?.pet?.species, Dueño: s.serviceOrder?.owner?.name,
                Inicio: fmtDate(s.fechaInicio), Fin: s.fechaFin ? fmtDate(s.fechaFin) : "En curso",
                Duración: s.fechaFin ? duracion(s.fechaInicio, s.fechaFin) : "—",
              })), `cremaciones_${from}_${to}.csv`)}>
              {(data.sesiones ?? []).length === 0
                ? <div className="py-12 text-center text-slate-500 text-sm">Sin cremaciones.</div>
                : <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                      {["Certificado","Mascota","Horno","Inicio","Fin","Duración"].map(h => (
                        <th key={h} className={`px-4 py-3 text-left ${h === "Duración" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(data.sesiones ?? []).map((s: any) => (
                      <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-orange-400 text-[11px]">{s.numeroCertificado}</td>
                        <td className="px-4 py-3 text-white">
                          {s.serviceOrder?.pet?.name ?? "—"}
                          <span className="text-slate-500 ml-1 text-[10px]">{s.serviceOrder?.pet?.species}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{s.horno?.nombre}</td>
                        <td className="px-4 py-3 text-slate-400">{fmtDate(s.fechaInicio)}</td>
                        <td className="px-4 py-3">
                          {s.fechaFin
                            ? <span className="text-emerald-400">{fmtDate(s.fechaFin)}</span>
                            : <span className="text-orange-400 animate-pulse text-[10px] font-bold">En curso</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand-gold-400">
                          {s.fechaFin ? duracion(s.fechaInicio, s.fechaFin) : duracion(s.fechaInicio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>}
            </TableCard>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════
            COMISIONES
        ════════════════════════════════════════════════════ */}
        {!loading && data && tab === "comisiones" && (
          <motion.div key="comisiones" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard label="Total vendido"        value={fmt$(data.grandTotal    ?? 0)} icon={TrendingUp} color="text-brand-gold-400" bg="bg-brand-gold-500/10" />
              <KpiCard label="Comisiones por pagar" value={fmt$(data.grandComision ?? 0)} icon={DollarSign} color="text-purple-400"     bg="bg-purple-500/10" />
            </div>

            {(data.vendedores ?? []).length === 0
              ? <EmptyState message="Sin contratos en este período." />
              : (data.vendedores ?? []).map((v: any) => (
                <div key={v.id} className="glass-card rounded-2xl overflow-hidden border border-white/5">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-purple-400 font-black text-lg">
                        {v.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-white">{v.name}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          {v.level} · {(v.commissionRate * 100).toFixed(0)}% comisión
                          {v.sucursal && <span className="ml-2 text-purple-400">· {v.sucursal.nombre}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{v.totalContracts} contratos</p>
                      <p className="font-black text-lg text-purple-400">{fmt$(v.comision)}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 divide-x divide-white/5">
                    {[
                      { label: "Vendido",  value: fmt$(v.totalVenta),   color: "text-brand-gold-400" },
                      { label: "Cobrado",  value: fmt$(v.totalCobrado), color: "text-emerald-400" },
                      { label: "Comisión", value: fmt$(v.comision),     color: "text-purple-400" },
                    ].map(s => (
                      <div key={s.label} className="px-5 py-4 text-center">
                        <p className={`font-black text-xl ${s.color}`}>{s.value}</p>
                        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Contracts */}
                  {v.contracts.length > 0 && (
                    <div className="overflow-x-auto border-t border-white/5">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[10px] text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <th className="text-left px-5 py-2.5">Cliente</th>
                            <th className="text-left px-4 py-2.5">Plan</th>
                            <th className="text-left px-4 py-2.5">Estado</th>
                            <th className="text-right px-4 py-2.5">Precio</th>
                            <th className="text-right px-5 py-2.5">Cobrado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.contracts.map((c: any) => (
                            <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                              <td className="px-5 py-2.5 text-white font-medium">{c.ownerName ?? "—"}</td>
                              <td className="px-4 py-2.5 text-slate-400">{c.planName ?? "—"}</td>
                              <td className="px-4 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                  c.status === "COMPLETED"
                                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                                    : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                                }`}>{c.status}</span>
                              </td>
                              <td className="px-4 py-2.5 text-right text-brand-gold-400 font-bold">{fmt$(c.planPrice)}</td>
                              <td className="px-5 py-2.5 text-right text-emerald-400 font-bold">{fmt$(c.cobrado)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="px-5 py-3 border-t border-white/5">
                    <button onClick={() => exportCSV(v.contracts.map((c: any) => ({
                      Vendedor: v.name, Cliente: c.ownerName, Plan: c.planName,
                      "Precio plan": c.planPrice, Cobrado: c.cobrado,
                      "Comisión (est)": (c.planPrice * v.commissionRate).toFixed(2),
                      Estado: c.status, Fecha: fmtDate(c.startDate),
                    })), `comisiones_${v.name}_${from}_${to}.csv`)}
                      className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest">
                      <Download size={12} /> Exportar contratos de {v.name}
                    </button>
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
