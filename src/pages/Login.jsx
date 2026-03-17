import { useState, useContext } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await login(email, password);

      setUser(res.data.user);
      navigate("/");

    } catch (err) {
      const message =
        err?.response?.data?.message || "Erreur de connexion";

      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-xl shadow-lg">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Connexion
        </h1>

        {/* Email */}
        <Input
          label="Email"
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <Input
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* 🔥 Forgot Password */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-600 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        {/* Button */}
        <Button type="submit" variant="primary" size="md">
          Se connecter
        </Button>

        {/* 🔥 Register link */}
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