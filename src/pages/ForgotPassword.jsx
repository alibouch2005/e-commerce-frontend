import { useState } from "react";
import { forgotPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      return toast.error("Veuillez entrer votre email");
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      toast.success("Email de réinitialisation envoyé 📩");

      setEmail(""); // reset champ

    } catch (err) {
      console.log(err.response?.data);

      toast.error(
        err.response?.data?.message || "Erreur lors de l'envoi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-lg rounded-xl">

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Mot de passe oublié
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        <Input
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer"}
        </Button>

      </form>

    </div>
  );
}