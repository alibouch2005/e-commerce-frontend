import { useState } from "react";
import { changePassword } from "../services/authService";
import toast from "react-hot-toast";

export default function ChangePassword() {

  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.new_password !== form.new_password_confirmation) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    try {
      await changePassword(form);

      toast.success("Mot de passe modifié 🔥");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
  console.log(err.response.data); // 🔥 debug

  if (err.response?.data?.errors) {
    const errors = err.response.data.errors;

    Object.values(errors).forEach((msg) => {
      toast.error(msg[0]);
    });
  } else {
    toast.error(err.response?.data?.message || "Erreur");
  }
}
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-xl rounded-2xl">

      <h2 className="text-2xl font-bold mb-6 text-center">
        🔐 Changer le mot de passe
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type={show ? "text" : "password"}
          placeholder="Mot de passe actuel"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, current_password: e.target.value })
          }
        />

        <input
          type={show ? "text" : "password"}
          placeholder="Nouveau mot de passe"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setForm({ ...form, new_password: e.target.value })
          }
        />

        <input
          type={show ? "text" : "password"}
          placeholder="Confirmer mot de passe"
          className="w-full border p-3 rounded-lg"
          onChange={(e) =>
            setForm({
              ...form,
              new_password_confirmation: e.target.value,
            })
          }
        />

        {/* Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            onChange={() => setShow(!show)}
          />
          <span>Afficher les mots de passe</span>
        </div>

        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg">
          Mettre à jour
        </button>

      </form>
    </div>
  );
}