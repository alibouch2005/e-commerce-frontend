import { useState } from "react";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) return toast.error(t("enterEmail"));

    try {
      setLoading(true);
      await forgotPassword(email);
      toast.success(t("resetEmailSent"));
      setEmail("");
    } catch (err) {
      showApiError(err, t("messageSendError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded-xl bg-white p-6 shadow-lg">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
        {t("forgotPassword")}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder={t("yourEmail")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={loading}>
          {loading ? t("sending") : t("send")}
        </Button>
      </form>
    </div>
  );
}
