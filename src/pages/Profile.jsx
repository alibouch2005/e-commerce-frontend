import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../Api/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast"; 

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleUpdate = async () => {
    try {
      const res = await api.put("/api/user", form);

      setUser(res.data.user);

      toast.success("Profil mis à jour ✅"); 

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la mise à jour"
      );
    }
  };

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-500">
        Chargement...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">
      
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        👤 Mon Profil
      </h2>

      {/* Infos utilisateur */}
      <div className="space-y-4">
        
        <div>
          <label className="block text-gray-600 mb-1">Nom</label>
          <input
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-gray-600 mb-1">Email</label>
          <input
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        <button
          onClick={handleUpdate}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Modifier profil
        </button>
      </div>

      {/* Section mot de passe */}
      <div className="mt-10 border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          🔐 Mot de passe
        </h3>

        <Link to="/change-password">
          <button className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg transition">
            Changer mot de passe
          </button>
        </Link>
      </div>
    </div>
  );
}