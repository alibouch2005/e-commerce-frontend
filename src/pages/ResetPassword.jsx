import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import { resetPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function ResetPassword() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password.length < 8) return toast.error(t("passwordTooShort"));
    if (password !== passwordConfirmation) return toast.error(t("passwordMismatch"));

    try {
      setLoading(true);
      await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      toast.success(t("passwordResetSuccess"));
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      showApiError(err, t("resetError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h1 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-800">
        <KeyRound className="text-indigo-600" /> {t("resetPassword")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input type="email" value={email || ""} disabled />
        <Input type={show ? "text" : "password"} placeholder={t("newPassword")} onChange={(e) => setPassword(e.target.value)} />
        <Input type={show ? "text" : "password"} placeholder={t("passwordConfirm")} onChange={(e) => setPasswordConfirmation(e.target.value)} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" onChange={() => setShow(!show)} />
          <span>{t("showPasswords")}</span>
        </label>

        <Button type="submit" disabled={loading}>
          {loading ? t("resetLoading") : t("resetPassword")}
        </Button>
      </form>
    </div>
  );
}
