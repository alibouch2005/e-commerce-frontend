import { useContext, useState } from "react";
import { register } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "client",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
   const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 validation frontend
    if (form.password.length < 8) {
      return toast.error("Mot de passe au moins 8 caractères");
    }

    if (form.password !== form.password_confirmation) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    try {
      setLoading(true);

      const res = await register(form);
      const user = res?.data?.user;
      console.log("REGISTER RESPONSE:", user); 
      setUser(user);

      toast.success("Compte créé avec succès 🎉");

      
      
        navigate("/");
    

    } catch (err) {
      console.log(err.response?.data);

      // afficher erreurs Laravel
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;

        Object.values(errors).forEach((msg) => {
          toast.error(msg[0]);
        });
      } else {
        toast.error(
          err.response?.data?.message || "Erreur inscription"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-2xl">

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Créer un compte
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Input name="name" placeholder="Nom" onChange={handleChange} />

        <Input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <Input
          name="phone"
          placeholder="Téléphone"
          onChange={handleChange}
        />

        <Input
          name="address"
          placeholder="Adresse (optionnel)"
          onChange={handleChange}
        />

        <select
          name="role"
          onChange={handleChange}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="client">Client</option>
          <option value="livreur">Livreur</option>
        </select>

        <Input
          name="password"
          type="password"
          placeholder="Mot de passe"
          onChange={handleChange}
        />

        <Input
          name="password_confirmation"
          type="password"
          placeholder="Confirmer mot de passe"
          onChange={handleChange}
        />

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </Button>

        {/* 🔥 login link */}
        <div className="text-center text-sm mt-2">
          Déjà un compte ?{" "}
          <Link
            to="/login"
            className="text-indigo-600 hover:underline"
          >
            Se connecter
          </Link>
        </div>

      </form>
    </div>
  );
}