import { useEffect, useState, useCallback } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Folder, Loader2, X } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FETCH avec useCallback pour éviter les re-renders inutiles
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error("Erreur de chargement:", error);
      toast.error("Impossible de charger les catégories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, { name });
        toast.success("Catégorie mise à jour");
      } else {
        await api.post("/api/admin/categories", { name });
        toast.success("Nouvelle catégorie ajoutée");
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    try {
      await api.delete(`/api/admin/categories/${id}`);
      toast.success("Catégorie supprimée");
      setCategories(categories.filter(c => c.id !== id));
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setName("");
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Folder className="text-indigo-600" /> Inventaire des Catégories
          </h1>
          <p className="text-gray-500 mt-1">Organisez vos produits par thématiques.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-sm font-medium border border-indigo-100">
          {categories.length} Catégories
        </span>
      </header>

      {/* FORMULAIRE D'ACTION */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-10 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingId ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}
          </h2>
          {editingId && (
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 flex items-center text-sm">
              <X size={16} /> Annuler
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ex: Biscuits, Boissons...."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-700"
              required
            />
          </div>

          <button
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all shadow-md active:scale-95 ${
              editingId ? "bg-amber-500 hover:bg-amber-600" : "bg-indigo-600 hover:bg-indigo-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : editingId ? (
              <><Pencil size={18} /> Mettre à jour</>
            ) : (
              <><Plus size={20} /> Enregistrer</>
            )}
          </button>
        </form>
      </section>

      {/* LISTE DES CATÉGORIES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Nom de la catégorie</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                  <td className="px-6 py-6"><div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div></td>
                </tr>
              ))
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="px-6 py-12 text-center text-gray-400 italic">
                  Aucune catégorie trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}