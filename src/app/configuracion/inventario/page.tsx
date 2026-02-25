"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    ChevronLeft,
    Tag,
    DollarSign,
    Box
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    category: string | null;
}

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "Urna"
    });

    const categories = ["Urna", "Relicario", "Joyería", "Accesorio", "Otro"];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/inventory");
            const data = await res.json();
            if (Array.isArray(data)) {
                setProducts(data);
            } else {
                setProducts([]);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setProducts([]);
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingProduct ? `/api/inventory/${editingProduct.id}` : "/api/inventory";
        const method = editingProduct ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                setEditingProduct(null);
                setFormData({ name: "", description: "", price: "", stock: "", category: "Urna" });
                fetchProducts();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;
        try {
            const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
            if (res.ok) fetchProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            stock: product.stock.toString(),
            category: product.category || "Urna"
        });
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-brand-gold-500 mb-2">
                        <Link href="/configuracion" className="hover:text-white transition-colors">
                            <ChevronLeft size={20} />
                        </Link>
                        <span className="text-xs font-black uppercase tracking-widest">Configuración</span>
                    </div>
                    <h2 className="text-4xl font-black aura-gradient bg-clip-text text-transparent italic tracking-tighter">
                        Inventario
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Gestiona el catálogo de productos y existencias.</p>
                </div>

                <button
                    onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                    className="btn-primary flex items-center gap-2 group self-start md:self-center"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    Nuevo Producto
                </button>
            </header>

            <div className="glass-card p-4 rounded-3xl flex items-center gap-3">
                <Search className="text-slate-500" size={20} />
                <input
                    type="text"
                    placeholder="Buscar producto o categoría..."
                    className="bg-transparent border-none outline-none text-white w-full font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="glass-card h-48 rounded-3xl animate-pulse" />
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-50 italic">
                            No se encontraron productos.
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-card p-6 rounded-3xl border border-white/5 hover:border-brand-gold-500/30 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-2xl bg-brand-gold-500/10 text-brand-gold-500">
                                        <Package size={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(product)}
                                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-brand-gold-500 hover:bg-white/10 transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-red-500 hover:bg-white/10 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-slate-400">
                                            {product.category}
                                        </span>
                                        {product.stock <= 5 && (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 flex items-center gap-1">
                                                <AlertCircle size={10} /> Stock Bajo
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold italic group-hover:text-brand-gold-100 transition-colors uppercase truncate">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">
                                        {product.description || "Sin descripción"}
                                    </p>

                                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Precio</span>
                                            <span className="text-lg font-black text-brand-gold-500">
                                                ${product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">Stock</span>
                                            <span className={cn(
                                                "text-lg font-black",
                                                product.stock === 0 ? "text-red-500" : "text-white"
                                            )}>
                                                {product.stock} pz
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Modal de Registro/Edición */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg glass-card rounded-[2rem] p-8 shadow-2xl border border-white/10"
                        >
                            <h3 className="text-2xl font-black italic mb-6 aura-gradient bg-clip-text text-transparent">
                                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre</label>
                                        <div className="relative group">
                                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-gold-500 transition-colors" size={18} />
                                            <input
                                                required
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold-500/50 transition-all font-medium"
                                                placeholder="Ej. Urna de Madera Clásica"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Precio</label>
                                            <div className="relative group">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-gold-500 transition-colors" size={18} />
                                                <input
                                                    required
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold-500/50 transition-all font-medium"
                                                    placeholder="0.00"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Existencia</label>
                                            <div className="relative group">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-gold-500 transition-colors" size={18} />
                                                <input
                                                    required
                                                    type="number"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-brand-gold-500/50 transition-all font-medium"
                                                    placeholder="0"
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoría</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-brand-gold-500/50 transition-all font-medium appearance-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Descripción</label>
                                        <textarea
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-brand-gold-500/50 transition-all font-medium resize-none text-sm"
                                            placeholder="Detalles sobre material, color, etc."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 btn-primary"
                                    >
                                        {editingProduct ? "Guardar Cambios" : "Crear Producto"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
