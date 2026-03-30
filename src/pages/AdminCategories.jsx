
import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function AdminCategories() {

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  //  FETCH
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");

      console.log("CATEGORIES:", res.data);

      setCategories(res.data.categories || []);

    } catch {
      toast.error("Erreur chargement catégories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  //  ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      if (editingId) {
        await api.put(`/api/admin/categories/${editingId}`, {
          name
        });

        toast.success("Catégorie modifiée ✏️");

      } else {
        await api.post("/api/admin/categories", {
          name
        });

        toast.success("Catégorie ajoutée ✅");
      }

      setName("");
      setEditingId(null);
      fetchCategories();

    } catch (err) {
      console.log(err.response?.data);
      toast.error("Erreur");
    }
  };

  //  DELETE
  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;

    try {
      await api.delete(`/api/admin/categories/${id}`);
      toast.success("Supprimée ❌");
      fetchCategories();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  //  EDIT
  const handleEdit = (cat) => {
    setName(cat.name);
    setEditingId(cat.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">

      <h1 className="text-2xl font-bold mb-6">
        📂 Gestion catégories
      </h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-6"
      >

        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "✏️ Modifier catégorie" : "➕ Ajouter catégorie"}
        </h2>

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Nom catégorie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />

          <button className="bg-indigo-600 text-white px-4 rounded">
            {editingId ? "Modifier" : "Ajouter"}
          </button>

        </div>

      </form>

      {/* LISTE */}
      <div className="space-y-3">

        {categories.length === 0 && (
          <p className="text-gray-500">Aucune catégorie</p>
        )}

        {categories.map(cat => (

          <div
            key={cat.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >

            <p className="font-semibold">{cat.name}</p>

            <div className="flex gap-2">

              <button
                onClick={() => handleEdit(cat)}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Modifier
              </button>

              <button
                onClick={() => handleDelete(cat.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Supprimer
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}