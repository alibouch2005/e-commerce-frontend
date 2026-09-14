import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock3, Headphones, Mail, MapPin, MessageSquareText, Send, ShieldCheck } from "lucide-react";
import api from "../Api/axios";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

const STORE = { address: "Rue 177, 20202 Casablanca", latitude: 33.55244, longitude: -7.67712 };
const CONTACT_EMAIL = "contact@alishop.ma";
const copy = {
  fr: {
    eyebrow: "Équipe AliShop Casablanca", title: "Parlons de votre besoin.", intro: "Une question sur un produit, une commande ou une livraison ? Écrivez-nous : votre demande rejoint directement notre espace support.",
    details: "Nous contacter", email: "E-mail", address: "Adresse", availability: "Disponibilité", availabilityText: "Réponse selon l’ordre de réception", form: "Envoyer un message", formHint: "Décrivez clairement votre demande pour recevoir une réponse plus rapide.",
    name: "Nom complet", subject: "Sujet", message: "Votre message", send: "Envoyer la demande", sent: "Votre message a bien été envoyé.", support: "Suivre mes discussions", trust: "Vos échanges et pièces jointes sont protégés.",
  },
  en: {
    eyebrow: "AliShop Casablanca team", title: "Let’s discuss what you need.", intro: "Questions about a product, order or delivery? Write to us and your request will go directly to our support workspace.",
    details: "Get in touch", email: "Email", address: "Address", availability: "Availability", availabilityText: "Replies are handled in received order", form: "Send a message", formHint: "Describe your request clearly to get a faster response.",
    name: "Full name", subject: "Subject", message: "Your message", send: "Send request", sent: "Your message has been sent.", support: "View my conversations", trust: "Your messages and attachments are protected.",
  },
  ar: {
    eyebrow: "فريق AliShop بالدار البيضاء", title: "أخبرنا بما تحتاج إليه.", intro: "هل لديك سؤال حول منتج أو طلب أو توصيل؟ أرسل رسالتك لتصل مباشرة إلى فريق الدعم.",
    details: "تواصل معنا", email: "البريد الإلكتروني", address: "العنوان", availability: "التوفر", availabilityText: "تتم الإجابة حسب ترتيب الاستلام", form: "إرسال رسالة", formHint: "اشرح طلبك بوضوح للحصول على رد أسرع.",
    name: "الاسم الكامل", subject: "الموضوع", message: "رسالتك", send: "إرسال الطلب", sent: "تم إرسال رسالتك بنجاح.", support: "متابعة محادثاتي", trust: "رسائلك ومرفقاتك محمية.",
  },
};

export default function Contact() {
  const { user } = useContext(AuthContext);
  const { locale } = useLanguage();
  const text = copy[locale] || copy.fr;
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  useEffect(() => {
    setForm((current) => ({ ...current, name: current.name || user?.name || "", email: current.email || user?.email || "" }));
  }, [user]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post("/api/support/messages", { ...form, type: "support", priority: "normal" });
      setForm((current) => ({ ...current, subject: "", message: "" }));
      toast.success(text.sent);
    } catch (error) {
      showApiError(error, "Impossible d’envoyer votre message.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" dir={locale === "ar" ? "rtl" : "ltr"}>
      <header className="relative isolate overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 px-4 pb-28 pt-14 text-white sm:px-6 sm:pb-36 sm:pt-20">
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,#38bdf8_0,transparent_32%),radial-gradient(circle_at_85%_50%,#a855f7_0,transparent_34%)]" />
        <div className="mx-auto max-w-6xl text-center">
          <img src="/alishop-logo-stacked.png" alt="AliShop" className="mx-auto h-28 w-28 rounded-[2rem] bg-white object-contain shadow-2xl shadow-black/20 sm:h-32 sm:w-32" />
          <p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-sky-300">{text.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">{text.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-indigo-100 sm:text-base">{text.intro}</p>
        </div>
      </header>

      <main className="relative z-10 mx-auto -mt-20 max-w-6xl px-3 pb-14 sm:-mt-24 sm:px-6 sm:pb-20">
        <section className="grid overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,.35)] lg:grid-cols-[.9fr_1.1fr]">
          <aside className="relative overflow-hidden bg-slate-950 p-6 text-white sm:p-9">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />
            <h2 className="relative text-2xl font-black">{text.details}</h2>
            <div className="relative mt-8 space-y-4">
              <ContactLine icon={<Mail size={20} />} label={text.email} value={CONTACT_EMAIL} href={`mailto:${CONTACT_EMAIL}`} />
              <ContactLine icon={<MapPin size={20} />} label={text.address} value={STORE.address} />
              <ContactLine icon={<Clock3 size={20} />} label={text.availability} value={text.availabilityText} />
            </div>
            <div className="relative mt-8 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-indigo-100">
              <ShieldCheck className="mb-3 text-emerald-300" size={22} />
              {text.trust}
            </div>
            {user?.role === "client" && <Link to="/support" className="relative mt-5 inline-flex items-center gap-2 font-black text-sky-300 hover:text-white"><Headphones size={18} /> {text.support}</Link>}
          </aside>

          <div className="p-5 sm:p-9">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><MessageSquareText size={22} /></span>
            <h2 className="mt-5 text-2xl font-black text-slate-950">{text.form}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text.formHint}</p>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label={text.name} name="name" value={form.name} onChange={update} autoComplete="name" />
              <Field label={text.email} name="email" value={form.email} onChange={update} type="email" autoComplete="email" />
              <div className="sm:col-span-2"><Field label={text.subject} name="subject" value={form.subject} onChange={update} /></div>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-black text-slate-700">{text.message}</span>
                <textarea name="message" value={form.message} onChange={update} required minLength={10} maxLength={3000} rows={6} className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" />
              </label>
              <button disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:opacity-60 sm:col-span-2">
                <Send size={18} /> {text.send}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-2 shadow-sm">
          <div className="min-h-72 overflow-hidden rounded-[1.5rem]"><DeliveryMap latitude={STORE.latitude} longitude={STORE.longitude} address={STORE.address} /></div>
        </section>
      </main>
    </div>
  );
}

function ContactLine({ icon, label, value, href }) {
  const content = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/10 text-sky-300">{icon}</span><span><b className="block text-xs uppercase tracking-wider text-indigo-300">{label}</b><span className="mt-1 block text-sm font-bold text-white">{value}</span></span></>;
  return href ? <a href={href} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/10">{content}</a> : <div className="flex items-center gap-3 rounded-2xl p-2">{content}</div>;
}

function Field({ label, ...props }) {
  return <label><span className="mb-2 block text-sm font-black text-slate-700">{label}</span><input {...props} required className="min-h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100" /></label>;
}
