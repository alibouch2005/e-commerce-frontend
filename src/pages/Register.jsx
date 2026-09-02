import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { register } from "../services/authService";
import { mergeGuestCart } from "../services/cartService";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { showApiError } from "../utils/showApiError";

export default function Register() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const { reloadCart } = useContext(CartContext);
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "client",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password.length < 8) return toast.error(t("passwordTooShort"));
    if (form.password !== form.password_confirmation) return toast.error(t("passwordMismatch"));

    try {
      setLoading(true);
      const res = await register(form);
      const user = res?.data?.user;

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      await mergeGuestCart();
      await reloadCart();
      toast.success(t("accountCreated"));
      navigate("/cart");
    } catch (err) {
      showApiError(err, t("registerError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ecfeff,transparent_34%),#f6f7fb] px-4 py-10 sm:px-6 dark:bg-gray-950">
      <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl shadow-emerald-100/50 sm:p-8 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-950">{t("createAccount")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("registerSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input name="name" placeholder={t("name")} onChange={handleChange} />
          <Input name="email" type="email" placeholder={t("email")} onChange={handleChange} />
          <Input name="phone" placeholder={t("phone")} onChange={handleChange} />
          <Input name="address" placeholder={t("addressOptional")} onChange={handleChange} />
          <Input name="password" type="password" placeholder={t("password")} onChange={handleChange} />
          <Input name="password_confirmation" type="password" placeholder={t("passwordConfirm")} onChange={handleChange} />

          <Button type="submit" fullWidth disabled={loading} className="sm:col-span-2">
            {loading ? t("registerLoading") : t("register")}
          </Button>

          <div className="text-center text-sm text-gray-500 sm:col-span-2">
            {t("alreadyAccount")}{" "}
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              {t("loginAction")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
