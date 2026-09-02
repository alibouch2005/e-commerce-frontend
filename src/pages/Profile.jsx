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
    <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
        <UserRound className="text-indigo-600" /> {t("profile")}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-gray-600">{t("name")}</label>
          <input
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-1 block text-gray-600">{t("email")}</label>
          <input
            className="w-full rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <button onClick={handleUpdate} className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
          {t("editProfile")}
        </button>
      </div>

      <div className="mt-10 border-t pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-800">
          <KeyRound className="text-gray-700" /> {t("password")}
        </h3>

        <Link to="/change-password">
          <button className="rounded-lg bg-gray-800 px-4 py-2 text-white transition hover:bg-black">
            {t("changePassword")}
          </button>
        </Link>
      </div>
    </div>
  );
}
