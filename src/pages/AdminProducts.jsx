import { useEffect, useState } from "react";
import api from "../Api/axios";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]); // AJOUT

  const [form, setForm] = useState({
    name: "",
    description: "",
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
    formData.append("description", form.description);
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
        description: "",
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
      description: product.description ?? "",
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
  className="bg-white p-6 rounded-2xl shadow mb-8 space-y-4"
>
  <h2 className="text-lg font-semibold">
    {editingId ? "✏️ Modifier produit" : "➕ Ajouter produit"}
  </h2>

  {/* CATEGORY */}
  <select
    value={form.category_id}
    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
    className="border p-3 rounded w-full focus:ring-2 focus:ring-indigo-500"
    required
  >
    <option value="">Choisir catégorie</option>
    {categories.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>

  {/* GRID */}
  <div className="grid md:grid-cols-2 gap-4">

    <input
      type="text"
      placeholder="Nom produit"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="border p-3 rounded"
      required
    />

    <input
      type="number"
      placeholder="Prix (DH)"
      value={form.price}
      onChange={(e) => setForm({ ...form, price: e.target.value })}
      className="border p-3 rounded"
      required
    />

    <input
      type="number"
      placeholder="Stock"
      value={form.stock}
      onChange={(e) => setForm({ ...form, stock: e.target.value })}
      className="border p-3 rounded"
      required
    />

    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) setPreview(URL.createObjectURL(file));
      }}
      className="border p-2 rounded"
    />
  </div>

  {/* DESCRIPTION */}
  <textarea
    placeholder="Description du produit..."
    value={form.description}
    onChange={(e) =>
      setForm({ ...form, description: e.target.value })
    }
    className="border p-3 rounded w-full"
    rows={3}
  />

  {/* PREVIEW */}
  {preview && (
    <div className="flex items-center gap-4">
      <img
        src={preview}
        className="w-20 h-20 object-cover rounded shadow"
      />
      <button
        type="button"
        onClick={() => {
          setPreview(null);
          setImage(null);
        }}
        className="text-red-500"
      >
        ❌ Supprimer
      </button>
    </div>
  )}

  <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
    {editingId ? "Modifier" : "Ajouter"}
  </button>
</form>

      {/* LISTE */}
     <div className="space-y-4">
  {products.map((p) => (
    <div
      key={p.id}
      className="bg-white p-4 rounded-xl shadow flex items-center gap-4"
    >
      {/* IMAGE */}
      <img
        src={
          p.image ||
          "https://dummyimage.com/150x150/cccccc/000000&text=No+Image"
        }
        className="w-20 h-20 object-cover rounded-lg"
      />

      {/* INFOS */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{p.name}</h3>

        <p className="text-sm text-gray-500 line-clamp-2">
          {p.description}
        </p>

        <div className="flex items-center gap-3 mt-1 text-sm">
          <span className="text-indigo-600 font-bold">
            {p.price} DH
          </span>

          <span
            className={`px-2 py-1 rounded text-xs ${
              p.stock > 0
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-500"
            }`}
          >
            {p.stock > 0
              ? `Stock ${p.stock}`
              : "Rupture"}
          </span>
        </div>

        <p className="text-xs text-gray-400">
          {p.category?.name}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-2">
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
</div>
    </div>
  );
}
