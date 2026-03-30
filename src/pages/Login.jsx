import { useState, useContext } from "react";
import { login } from "../services/authService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function Login() {

  const navigate = useNavigate();
  const location = useLocation(); // IMPORTANT

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);

  //  récupérer page précédente (ex: checkout)
  const redirectTo = location.state?.from || null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await login(email, password);
      const user = res?.data?.user;

      setUser(user);

      toast.success("Connexion réussie 👋");

      // PRIORITÉ 1 : retourner là où user voulait aller
      if (redirectTo) {
        navigate(redirectTo);
        return;
      }

      // PRIORITÉ 2 : redirection par rôle
      if (user.role === "livreur") {
        navigate("/deliveries");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      const message =
        err?.response?.data?.message || "Erreur de connexion";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg">

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <h1 className="text-2xl font-bold text-center text-gray-800">
          Connexion
        </h1>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-indigo-600 text-sm hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Button */}
        <Button type="submit" disabled={loading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

        {/* Register */}
        <div className="text-center text-sm mt-2">
          Pas de compte ?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline"
          >
            S'inscrire
          </Link>
        </div>

      </form>
    </div>
  );
}