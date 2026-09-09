import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { KeyRound, UserRound } from "lucide-react";
import api from "../Api/axios";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const handleUpdate = async () => {
    try {
      const res = await api.put("/api/user", form);
      setUser(res.data.user);
      toast.success(t("profileUpdated"));
    } catch (err) {
      showApiError(err, t("profileUpdateError"));
    }
  };

  if (!user) {
    return <div className="mt-10 text-center text-gray-500">{t("loading")}</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <section className="premium-surface overflow-hidden rounded-[2rem]">
        <div className="relative bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white sm:p-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-2xl font-black ring-1 ring-white/20">{user.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0"><p className="text-xs font-black uppercase tracking-[.18em] text-indigo-200">AliShop</p><h2 className="truncate text-2xl font-black sm:text-3xl">{t("profile")}</h2><p className="truncate text-sm text-indigo-100">{user.email}</p></div>
          </div>
        </div>

      <div className="space-y-5 p-5 sm:p-8">
        <div>
          <label className="mb-2 block text-sm font-black text-gray-700 dark:text-gray-200">{t("name")}</label>
          <input
            className="premium-control w-full px-4 py-3"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-gray-700 dark:text-gray-200">{t("email")}</label>
          <input
            className="premium-control w-full px-4 py-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <button onClick={handleUpdate} className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-black text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 sm:w-auto">
          {t("editProfile")}
        </button>
      </div>

      <div className="border-t border-gray-100 p-5 sm:p-8 dark:border-gray-800">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-gray-800 dark:text-white">
          <KeyRound className="text-indigo-600" /> {t("password")}
        </h3>

        <Link to="/change-password">
          <button className="rounded-2xl bg-gray-950 px-5 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-indigo-950 dark:bg-indigo-600">
            {t("changePassword")}
          </button>
        </Link>
      </div>
      </section>
    </div>
  );
}
