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
    <main className="flex min-h-[calc(100dvh-4.5rem)] items-center justify-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_30%),radial-gradient(circle_at_bottom_right,#ede9fe,transparent_34%),linear-gradient(135deg,#f8fafc,#eef2ff)] px-4 py-8 sm:px-6 dark:bg-[radial-gradient(circle_at_top_left,#1e1b4b,transparent_32%),radial-gradient(circle_at_bottom_right,#0f766e,transparent_30%),#020617]">
      <div data-testid="auth-card" className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-indigo-100/60 backdrop-blur md:grid-cols-[0.95fr_1.05fr] dark:border-gray-800/80 dark:bg-gray-900/95 dark:shadow-none">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-8 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-14 left-8 h-36 w-36 rounded-full bg-cyan-300/30 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-52 w-52 translate-x-16 translate-y-16 rounded-full bg-fuchsia-300/25 blur-3xl" />

          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/20 shadow-lg backdrop-blur">
              <ShoppingBag size={24} />
            </div>
            <h2 className="mt-8 text-4xl font-black leading-tight">AliShop</h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-indigo-50">{t("loginSubtitle")}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 text-xs font-black">
              <span className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">Panier synchronise</span>
              <span className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">Commande rapide</span>
              <span className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">Support client</span>
              <span className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur">Paiement securise</span>
            </div>
          </div>
          <div className="relative rounded-2xl border border-white/25 bg-white/18 p-4 text-sm font-bold text-white shadow-xl backdrop-blur">
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
    </main>
  );
}
