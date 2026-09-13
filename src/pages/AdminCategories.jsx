import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Folder, FolderOpen, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { showApiError } from "../utils/showApiError";

const PAGE_SIZE = 8;

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/api/admin/categories");
      setCategories(data.categories || data.data || []);
    } catch (error) {
      showApiError(error, "Impossible de charger les catégories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCategories(); }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    return term ? categories.filter((category) => category.name?.toLocaleLowerCase("fr").includes(term)) : categories;
  }, [categories, search]);
  const lastPage = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE));
  const visibleCategories = filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { if (page > lastPage) setPage(lastPage); }, [lastPage, page]);

  const resetForm = () => { setName(""); setEditingId(null); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, { name: cleanName });
        toast.success("Catégorie mise à jour");
      } else {
        await api.post("/api/admin/categories", { name: cleanName });
        toast.success("Catégorie ajoutée");
      }
      resetForm();
      await fetchCategories();
    } catch (error) {
      showApiError(error, "Enregistrement de la catégorie impossible");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    try {
      await api.delete(`/api/admin/categories/${category.id}`);
      setCategories((current) => current.filter((item) => item.id !== category.id));
      if (editingId === category.id) resetForm();
      toast.success("Catégorie supprimée");
    } catch (error) {
      showApiError(error, "Suppression impossible");
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-200">Organisation du catalogue</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black"><FolderOpen /> Catégories</h1><p className="mt-2 text-sm text-indigo-100">Classez clairement vos produits pour faciliter la recherche des clients.</p></div>
          <span className="w-fit rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black backdrop-blur">{categories.length} catégorie(s)</span>
        </div>
      </header>

      <section className="grid gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div><label htmlFor="category-name" className="mb-2 block text-sm font-black text-gray-800">{editingId ? "Modifier le nom" : "Nouvelle catégorie"}</label><input id="category-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. Électronique, Mode, Épicerie…" className="min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" required /></div>
          <button disabled={isSubmitting} className={`mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 ${editingId ? "bg-amber-500" : "bg-indigo-600"}`}>{isSubmitting ? <Loader2 className="animate-spin" size={18} /> : editingId ? <Pencil size={18} /> : <Plus size={18} />}{editingId ? "Enregistrer" : "Ajouter"}</button>
        </form>
        {editingId && <button type="button" onClick={resetForm} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gray-100 px-4 text-sm font-black text-gray-600 hover:bg-gray-200"><X size={17} /> Annuler</button>}
      </section>

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black text-gray-950">Catégories disponibles</h2><p className="text-xs text-gray-500">Modifiez le classement sans quitter la page.</p></div><div className="flex min-h-11 items-center gap-2 rounded-2xl bg-gray-50 px-4 sm:w-80"><Search size={17} className="text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une catégorie" className="w-full bg-transparent text-sm outline-none" /></div></div>
        {isLoading ? <div className="grid place-items-center p-16"><Loader2 className="animate-spin text-indigo-600" /></div> : visibleCategories.length ? (
          <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">{visibleCategories.map((category) => (
            <article key={category.id} className="group flex min-h-32 flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:bg-indigo-50/40 hover:shadow-lg">
              <div className="flex items-start justify-between gap-3"><span className="rounded-xl bg-white p-2.5 text-indigo-600 shadow-sm"><Folder size={19} /></span><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-gray-500">{category.products_count || 0} produit(s)</span></div>
              <div className="mt-4 flex items-end justify-between gap-3"><h3 className="min-w-0 truncate font-black text-gray-900">{category.name}</h3><div className="flex shrink-0 gap-1"><button type="button" onClick={() => { setName(category.name); setEditingId(category.id); }} aria-label={`Modifier ${category.name}`} className="rounded-lg p-2 text-blue-600 hover:bg-white"><Pencil size={16} /></button><button type="button" onClick={() => handleDelete(category)} aria-label={`Supprimer ${category.name}`} className="rounded-lg p-2 text-red-600 hover:bg-white"><Trash2 size={16} /></button></div></div>
            </article>
          ))}</div>
        ) : <div className="p-14 text-center text-sm text-gray-400">Aucune catégorie ne correspond à votre recherche.</div>}
        <nav aria-label="Pagination des catégories" className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold text-gray-500">{filteredCategories.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredCategories.length)}` : "0"} sur {filteredCategories.length}</p><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="grid h-10 w-10 place-items-center rounded-xl border bg-white disabled:opacity-30" aria-label="Page précédente"><ChevronLeft size={18} /></button><span className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-black text-white">{page} / {lastPage}</span><button type="button" disabled={page === lastPage} onClick={() => setPage((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-xl border bg-white disabled:opacity-30" aria-label="Page suivante"><ChevronRight size={18} /></button></div></nav>
      </section>
    </div>
  );
}
