import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CalendarDays, Loader2, Pencil, Plus, Power, Tag, Trash2, X } from "lucide-react";
import api from "../Api/axios";
import { showApiError } from "../utils/showApiError";

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
    api.get("/api/admin/products", { params: { per_page: 100 } })
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => toast.error("Impossible de charger les produits"));
  }, []);

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter((coupon) => coupon.is_active).length,
    used: coupons.reduce((sum, coupon) => sum + Number(coupon.used_count || 0), 0),
  }), [coupons]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
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
      type: coupon.type || "percent",
      value: coupon.value || "",
      minimum_amount: coupon.minimum_amount || "",
      usage_limit: coupon.usage_limit || "",
      product_id: coupon.product_id || "",
      starts_at: formatDateTimeInput(coupon.starts_at),
      expires_at: formatDateTimeInput(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
    });
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
          </select>
          <input required type="number" min="0.01" step="0.01" placeholder={form.type === "percent" ? "Valeur %" : "Valeur DH"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="number" min="0" step="0.01" placeholder="Minimum panier DH" value={form.minimum_amount} onChange={(e) => setForm({ ...form, minimum_amount: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="number" min="1" placeholder="Limite utilisations" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Tous les produits</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
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
                  <td className="p-4 font-bold">{coupon.type === "percent" ? `${coupon.value}%` : `${coupon.value} DH`}</td>
                  <td className="p-4">{Number(coupon.minimum_amount || 0).toFixed(2)} DH</td>
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
