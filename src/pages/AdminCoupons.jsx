import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Check, Loader2, Pencil, Plus, Power, Search, Tag, Trash2, Truck, X } from "lucide-react";
import api from "../Api/axios";
import { showApiError } from "../utils/showApiError";
import { formatAmount } from "../utils/money";

const emptyForm = {
  code: "",
  type: "percent",
  value: "",
  minimum_amount: "",
  usage_limit: "",
  product_id: "",
  starts_at: "",
  expires_at: "",
  is_active: true,
};

const formatDateTimeInput = (value) => (value ? String(value).slice(0, 16) : "");

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState("");
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/coupons");
      setCoupons(data.data || []);
    } catch (error) {
      showApiError(error, "Chargement des promotions impossible");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setProductsLoading(true);
      try {
        const { data } = await api.get("/api/admin/products", { params: { per_page: 20, search: productSearch.trim() || undefined } });
        if (active) setProducts(data.data || []);
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setProductsLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [productSearch]);

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((coupon) => coupon.is_active).length,
    used: coupons.reduce((sum, coupon) => sum + Number(coupon.used_count || 0), 0),
  }), [coupons]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setProductSearch("");
    setProductPickerOpen(false);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        type: form.type === "free_delivery" ? "fixed" : form.type,
        free_delivery: form.type === "free_delivery",
        value: form.type === "free_delivery" ? 0 : form.value,
        minimum_amount: form.minimum_amount || 0,
        usage_limit: form.usage_limit || null,
        product_id: form.product_id || null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        is_active: Boolean(form.is_active),
      };
      if (editingId) {
        await api.put(`/api/admin/coupons/${editingId}`, payload);
        toast.success("Promotion mise à jour");
      } else {
        await api.post("/api/admin/coupons", payload);
        toast.success("Promotion créée");
      }
      resetForm();
      await load();
    } catch (error) {
      showApiError(error, "Enregistrement promotion impossible");
    } finally {
      setSaving(false);
    }
  };

  const edit = (coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || "",
      type: coupon.free_delivery ? "free_delivery" : (coupon.type || "percent"),
      value: coupon.value || "",
      minimum_amount: coupon.minimum_amount || "",
      usage_limit: coupon.usage_limit || "",
      product_id: coupon.product_id || "",
      starts_at: formatDateTimeInput(coupon.starts_at),
      expires_at: formatDateTimeInput(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
    });
    setProductSearch(coupon.product?.name || "");
    setProductPickerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (coupon) => {
    if (!window.confirm(`Supprimer le code ${coupon.code} ?`)) return;
    try {
      await api.delete(`/api/admin/coupons/${coupon.id}`);
      toast.success("Promotion supprimée");
      await load();
    } catch (error) {
      showApiError(error, "Suppression impossible");
    }
  };

  const toggle = async (coupon) => {
    try {
      await api.put(`/api/admin/coupons/${coupon.id}`, {
        ...coupon,
        is_active: !coupon.is_active,
      });
      toast.success(!coupon.is_active ? "Promotion activée" : "Promotion désactivée");
      await load();
    } catch (error) {
      showApiError(error, "Changement de statut impossible");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Marketing</p>
          <h1 className="flex items-center gap-3 text-3xl font-black text-gray-950">
            <Tag className="text-indigo-600" /> Promotions
          </h1>
          <p className="mt-1 text-sm text-gray-500">Créez, activez et contrôlez les codes promo du checkout.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Stat label="Codes" value={stats.total} />
          <Stat label="Actifs" value={stats.active} />
          <Stat label="Utilisations" value={stats.used} />
        </div>
      </div>

      <form onSubmit={save} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-black text-gray-950">{editingId ? "Modifier la promotion" : "Nouvelle promotion"}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">
              <X size={16} /> Annuler
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input required placeholder="CODE10" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="percent">Pourcentage</option>
            <option value="fixed">Montant DH</option>
            <option value="free_delivery">Livraison gratuite</option>
          </select>
          {form.type === "free_delivery" ? (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 font-black text-sky-700"><Truck size={19} /> Frais de livraison offerts</div>
          ) : (
            <input required type="number" min="0.01" step="0.01" placeholder={form.type === "percent" ? "Valeur %" : "Valeur DH"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          )}
          <input type="number" min="0" step="0.01" placeholder="Minimum panier DH" value={form.minimum_amount} onChange={(e) => setForm({ ...form, minimum_amount: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="number" min="1" placeholder="Limite utilisations" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <div className="relative" onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setProductPickerOpen(false); }}>
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="search"
              role="combobox"
              aria-label="Rechercher le produit concerné"
              aria-expanded={productPickerOpen}
              aria-controls="coupon-product-results"
              placeholder="Tous les produits"
              value={productSearch}
              onFocus={() => setProductPickerOpen(true)}
              onChange={(event) => {
                setProductSearch(event.target.value);
                setForm((current) => ({ ...current, product_id: "" }));
                setProductPickerOpen(true);
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-10 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {(productSearch || form.product_id) && <button type="button" aria-label="Choisir tous les produits" onClick={() => { setProductSearch(""); setForm((current) => ({ ...current, product_id: "" })); setProductPickerOpen(false); }} className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={16} /></button>}
            {productPickerOpen && (
              <div id="coupon-product-results" role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-slate-900/15">
                <button type="button" role="option" aria-selected={!form.product_id} onClick={() => { setProductSearch(""); setForm((current) => ({ ...current, product_id: "" })); setProductPickerOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-black text-gray-800 hover:bg-indigo-50">
                  Tous les produits {!form.product_id && <Check size={17} className="text-indigo-600" />}
                </button>
                {productsLoading ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-500"><Loader2 className="animate-spin" size={17} /> Recherche...</div>
                ) : products.length ? products.map((product) => (
                  <button key={product.id} type="button" role="option" aria-selected={String(form.product_id) === String(product.id)} onClick={() => { setForm((current) => ({ ...current, product_id: product.id })); setProductSearch(product.name); setProductPickerOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700">
                    <img src={product.image || "/product-placeholder.svg"} alt="" className="h-10 w-10 rounded-xl bg-gray-50 object-cover" />
                    <span className="min-w-0 flex-1 truncate">{product.name}</span>
                    {String(form.product_id) === String(product.id) && <Check size={17} className="shrink-0 text-indigo-600" />}
                  </button>
                )) : <p className="px-3 py-6 text-center text-sm text-gray-500">Aucun produit trouvé</p>}
              </div>
            )}
            <p className="mt-1 px-1 text-[11px] text-gray-500">Laissez vide pour appliquer le code à tout le catalogue.</p>
          </div>
          <label className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-indigo-500" />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-5 w-5 accent-emerald-600" />
            Promotion active
          </label>
        </div>

        <button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 font-black text-white hover:bg-indigo-700 disabled:bg-gray-300 sm:w-auto">
          {saving ? <Loader2 className="animate-spin" size={18} /> : editingId ? <Pencil size={18} /> : <Plus size={18} />}
          {editingId ? "Enregistrer les changements" : "Créer la promotion"}
        </button>
      </form>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-widest text-gray-400">
              <tr>
                <th className="p-4">Code</th>
                <th className="p-4">Réduction</th>
                <th className="p-4">Minimum</th>
                <th className="p-4">Produit</th>
                <th className="p-4">Utilisations</th>
                <th className="p-4">Validité</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="p-12 text-center"><Loader2 className="inline animate-spin text-indigo-600" /></td></tr>
              ) : coupons.length ? coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="p-4 font-black text-gray-950">{coupon.code}</td>
                  <td className="p-4 font-bold">{coupon.free_delivery ? <span className="inline-flex items-center gap-2 text-sky-700"><Truck size={17} /> Livraison offerte</span> : coupon.type === "percent" ? `${formatAmount(coupon.value)}%` : `${formatAmount(coupon.value)} DH`}</td>
                  <td className="p-4">{formatAmount(coupon.minimum_amount)} DH</td>
                  <td className="p-4 text-sm font-semibold text-gray-600">{coupon.product?.name || "Tous"}</td>
                  <td className="p-4">{coupon.used_count || 0}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / illimité"}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {coupon.starts_at ? new Date(coupon.starts_at).toLocaleDateString("fr-FR") : "Maintenant"}
                    {" → "}
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString("fr-FR") : "Sans fin"}
                  </td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${coupon.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {coupon.is_active ? "Actif" : "Désactivé"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => toggle(coupon)} className="rounded-xl bg-gray-50 p-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600" title="Activer / désactiver">
                        <Power size={18} />
                      </button>
                      <button onClick={() => edit(coupon)} className="rounded-xl bg-blue-50 p-2 text-blue-600 hover:bg-blue-100" title="Modifier">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => remove(coupon)} className="rounded-xl bg-red-50 p-2 text-red-600 hover:bg-red-100" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="p-12 text-center text-gray-400">Aucune promotion créée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-center shadow-sm">
      <p className="text-xl font-black text-gray-950">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
    </div>
  );
}
