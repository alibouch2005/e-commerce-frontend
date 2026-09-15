import { useCallback, useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Images,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { showApiError } from "../utils/showApiError";
import { formatAmount } from "../utils/money";

const emptyForm = {
  name: "",
  description: "",
  short_description: "",
  long_description: "",
  price: "",
  sale_price: "",
  sale_ends_at: "",
  stock: "",
  delivery_price: "",
  free_delivery: false,
  free_delivery_ends_at: "",
  featured_home: false,
  has_variants: false,
  variant_options: {
    color: "",
    size: "",
    weight: "",
    custom: "",
  },
  category_id: "",
};

const splitOptions = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const newOptionValue = () => ({ id: `${Date.now()}-${Math.random()}`, value: "", price: "", stock: "" });

const serializeVariantOptions = (options, colorRows = [], optionRows = {}) => ({
  color: colorRows.map((row) => row.name.trim()).filter(Boolean),
  size: (optionRows.size || []).map((row) => row.value.trim()).filter(Boolean).concat(splitOptions(options.size)),
  weight: (optionRows.weight || []).map((row) => row.value.trim()).filter(Boolean).concat(splitOptions(options.weight)),
  custom: (optionRows.custom || []).map((row) => row.value.trim()).filter(Boolean).concat(splitOptions(options.custom)),
});

const serializeVariantPrices = (colorRows = [], optionRows = {}) => {
  const prices = {};
  const addPrice = (group, value, price) => {
    const label = String(value || "").trim();
    const amount = Number(price);
    if (!label || !Number.isFinite(amount) || amount <= 0) return;
    prices[group] = { ...(prices[group] || {}), [label]: amount };
  };

  colorRows.forEach((row) => addPrice("color", row.name, row.price));
  ["size", "weight", "custom"].forEach((group) => {
    (optionRows[group] || []).forEach((row) => addPrice(group, row.value, row.price));
  });

  return prices;
};

const serializeVariantStocks = (colorRows = [], optionRows = {}) => {
  const stocks = {};
  const addStock = (group, value, stock) => {
    const label = String(value || "").trim();
    const quantity = Number(stock);
    if (!label || stock === "" || !Number.isInteger(quantity) || quantity < 0) return;
    stocks[group] = { ...(stocks[group] || {}), [label]: quantity };
  };

  colorRows.forEach((row) => addStock("color", row.name, row.stock));
  ["size", "weight", "custom"].forEach((group) => {
    (optionRows[group] || []).forEach((row) => addStock(group, row.value, row.stock));
  });

  return stocks;
};

const optionsToText = (options, key) => Array.isArray(options?.[key]) ? options[key].join(", ") : "";
const newColorVariant = () => ({ id: `${Date.now()}-${Math.random()}`, name: "", price: "", stock: "", file: null, preview: "", existingImage: "" });
const optionRowsFromProduct = (options, prices, stocks, key) => {
  const values = Array.isArray(options?.[key]) ? options[key] : [];
  return (values.length ? values : [""]).map((value) => ({
    id: `${key}-${value || "new"}-${Date.now()}-${Math.random()}`,
    value,
    price: prices?.[key]?.[value] ?? "",
    stock: stocks?.[key]?.[value] ?? "",
  }));
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [colorVariants, setColorVariants] = useState([newColorVariant()]);
  const [optionRows, setOptionRows] = useState({
    size: [newOptionValue()],
    weight: [newOptionValue()],
    custom: [newOptionValue()],
  });
  const [preview, setPreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
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

  useEffect(() => {
    if (!editorOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !isSubmitting) setEditorOpen(false);
    };
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [editorOpen, isSubmitting]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImage(null);
    setVideo(null);
    setRemoveVideo(false);
    setImages([]);
    setExistingImages([]);
    setRemovedImageIds([]);
    setColorVariants([newColorVariant()]);
    setOptionRows({
      size: [newOptionValue()],
      weight: [newOptionValue()],
      custom: [newOptionValue()],
    });
    setPreview(null);
    setVideoPreview(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.category_id) return toast.error("Choisissez une catégorie");
    if (form.sale_price && Number(form.sale_price) >= Number(form.price)) {
      return toast.error("Le prix promotionnel doit être inférieur au prix normal");
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.short_description || form.description || "");
    formData.append("short_description", form.short_description || "");
    formData.append("long_description", form.long_description || "");
    formData.append("price", form.price);
    formData.append("stock", form.stock);
    formData.append("delivery_price", form.free_delivery ? "" : form.delivery_price);
    formData.append("free_delivery", form.free_delivery ? "1" : "0");
    formData.append("free_delivery_ends_at", form.free_delivery ? (form.free_delivery_ends_at || "") : "");
    formData.append("featured_home", form.featured_home ? "1" : "0");
    formData.append("has_variants", form.has_variants ? "1" : "0");
    formData.append("variant_options", JSON.stringify(serializeVariantOptions(form.variant_options, colorVariants, optionRows)));
    formData.append("variant_prices", JSON.stringify(serializeVariantPrices(colorVariants, optionRows)));
    formData.append("variant_stocks", JSON.stringify(serializeVariantStocks(colorVariants, optionRows)));
    colorVariants.filter((variant) => variant.name.trim()).forEach((variant, index) => {
      formData.append(`variant_color_names[${index}]`, variant.name.trim());
      if (variant.file) formData.append(`variant_color_images[${index}]`, variant.file);
    });
    formData.append("category_id", form.category_id);
    if (form.sale_price) formData.append("sale_price", form.sale_price);
    if (form.sale_ends_at) formData.append("sale_ends_at", form.sale_ends_at);
    if (image) formData.append("image", image);
    if (video) formData.append("video", video);
    if (removeVideo) formData.append("remove_video", "1");
    images.slice(0, 5).forEach((item) => formData.append("images[]", item.file));
    removedImageIds.forEach((id) => formData.append("remove_image_ids[]", id));

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/products/${editingId}?_method=PUT` : "/api/admin/products";
      await api.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(editingId ? "Produit mis à jour" : "Produit ajouté");
      resetForm();
      setEditorOpen(false);
      fetchProducts();
    } catch (error) {
      showApiError(error, "Enregistrement impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    const variantMedia = product.variant_media?.color || {};
    const variantPrices = product.variant_prices || {};
    const variantStocks = product.variant_stocks || {};
    const colors = Array.isArray(product.variant_options?.color) ? product.variant_options.color : [];

    setForm({
      name: product.name || "",
      description: product.description || "",
      short_description: product.short_description || product.description || "",
      long_description: product.long_description || product.description || "",
      price: product.price || "",
      sale_price: product.sale_price || "",
      sale_ends_at: product.sale_ends_at ? product.sale_ends_at.slice(0, 16) : "",
      stock: product.stock ?? "",
      delivery_price: product.delivery_price ?? "",
      free_delivery: Boolean(product.free_delivery),
      free_delivery_ends_at: product.free_delivery_ends_at ? product.free_delivery_ends_at.slice(0, 16) : "",
      featured_home: Boolean(product.featured_home),
      has_variants: Boolean(product.has_variants),
      variant_options: {
        color: optionsToText(product.variant_options, "color"),
        size: "",
        weight: "",
        custom: "",
      },
      category_id: product.category?.id || "",
    });
    setColorVariants((colors.length ? colors : [""]).map((name) => ({
      id: `${name || "new"}-${Date.now()}-${Math.random()}`,
      name,
      price: variantPrices.color?.[name] ?? "",
      stock: variantStocks.color?.[name] ?? "",
      file: null,
      preview: variantMedia[name] || "",
      existingImage: variantMedia[name] || "",
    })));
    setOptionRows({
      size: optionRowsFromProduct(product.variant_options, variantPrices, variantStocks, "size"),
      weight: optionRowsFromProduct(product.variant_options, variantPrices, variantStocks, "weight"),
      custom: optionRowsFromProduct(product.variant_options, variantPrices, variantStocks, "custom"),
    });
    setEditingId(product.id);
    setImage(null);
    setVideo(null);
    setRemoveVideo(false);
    setImages([]);
    setExistingImages((product.images || []).filter((item) => item.url && item.url !== product.image));
    setRemovedImageIds([]);
    setPreview(product.image);
    setVideoPreview(product.video || null);
    setEditorOpen(true);
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

  const chooseVideo = (file) => {
    if (!file) return;
    setVideo(file);
    setRemoveVideo(false);
    setVideoPreview(URL.createObjectURL(file));
  };

  const chooseGalleryImages = (files) => {
    const available = Math.max(0, 5 - existingImages.length - images.length);
    const known = new Set(images.map((item) => item.id));
    const additions = Array.from(files || [])
      .map((file) => ({ id: `${file.name}-${file.size}-${file.lastModified}`, file, preview: URL.createObjectURL(file) }))
      .filter((item) => !known.has(item.id))
      .slice(0, available);
    if (additions.length < Array.from(files || []).length) toast("La galerie accepte au maximum 5 photos sans doublon.");
    setImages((current) => [...current, ...additions]);
  };

  const removeExistingGalleryImage = (item) => {
    setExistingImages((current) => current.filter((imageItem) => imageItem.id !== item.id));
    setRemovedImageIds((current) => current.includes(item.id) ? current : [...current, item.id]);
  };

  const updateColorVariant = (id, field, value) => {
    setColorVariants((current) => current.map((variant) => (
      variant.id === id ? { ...variant, [field]: value } : variant
    )));
  };

  const chooseColorImage = (id, file) => {
    if (!file) return;
    setColorVariants((current) => current.map((variant) => (
      variant.id === id ? { ...variant, file, preview: URL.createObjectURL(file) } : variant
    )));
  };

  const addColorVariant = () => {
    setColorVariants((current) => [...current, newColorVariant()]);
  };

  const removeColorVariant = (id) => {
    setColorVariants((current) => current.length > 1 ? current.filter((variant) => variant.id !== id) : [newColorVariant()]);
  };

  const updateOptionRow = (type, id, field, value) => {
    setOptionRows((current) => ({
      ...current,
      [type]: current[type].map((row) => row.id === id ? { ...row, [field]: value } : row),
    }));
  };

  const addOptionRow = (type) => {
    setOptionRows((current) => ({
      ...current,
      [type]: [...current[type], newOptionValue()],
    }));
  };

  const removeOptionRow = (type, id) => {
    setOptionRows((current) => ({
      ...current,
      [type]: current[type].length > 1 ? current[type].filter((row) => row.id !== id) : [newOptionValue()],
    }));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-[0_25px_70px_-28px_rgba(79,70,229,.8)] sm:p-8">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-200">Catalogue AliShop</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Gestion des produits</h1><p className="mt-2 max-w-2xl text-sm text-indigo-100">Consultez l’inventaire et gérez les prix, médias, variantes et stocks.</p></div>
          <button type="button" onClick={() => { resetForm(); setEditorOpen(true); }} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-indigo-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-50"><Plus size={20} /> Ajouter un produit</button>
        </div>
      </header>

      {editorOpen && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/65 p-2 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) setEditorOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="product-editor-title" className="max-h-[calc(100dvh-1rem)] w-full max-w-6xl overflow-y-auto overscroll-contain rounded-[2rem] border border-white/70 bg-white shadow-[0_35px_100px_rgba(15,23,42,.4)] sm:max-h-[calc(100dvh-2.5rem)]">
        <div className={`px-8 py-4 flex justify-between items-center text-white ${editingId ? "bg-amber-500" : "bg-indigo-600"}`}>
          <h2 id="product-editor-title" className="text-lg font-bold flex items-center gap-2">
            {editingId ? <Pencil size={20} /> : <Plus size={22} />}
            {editingId ? `Modifier ${form.name}` : "Ajouter un nouveau produit"}
          </h2>
          <button type="button" onClick={() => { if (!isSubmitting) { resetForm(); setEditorOpen(false); } }} aria-label="Fermer" className="flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-sm font-bold transition hover:bg-white/25"><X size={16} /> Fermer</button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 p-4 sm:p-6 xl:grid-cols-2 xl:gap-8 xl:p-8">
          <div className="space-y-4">
            <input type="text" placeholder="Nom du produit" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />

            <div className="grid gap-4 sm:grid-cols-2">
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" required>
                <option value="">Catégorie</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <input type="number" step="0.01" min="0.01" placeholder="Prix (DH)" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input type="number" step="0.01" min="0" placeholder="Prix promo" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <input type="datetime-local" value={form.sale_ends_at} onChange={(e) => setForm({ ...form, sale_ends_at: e.target.value })} className="p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input type="number" min="0" placeholder="Quantité en stock" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
              <label className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900">
                Prix de livraison (DH)
                <input type="number" step="0.5" min="0" max="10000" placeholder="Ex. 25" disabled={form.free_delivery} value={form.delivery_price} onChange={(e) => setForm({ ...form, delivery_price: e.target.value })} className="mt-1 w-full rounded-lg border border-sky-100 bg-white p-2 text-base font-normal outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50" />
                <span className="mt-1 block font-normal text-sky-700">Facultatif. Dans un panier mixte, le prix produit le plus élevé est appliqué une seule fois.</span>
              </label>
            </div>
            <label className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-950">
              <input type="checkbox" checked={form.featured_home} onChange={(e) => setForm({ ...form, featured_home: e.target.checked })} className="mt-1 h-5 w-5 accent-amber-500" />
              <span><span className="block font-black">Mettre en avant sur l’accueil</span><span className="text-amber-700">Le produit apparaîtra dans une sélection dédiée sur l’accueil, même sans promotion.</span></span>
            </label>
            <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <input
                type="checkbox"
                checked={form.free_delivery}
                onChange={(e) => setForm({ ...form, free_delivery: e.target.checked, delivery_price: e.target.checked ? "" : form.delivery_price })}
                className="mt-1 h-5 w-5 accent-emerald-600"
              />
              <span>
                <span className="block font-black">Livraison gratuite pour ce produit</span>
                <span className="text-emerald-700">Si tout le panier contient uniquement des produits marqués gratuits, le client paie 0 DH de livraison.</span>
              </span>
            </label>
            {form.free_delivery && (
              <label className="block rounded-2xl border border-emerald-100 bg-white p-4 text-sm font-bold text-gray-800">
                Fin de la promotion de livraison <span className="font-normal text-gray-500">(facultative)</span>
                <input type="datetime-local" value={form.free_delivery_ends_at} onChange={(e) => setForm({ ...form, free_delivery_ends_at: e.target.value })} className="mt-2 w-full rounded-xl bg-gray-50 p-3 font-normal outline-none focus:ring-2 focus:ring-emerald-500" />
                <span className="mt-2 block text-xs font-normal text-gray-500">Sans date, elle reste active jusqu’à sa désactivation manuelle.</span>
              </label>
            )}
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50/60 p-4 sm:p-5">
              <label className="flex items-start gap-3 text-sm text-indigo-950">
                <input
                  type="checkbox"
                  checked={form.has_variants}
                  onChange={(e) => setForm({ ...form, has_variants: e.target.checked })}
                  className="mt-1 h-5 w-5 accent-indigo-600"
                />
                <span>
                  <span className="block font-black">Options et variantes du produit</span>
                  <span className="text-indigo-700">Activez ce module pour proposer plusieurs couleurs, tailles, poids, capacités ou formats avec un prix adapté.</span>
                </span>
              </label>
              {form.has_variants && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-gray-950">Couleurs avec photo</p>
                        <p className="text-xs text-gray-500">Exemple T-shirt: Noir, Blanc, Rouge. Chaque couleur peut avoir sa propre photo.</p>
                      </div>
                      <button type="button" onClick={addColorVariant} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-black text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 hover:bg-indigo-700">
                        <Plus size={15} /> Ajouter une couleur
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {colorVariants.map((variant, index) => (
                        <div key={variant.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 p-3 shadow-sm">
                          <div className="grid gap-3 sm:grid-cols-[96px_1fr]">
                            <label className="flex h-24 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-400 transition hover:border-indigo-400 hover:text-indigo-600 sm:w-24">
                              {variant.preview ? (
                                <img src={variant.preview} alt={variant.name || `Couleur ${index + 1}`} className="h-full w-full object-cover" />
                              ) : (
                                <><ImageIcon size={24} /><span className="mt-1 text-[10px] font-bold">Photo</span></>
                              )}
                              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => chooseColorImage(variant.id, e.target.files?.[0])} />
                            </label>
                            <div className="min-w-0 flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder={`Nom couleur ${index + 1}`}
                                value={variant.name}
                                onChange={(e) => updateColorVariant(variant.id, "name", e.target.value)}
                                className="w-full rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <div className="grid gap-2 sm:grid-cols-2">
                                <input type="number" step="0.01" min="0.01" placeholder="Prix (DH)" value={variant.price} onChange={(e) => updateColorVariant(variant.id, "price", e.target.value)} className="w-full rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                                <input type="number" step="1" min="0" placeholder="Quantité" value={variant.stock} onChange={(e) => updateColorVariant(variant.id, "stock", e.target.value)} className="w-full rounded-xl bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[11px] font-semibold text-gray-500">{variant.preview ? "Photo associée à cette couleur" : "Photo facultative"}</span>
                                <button type="button" onClick={() => removeColorVariant(variant.id)} className="rounded-lg px-2 py-1 text-xs font-black text-red-500 hover:bg-red-50">
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <VariantValueEditor
                      title="Tailles / formats"
                      hint="Ex: S, M, L, XL ou 110cm, 117cm"
                      addLabel="+ Taille"
                      placeholder="S, M, L..."
                      rows={optionRows.size}
                      onAdd={() => addOptionRow("size")}
                      onChange={(id, field, value) => updateOptionRow("size", id, field, value)}
                      onRemove={(id) => removeOptionRow("size", id)}
                    />
                    <VariantValueEditor
                      title="Poids / volume"
                      hint="Ex: 500g, 1kg, 2kg ou 1L"
                      addLabel="+ Poids"
                      placeholder="1kg, 2L..."
                      rows={optionRows.weight}
                      onAdd={() => addOptionRow("weight")}
                      onChange={(id, field, value) => updateOptionRow("weight", id, field, value)}
                      onRemove={(id) => removeOptionRow("weight", id)}
                    />
                    <VariantValueEditor
                      title="Autres options"
                      hint="Ex: 64GB, 128GB, Pack x3"
                      addLabel="+ Option"
                      placeholder="Option..."
                      rows={optionRows.custom}
                      onAdd={() => addOptionRow("custom")}
                      onChange={(id, field, value) => updateOptionRow("custom", id, field, value)}
                      onRemove={(id) => removeOptionRow("custom", id)}
                    />
                  </div>
                </div>
              )}
            </div>

            <textarea
              placeholder="Description courte: résumé rapide affiché sur la fiche et les cartes produit..."
              rows="3"
              maxLength="500"
              value={form.short_description}
              onChange={(e) => setForm({ ...form, short_description: e.target.value, description: e.target.value })}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <textarea
              placeholder="Description longue: détails complets, matière, dimensions, garantie, conservation, compatibilité..."
              rows="6"
              value={form.long_description}
              onChange={(e) => setForm({ ...form, long_description: e.target.value })}
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
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

            <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
              <div className="flex items-start gap-3">
                <span className="rounded-xl bg-white p-3 text-sky-600 shadow-sm"><Images size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-950">Galerie du produit</p>
                  <p className="text-xs text-gray-500">Ajoutez jusqu’à 5 photos supplémentaires. JPG, PNG, WEBP ou GIF.</p>
                </div>
              </div>
              {(existingImages.length > 0 || images.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingImages.map((item) => (
                    <div key={`existing-${item.id}`} className="relative aspect-square overflow-hidden rounded-2xl border border-sky-100 bg-white">
                      <img src={item.url} alt="Photo de galerie" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeExistingGalleryImage(item)} aria-label="Supprimer cette photo" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow-lg transition hover:scale-105"><X size={15} /></button>
                    </div>
                  ))}
                  {images.map((item) => (
                    <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl border border-sky-100 bg-white">
                      <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => setImages((current) => current.filter((imageItem) => imageItem.id !== item.id))} aria-label="Retirer cette photo" className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white shadow-lg transition hover:scale-105"><X size={15} /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-sky-700 shadow-sm transition hover:bg-sky-100">
                <Images size={18} />
                {existingImages.length + images.length ? `${existingImages.length + images.length}/5 photos` : "Sélectionner les photos"}
                <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => { chooseGalleryImages(e.target.files); e.target.value = ""; }} />
              </label>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="rounded-xl bg-white p-3 text-violet-600 shadow-sm"><Video size={20} /></span>
                <div>
                  <p className="font-black text-gray-950">Vidéo du produit (facultative)</p>
                  <p className="text-xs text-gray-500">Ajoutez une courte vidéo MP4, MOV ou WEBM pour mieux présenter le produit au client.</p>
                </div>
              </div>
              {videoPreview && (
                <div className="relative mb-3 overflow-hidden rounded-2xl bg-black">
                  <video src={videoPreview} className="h-44 w-full object-contain" controls muted preload="metadata" />
                  <button type="button" onClick={() => { setVideo(null); setVideoPreview(null); setRemoveVideo(true); }} className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white">
                    <X size={16} />
                  </button>
                </div>
              )}
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-violet-700 shadow-sm hover:bg-violet-100">
                <Video size={18} />
                {videoPreview ? "Changer la vidéo" : "Choisir une vidéo"}
                <input type="file" className="hidden" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => chooseVideo(e.target.files?.[0])} />
              </label>
            </div>

            <button disabled={isSubmitting || categories.length === 0} className={`w-full py-4 rounded-2xl font-bold text-white flex justify-center items-center gap-3 transition active:scale-95 disabled:opacity-50 ${editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"}`}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : categories.length === 0 ? "Ajoutez d'abord une catégorie" : editingId ? "Enregistrer les modifications" : "Confirmer l'ajout"}
            </button>
          </div>
        </form>
      </section></div>}

      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900"><LayoutGrid className="text-indigo-600" /> Inventaire actuel</h2>
            <p className="mt-1 text-sm text-gray-500">{meta.total || products.length} produit(s) dans le catalogue</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Chercher un produit..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
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
                          {!product.free_delivery && product.delivery_price !== null && <p className="text-[10px] font-black uppercase text-sky-600">Livraison {formatAmount(product.delivery_price)} DH</p>}
                          {product.featured_home && <p className="text-[10px] font-black uppercase text-amber-600">Accueil</p>}
                          {product.has_variants && <p className="text-[10px] font-black uppercase text-indigo-600">Variantes</p>}
                          {product.video && <p className="text-[10px] font-black uppercase text-violet-600">Vidéo</p>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">{product.category?.name || "-"}</td>
                  <td className="px-6 py-4 font-bold text-indigo-600">
                    {product.is_on_sale && <span className="mr-2 text-gray-400 line-through">{formatAmount(product.price)} DH</span>}
                    {formatAmount(product.current_price || product.price)} DH
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-gray-100"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-white rounded-xl shadow-sm border border-gray-100"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Aucun produit trouvé</td></tr>
              )}
            </tbody>
          </table>
          </div>

          <AdminProductPagination page={page} meta={meta} onPage={setPage} />
        </div>
      </section>
    </div>
  );
}

function AdminProductPagination({ page, meta, onPage }) {
  const lastPage = Math.max(Number(meta.last_page || 1), 1);
  const currentPage = Math.min(Math.max(Number(meta.current_page || page || 1), 1), lastPage);
  const start = Math.max(1, Math.min(currentPage - 2, lastPage - 4));
  const pages = Array.from({ length: Math.min(5, lastPage) }, (_, index) => start + index);
  const changePage = (nextPage) => {
    onPage(Math.min(Math.max(nextPage, 1), lastPage));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav aria-label="Pagination des produits" className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-sm font-semibold text-gray-500">
        Produits {meta.from || 0}–{meta.to || 0} sur <strong className="text-gray-900">{meta.total || 0}</strong>
      </p>
      <div className="flex max-w-full items-center justify-start gap-1.5 overflow-x-auto pb-1 sm:justify-center sm:pb-0">
        <button type="button" aria-label="Page précédente" disabled={currentPage <= 1} onClick={() => changePage(currentPage - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"><ChevronLeft size={18} /></button>
        {pages.map((number) => <button type="button" key={number} aria-current={number === currentPage ? "page" : undefined} onClick={() => changePage(number)} className={`h-10 min-w-10 rounded-xl px-3 text-sm font-black transition ${number === currentPage ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "border border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-600"}`}>{number}</button>)}
        <button type="button" aria-label="Page suivante" disabled={currentPage >= lastPage} onClick={() => changePage(currentPage + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-30"><ChevronRight size={18} /></button>
      </div>
    </nav>
  );
}

function VariantValueEditor({ title, hint, addLabel, placeholder, rows, onAdd, onChange, onRemove }) {
  const readyValues = rows.map((row) => row.value.trim()).filter(Boolean);

  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-black text-gray-950">{title}</p>
          <p className="text-xs text-gray-500">{hint}</p>
        </div>
        <button type="button" onClick={onAdd} className="shrink-0 rounded-xl bg-gray-950 px-3 py-2 text-xs font-black text-white hover:bg-black">
          {addLabel}
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} className="grid items-center gap-2 sm:grid-cols-[1fr_120px_110px_auto]">
            <input
              type="text"
              placeholder={`${placeholder} ${index + 1}`}
              value={row.value}
              onChange={(event) => onChange(row.id, "value", event.target.value)}
              className="min-w-0 flex-1 rounded-xl bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Prix DH"
              value={row.price}
              onChange={(event) => onChange(row.id, "price", event.target.value)}
              className="min-w-0 rounded-xl bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              step="1"
              min="0"
              placeholder="Quantité"
              value={row.stock}
              onChange={(event) => onChange(row.id, "stock", event.target.value)}
              className="min-w-0 rounded-xl bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="button" onClick={() => onRemove(row.id)} className="rounded-xl p-3 text-red-500 hover:bg-red-50" title="Supprimer">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {readyValues.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {readyValues.map((value) => (
            <span key={value} className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-black text-indigo-700">
              {value}{rows.find((row) => row.value.trim() === value)?.price ? ` · ${formatAmount(rows.find((row) => row.value.trim() === value)?.price)} DH` : ""}{rows.find((row) => row.value.trim() === value)?.stock !== "" ? ` · stock ${rows.find((row) => row.value.trim() === value)?.stock}` : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
