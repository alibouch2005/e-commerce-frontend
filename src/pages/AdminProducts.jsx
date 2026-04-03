import { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
  Package, Plus, Pencil, Trash2, Search,
  ChevronLeft, ChevronRight, Image as ImageIcon, X, Loader2, LayoutGrid
} from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState("");

  // FETCH PRODUCTS
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/products?page=${page}&search=${search}`);
      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const delay = setTimeout(fetchProducts, 400);
    return () => clearTimeout(delay);
  }, [fetchProducts]);

  useEffect(() => {
    api.get("/api/admin/categories").then((res) => setCategories(res.data.categories || []));
  }, []);

  // SUBMIT (ADD / UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    
    // On ajoute manuellement pour s'assurer du bon formatage
    formData.append("name", form.name);
    formData.append("description", form.description || "");
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("category_id", form.category_id);
    
    if (image) formData.append("image", image);

    try {
      const url = editingId ? `/api/admin/products/${editingId}?_method=PUT` : "/api/admin/products";
      await api.post(url, formData);
      toast.success(editingId ? "Produit mis à jour ✅" : "Produit ajouté ✅");
      resetForm();
      fetchProducts();
    } catch (err) {
      console.error("Erreur d'enregistrement:", err);
      toast.error("Erreur d'enregistrement ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", stock: "", category_id: "" });
    setEditingId(null);
    setImage(null);
    setPreview(null);
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || "", // <--- FIX: Évite le problème du champ vide si null
      price: p.price,
      stock: p.stock,
      category_id: p.category?.id || "",
    });
    setEditingId(p.id);
    setPreview(p.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success("Supprimé");
      fetchProducts();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-12">
      {/* 1. SECTION FORMULAIRE */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all">
        <div className={`px-8 py-4 flex justify-between items-center text-white ${editingId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {editingId ? <Pencil size={20} /> : <Plus size={22} />}
            {editingId ? "Mode Édition : " + form.name : "Ajouter un nouveau produit"}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition flex items-center gap-1">
              <X size={14}/> Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input
              type="text" placeholder="Nom du produit" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <select
                value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required
              >
                <option value="">Catégorie</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
              <input
                type="number" placeholder="Prix (DH)" required
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <input
              type="number" placeholder="Quantité en stock" required
              value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            <textarea
              placeholder="Description détaillée du produit..."
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 relative group hover:border-indigo-400 transition-all">
              {preview ? (
                <>
                  <img src={preview} className="h-40 w-full object-contain rounded-lg" alt="Preview" />
                  <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <ImageIcon size={40} className="text-gray-300 mb-2" />
                  <span className="text-sm text-gray-400 font-medium">Glisser ou cliquer pour l'image</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                  }} />
                </label>
              )}
            </div>

            <button
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl shadow-xl font-bold text-white flex justify-center items-center gap-3 transition-all active:scale-95 ${editingId ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : editingId ? "Enregistrer les modifications" : "Confirmer l'ajout"}
            </button>
          </div>
        </form>
      </section>

      <hr className="border-gray-100" />

      {/* 2. SECTION LISTE ET RECHERCHE */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" /> Inventaire Actuel
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text" placeholder="Chercher un produit..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Produit</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Prix</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={40} /></td></tr>
              ) : products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={p.image} className="w-14 h-14 rounded-2xl object-cover bg-gray-50 shadow-sm" alt="" />
                        <div>
                          <p className="font-bold text-gray-800">{p.name}</p>
                          <p className={`text-[10px] font-bold uppercase ${p.stock > 0 ? "text-emerald-500" : "text-red-400"}`}>
                            {p.stock > 0 ? `${p.stock} unités` : "Rupture de stock"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{p.category?.name}</td>
                    <td className="px-6 py-4 font-bold text-indigo-600">{p.price} DH</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-2 text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all"><Pencil size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Aucun produit trouvé</td></tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm text-gray-400 font-medium">Page {meta.current_page || 1} / {meta.last_page || 1}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-20 shadow-sm hover:bg-gray-50 transition-all"><ChevronLeft size={20} /></button>
              <button disabled={!meta.next_page_url} onClick={() => setPage(page + 1)} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-20 shadow-sm hover:bg-gray-50 transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}