import { Link } from "react-router-dom";
import { MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-white"><ShoppingBag /> AliShop</h2>
          <p className="max-w-md text-sm text-gray-400">{t("footerText")}</p>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">{t("navigation")}</h3>
          <div className="space-y-2 text-sm">
            <Link to="/products" className="block hover:text-white">{t("products")}</Link>
            <Link to="/cart" className="block hover:text-white">{t("cart")}</Link>
            <Link to="/orders" className="block hover:text-white">{t("orders")}</Link>
            <Link to="/support" className="block hover:text-white">{t("support")}</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 font-bold text-white">{t("store")}</h3>
          <p className="flex gap-2 text-sm text-gray-400"><MapPin size={16} className="shrink-0" /> Rue 177, 20202 Casablanca</p>
          <p className="mt-2 flex gap-2 text-sm text-gray-400"><MessageCircle size={16} className="shrink-0" /> contact@alishop.ma</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} AliShop. {t("rightsReserved")}</div>
    </footer>
  );
}
