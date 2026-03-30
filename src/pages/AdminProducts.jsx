import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]); // AJOUT

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category_id: "", // AJOUT
  });

  const [editingId, setEditingId] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/admin/products");
      setProducts(res.data.data || res.data);
    } catch {
      toast.error("Erreur chargement produits");
    }
  };

  // FETCH CATEGORIES
  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/admin/categories");

      console.log("CATEGORIES API:", res.data); // DEBUG

      // FIX FINAL
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Erreur chargement catégories");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // IMPORTANT
  }, []);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("price", Number(form.price));
    formData.append("stock", Number(form.stock));
    formData.append("category_id", form.category_id); // FIX

    if (image) {
      formData.append("image", image);
    }

    try {
      if (editingId) {
        await api.post(
          `/api/admin/products/${editingId}?_method=PUT`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        toast.success("Produit modifié ✅");
      } else {
        await api.post("/api/admin/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Produit ajouté ✅");
      }

      setForm({
        name: "",
        price: "",
        stock: "",
        category_id: "",
      });

      setImage(null);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Erreur validation");
    }
    setPreview(null);
    console.log("IMAGE FILE:", image);
  };

  //  DELETE
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

  //  EDIT
  const handleEdit = (product) => {
    console.log("PRODUCT CLICKED:", product); // DEBUG

    setForm({
      name: product.name ?? "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      category_id: product.category_id ?? product.category?.id ?? "",
    });

    setEditingId(product.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
    setPreview(product.image || null);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-6">🧑‍💼 Gestion produits</h1>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow mb-6"
      >
        <h2 className="text-lg font-semibold mb-4">
          {editingId ? "✏️ Modifier produit" : " ➕ Ajouter produit"}
        </h2>
        {/*  CATEGORY */}
        <select
          value={form.category_id}
          onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          className="border p-2 rounded mb-4 w-full"
          required
        >
          <option value="">Choisir catégorie</option>

          {Array.isArray(categories) &&
            categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nom"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Prix"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border p-2 rounded"
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];

              console.log("SELECTED FILE:", file); // 🔥 DEBUG

              setImage(file);

              if (file) {
                setPreview(URL.createObjectURL(file));
              }
            }}
            className="border p-2 rounded"
          />
          {preview && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={preview}
                alt="preview"
                className="w-24 h-24 object-cover rounded-lg border shadow"
              />

              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setImage(null);
                }}
                className="text-red-500 text-sm"
              >
                ❌ Supprimer
              </button>
            </div>
          )}
        </div>

        <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
          {editingId ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {/* LISTE */}
      <div className="space-y-4">
        {products.map((p) => {
          console.log("Image:", p.image); // DEBUG
          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
            >
              <img
                src={
                  p.image
                    ? p.image
                    : "https://dummyimage.com/150x150/cccccc/000000&text=No+Image"
                }
                alt={p.name}
                className="w-16 h-16 object-cover rounded"
              />

              <div>
                <p className="font-semibold">{p.name}</p>

                <p className="text-gray-500">
                  {p.price} DH • Stock {p.stock}
                </p>

                <p className="text-xs text-indigo-500">{p.category?.name}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Modifier
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Supprimer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
