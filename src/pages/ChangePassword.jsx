import { useState } from "react";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import { changePassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function ChangePassword() {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.new_password !== form.new_password_confirmation) {
      return toast.error(t("passwordMismatch"));
    }

    try {
      await changePassword(form);
      toast.success(t("profileUpdated"));
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      showApiError(err, t("updateError"));
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold">
        <KeyRound className="text-indigo-600" /> {t("changePassword")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type={show ? "text" : "password"}
          placeholder={t("currentPassword")}
          className="w-full rounded-lg border p-3"
          onChange={(e) => setForm({ ...form, current_password: e.target.value })}
        />

        <input
          type={show ? "text" : "password"}
          placeholder={t("newPassword")}
          className="w-full rounded-lg border p-3"
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
        />

        <input
          type={show ? "text" : "password"}
          placeholder={t("passwordConfirm")}
          className="w-full rounded-lg border p-3"
          onChange={(e) => setForm({ ...form, new_password_confirmation: e.target.value })}
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" onChange={() => setShow(!show)} />
          <span>{t("showPasswords")}</span>
        </label>

        <button className="w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600">
          {t("update")}
        </button>
      </form>
    </div>
  );
}
