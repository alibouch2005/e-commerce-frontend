import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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

  //  PAGINATION
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  //  SEARCH
  const [search, setSearch] = useState("");

  // ✅ FETCH PRODUCTS (CORRIGÉ)
  const fetchProducts = async () => {
    try {
      const res = await api.get(
        `/api/admin/products?page=${page}&search=${search}`,
      );

      setProducts(res.data.data);
      setMeta(res.data.meta);
    } catch {
      toast.error("Erreur chargement produits");
    }
  };

  // ✅ FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Erreur chargement catégories");
    }
  };

  // 🔥 IMPORTANT (page change)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(delay);
  }, [page, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", Number(form.price));
    formData.append("stock", Number(form.stock));
    formData.append("category_id", form.category_id);

    if (image) formData.append("image", image);

    try {
      if (editingId) {
        await api.post(
          `/api/admin/products/${editingId}?_method=PUT`,
          formData,
        );
        toast.success("Produit modifié ✅");
      } else {
        await api.post("/api/admin/products", formData);
        toast.success("Produit ajouté ✅");
      }

      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
      });

      setImage(null);
      setPreview(null);
      setEditingId(null);

      fetchProducts();
    } catch {
      toast.error("Erreur validation");
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;

    try {
      await api.delete(`/api/admin/products/${id}`);
      toast.success("Supprimé ❌");
      fetchProducts();
    } catch {
      toast.error("Erreur suppression");
    }
  };

  // EDIT
  const handleEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      category_id: p.category?.id || "",
    });

    setEditingId(p.id);
    setPreview(p.image);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">🧑‍💼 Gestion produits</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-8 space-y-4"
      >
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Choisir catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          placeholder="Prix"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          placeholder="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="border p-2 w-full"
        />

        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
          }}
        />

        {preview && <img src={preview} className="w-20" />}

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 w-full"
        />

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          {editingId ? "Modifier" : "Ajouter"}
        </button>
      </form>
      

      <input
        type="text"
        placeholder="🔍 Rechercher produit..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // reset page
        }}
        className="border p-2 rounded w-full mb-4"
      />
      
      {/* LIST */}
      {products.map((p) => (
        <div key={p.id} className="bg-white p-4 mb-3 rounded shadow flex gap-4">
          <img src={p.image} className="w-20 h-20 object-cover" />

          <div className="flex-1">
            <h3>{p.name}</h3>
            <p>{p.price} DH</p>
            <p>{p.category?.name}</p>
          </div>

          <div>
            <button
              onClick={() => handleEdit(p)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Modifier
            </button>

            <button
              onClick={() => handleDelete(p.id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}

      {/* 🔥 PAGINATION */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          ⬅
        </button>

        <span>
          Page {meta.current_page || 1} / {meta.last_page || 1}
        </span>

        <button
          disabled={!meta.next_page_url}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          ➡
        </button>
      </div>
    </div>
  );
}
