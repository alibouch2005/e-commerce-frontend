import { useCallback, useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { showApiError } from "../utils/showApiError";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  sale_price: "",
  sale_ends_at: "",
  stock: "",
  free_delivery: false,
  category_id: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState("");
  const fallbackImage = "/product-placeholder.svg";

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/products", { params: { page, search } });
      setProducts(data.data || []);
      setMeta(data.meta || {});
    } catch {
      toast.error("Erreur de chargement des produits");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get("/api/admin/categories");
      setCategories(data.categories || data.data || data || []);
    } catch {
      toast.error("Impossible de charger les catégories");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImage(null);
    setImages([]);
    setPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.category_id) return toast.error("Choisissez une catégorie");
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) {
      return toast.error("Le prix promo doit etre inferieur au prix normal");
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description || "");
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("free_delivery", form.free_delivery ? "1" : "0");
    formData.append("category_id", form.category_id);
    if (form.sale_price) formData.append("sale_price", form.sale_price);
    if (form.sale_ends_at) formData.append("sale_ends_at", form.sale_ends_at);
    if (image) formData.append("image", image);
    images.slice(0, 5).forEach((file) => formData.append("images[]", file));

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/products/${editingId}?_method=PUT` : "/api/admin/products";
      await api.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(editingId ? "Produit mis à jour" : "Produit ajouté");
      resetForm();
      fetchProducts();
    } catch (error) {
      showApiError(error, "Enregistrement impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      sale_price: product.sale_price || "",
      sale_ends_at: product.sale_ends_at ? product.sale_ends_at.slice(0, 16) : "",
      stock: product.stock ?? "",
      free_delivery: Boolean(product.free_delivery),
      category_id: product.category?.id || "",
    });
    setEditingId(product.id);
    setImage(null);
    setImages([]);
    setPreview(product.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success("Produit supprimé");
      fetchProducts();
    } catch (error) {
      showApiError(error, "Suppression impossible");
    }
  };

  const chooseMainImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 space-y-12">
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`px-8 py-4 flex justify-between items-center text-white ${editingId ? "bg-amber-500" : "bg-indigo-600"}`}>
          <h2 className="text-lg font-bold flex items-center gap-2">
            {editingId ? <Pencil size={20} /> : <Plus size={22} />}
            {editingId ? `Modifier ${form.name}` : "Ajouter un nouveau produit"}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition flex items-center gap-1">
              <X size={14} /> Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input type="text" placeholder="Nom du produit" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />

            <div className="grid grid-cols-2 gap-4">
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Catégorie</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input type="number" step="0.01" min="0.01" placeholder="Prix (DH)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input type="number" step="0.01" min="0" placeholder="Prix promo" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="datetime-local" value={form.sale_ends_at} onChange={(e) => setForm({ ...form, sale_ends_at: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <input type="number" min="0" placeholder="Quantité en stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <input
                type="checkbox"
                checked={form.free_delivery}
                onChange={(e) => setForm({ ...form, free_delivery: e.target.checked })}
                className="mt-1 h-5 w-5 accent-emerald-600"
              />
              <span>
                <span className="block font-black">Livraison gratuite pour ce produit</span>
                <span className="text-emerald-700">Si tout le panier contient uniquement des produits marqués gratuits, le client paie 0 DH de livraison.</span>
              </span>
            </label>
            <textarea placeholder="Description détaillée du produit..." rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 min-h-64 flex flex-col items-center justify-center hover:border-indigo-400 transition">
              {preview ? (
                <div className="relative w-full">
                  <img src={preview} className="h-44 w-full object-contain rounded-lg" alt="Aperçu produit" />
                  <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <ImageIcon size={44} className="text-gray-300 mb-2" />
              )}
              <label className="mt-4 cursor-pointer rounded-xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-700">
                Choisir l'image principale
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => chooseMainImage(e.target.files?.[0])} />
              </label>
            </div>

            <label className="text-sm text-gray-500">
              Photos supplémentaires (jusqu'à 5)
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 5))} className="block mt-2 text-xs" />
            </label>
            {images.length > 0 && <p className="text-xs text-indigo-600">{images.length} image(s) supplémentaire(s) sélectionnée(s)</p>}

            <button disabled={isSubmitting || categories.length === 0} className={`w-full py-4 rounded-2xl font-bold text-white flex justify-center items-center gap-3 transition active:scale-95 disabled:opacity-50 ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : categories.length === 0 ? "Ajoutez d'abord une catégorie" : editingId ? "Enregistrer les modifications" : "Confirmer l'ajout"}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <LayoutGrid className="text-indigo-600" /> Inventaire actuel
          </h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Chercher un produit..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
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
              ) : products.length ? products.map((product) => (
                <tr key={product.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image || fallbackImage}
                        className="w-14 h-14 rounded-2xl object-cover bg-gray-50 shadow-sm"
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackImage;
                        }}
                      />
                      <div>
                        <p className="font-bold text-gray-800">{product.name}</p>
                        <div className="flex flex-wrap gap-2">
                          <p className={`text-[10px] font-bold uppercase ${product.stock > 0 ? "text-emerald-500" : "text-red-400"}`}>{product.stock > 0 ? `${product.stock} unités` : "Rupture de stock"}</p>
                          {product.free_delivery && <p className="text-[10px] font-black uppercase text-sky-600">Livraison gratuite</p>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{product.category?.name || "-"}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {product.is_on_sale && <span className="mr-2 text-gray-400 line-through">{product.price} DH</span>}
                    {product.current_price || product.price} DH
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-gray-100"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-white rounded-xl shadow-sm border border-gray-100"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Aucun produit trouve</td></tr>
              )}
            </tbody>
          </table>

          <div className="p-6 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
            <span className="text-sm text-gray-400 font-medium">Page {meta.current_page || 1} / {meta.last_page || 1}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-20 shadow-sm"><ChevronLeft size={20} /></button>
              <button disabled={!meta.next_page_url} onClick={() => setPage((value) => value + 1)} className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-20 shadow-sm"><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
