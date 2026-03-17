import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔥 validation frontend
    if (password.length < 8) {
      return toast.error("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (password !== passwordConfirmation) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    try {
      setLoading(true);

      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Mot de passe réinitialisé 🎉");

      // 🔥 redirection login
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.log(err.response?.data);

      toast.error(
        err.response?.data?.message || "Erreur lors de la réinitialisation"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-2xl">

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        🔐 Réinitialiser mot de passe
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Email */}
        <Input type="email" value={email} disabled />

        {/* Password */}
        <Input
          type={show ? "text" : "password"}
          placeholder="Nouveau mot de passe"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          type={show ? "text" : "password"}
          placeholder="Confirmer mot de passe"
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />

        {/* Toggle */}
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            onChange={() => setShow(!show)}
          />
          <span>Afficher les mots de passe</span>
        </div>

        {/* Button */}
        <Button type="submit" disabled={loading}>
          {loading ? "Réinitialisation..." : "Réinitialiser"}
        </Button>

      </form>
    </div>
  );
}