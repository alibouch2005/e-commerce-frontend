import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogIn, ShoppingBag } from "lucide-react";
import { login } from "../services/authService";
import { mergeGuestCart } from "../services/cartService";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { showApiError } from "../utils/showApiError";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);
  const { reloadCart } = useContext(CartContext);
  const { t } = useLanguage();
  const redirectTo = location.state?.from || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const res = await login(email, password);
      const user = res?.data?.user;

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      if (user?.role === "client") await mergeGuestCart();
      await reloadCart();
      toast.success(t("loginSuccess"));

      if (redirectTo) return navigate(redirectTo);
      if (user.role === "livreur") return navigate("/deliveries");
      if (user.role === "admin") return navigate("/admin/dashboard");
      navigate("/");
    } catch (err) {
      showApiError(err, t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef2ff,transparent_34%),#f6f7fb] px-4 py-10 sm:px-6 dark:bg-gray-950">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl shadow-indigo-100/50 md:grid-cols-[0.95fr_1.05fr] dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        <aside className="hidden bg-gray-950 p-8 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <ShoppingBag size={24} />
            </div>
            <h2 className="mt-8 text-4xl font-black leading-tight">AliShop</h2>
            <p className="mt-4 text-sm leading-6 text-gray-300">{t("loginSubtitle")}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-bold text-gray-100">
            {t("loginTrustText")}
          </div>
        </aside>

        <div className="p-5 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <ShoppingBag size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-950">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label={t("email")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label={t("password")} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>

          <Button type="submit" disabled={loading}>
            <span className="inline-flex items-center justify-center gap-2">
              <LogIn size={18} />
              {loading ? t("loginLoading") : t("loginAction")}
            </span>
          </Button>

          <div className="text-center text-sm text-gray-500">
            {t("noAccount")}{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              {t("register")}
            </Link>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
