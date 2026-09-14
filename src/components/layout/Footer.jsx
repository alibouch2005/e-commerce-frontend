import { Link } from "react-router-dom";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Footer() {
  const { t, locale } = useLanguage();
  const legal = {
    fr: ["Informations", "Contact", "Livraison et retours", "Conditions de vente", "Confidentialité"],
    en: ["Information", "Contact", "Delivery and returns", "Terms of sale", "Privacy"],
    ar: ["معلومات", "اتصل بنا", "التوصيل والإرجاع", "شروط البيع", "الخصوصية"],
  }[locale] || ["Informations", "Contact", "Livraison et retours", "Conditions de vente", "Confidentialité"];

  const sectionClass = "rounded-2xl border border-white/10 bg-white/[.045] p-4 backdrop-blur-sm md:border-0 md:bg-transparent md:p-0";
  const linkClass = "flex min-h-9 items-center rounded-lg py-1.5 text-xs font-semibold text-slate-400 transition hover:translate-x-0.5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 sm:text-sm";

  return (
    <footer dir={locale === "ar" ? "rtl" : "ltr"} className="relative isolate overflow-hidden bg-slate-950 text-slate-300">
      <div aria-hidden="true" className="absolute -left-24 -top-32 -z-10 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-36 right-0 -z-10 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-3 py-7 sm:gap-5 sm:px-6 sm:py-10 md:grid-cols-4 md:gap-8 md:py-12">
        <div className="col-span-2 rounded-[1.4rem] border border-indigo-400/15 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-4 text-center md:col-span-1 md:border-0 md:bg-none md:p-0 md:text-start">
          <img src="/alishop-logo-on-dark.png" alt="AliShop" className="mx-auto h-14 w-44 max-w-full rounded-2xl object-contain shadow-lg shadow-black/20 md:mx-0" />
          <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6 md:mx-0">{t("footerText")}</p>
          <span className="mt-4 inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-emerald-300">
            Casablanca · AliShop
          </span>
        </div>

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white sm:text-sm">{legal[0]}</h3>
          <nav aria-label={legal[0]}>
            <Link to="/contact" className={linkClass}>{legal[1]}</Link>
            <Link to="/legal/delivery-returns" className={linkClass}>{legal[2]}</Link>
            <Link to="/legal/terms" className={linkClass}>{legal[3]}</Link>
            <Link to="/legal/privacy" className={linkClass}>{legal[4]}</Link>
          </nav>
        </section>

        <section className={sectionClass}>
          <h3 className="mb-2 text-xs font-black uppercase tracking-[.12em] text-white sm:text-sm">{t("navigation")}</h3>
          <nav aria-label={t("navigation")}>
            <Link to="/products" className={linkClass}>{t("products")}</Link>
            <Link to="/cart" className={linkClass}>{t("cart")}</Link>
            <Link to="/orders" className={linkClass}>{t("orders")}</Link>
            <Link to="/support" className={linkClass}>{t("support")}</Link>
          </nav>
        </section>

        <section className={`${sectionClass} col-span-2 md:col-span-1`}>
          <h3 className="mb-3 text-xs font-black uppercase tracking-[.12em] text-white sm:text-sm">{t("store")}</h3>
          <div className="grid gap-2">
            <p className="flex min-w-0 items-start gap-2 rounded-xl bg-white/[.04] p-2.5 text-xs leading-5 text-slate-400 md:bg-transparent md:p-0 sm:text-sm"><MapPin size={16} className="mt-0.5 shrink-0 text-indigo-300" /><span>Rue 177, 20202 Casablanca</span></p>
            <a href="mailto:contact@alishop.ma" className="flex min-h-10 min-w-0 items-center gap-2 rounded-xl bg-white/[.04] p-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[.08] hover:text-white md:bg-transparent md:p-0 sm:text-sm"><Mail size={16} className="shrink-0 text-indigo-300" /><span className="truncate">contact@alishop.ma</span></a>
            <Link to="/support" className="flex min-h-10 items-center gap-2 rounded-xl bg-white/[.04] p-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/[.08] hover:text-white md:bg-transparent md:p-0 sm:text-sm"><MessageCircle size={16} className="shrink-0 text-indigo-300" /> {t("needHelp")}</Link>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10 bg-black/10 px-4 pt-4 text-center text-[10px] font-medium tracking-wide text-slate-500 [padding-bottom:max(1rem,env(safe-area-inset-bottom))] sm:text-xs">
        © {new Date().getFullYear()} AliShop · {t("rightsReserved")}
      </div>
    </footer>
  );
}
