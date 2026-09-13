import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, KeyRound, Loader2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { changePassword } from "../services/authService";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";
import Input from "../components/ui/Input";

export default function ChangePassword() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ current_password: "", new_password: "", new_password_confirmation: "" });
  const rules = useMemo(() => [
    { label: "8 caractères minimum", ok: form.new_password.length >= 8 },
    { label: "Une lettre majuscule et une minuscule", ok: /[a-z]/.test(form.new_password) && /[A-Z]/.test(form.new_password) },
    { label: "Au moins un chiffre", ok: /\d/.test(form.new_password) },
    { label: "Les deux nouveaux mots de passe correspondent", ok: Boolean(form.new_password) && form.new_password === form.new_password_confirmation },
  ], [form.new_password, form.new_password_confirmation]);
  const strength = rules.filter((rule) => rule.ok).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rules.every((rule) => rule.ok)) return toast.error(t("passwordMismatch"));
    setSaving(true);
    try {
      await changePassword(form);
      toast.success("Mot de passe modifié. Reconnectez-vous en toute sécurité.");
      window.setTimeout(() => { window.location.href = "/login"; }, 1200);
    } catch (error) {
      showApiError(error, t("updateError"));
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-[calc(100vh-5rem)] bg-[#f7f8fc] px-4 py-8 sm:px-6 sm:py-12">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_90px_-40px_rgba(49,46,129,.55)] lg:grid-cols-[.85fr_1.15fr]">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-800 p-7 text-white sm:p-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative"><span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10"><ShieldCheck size={28} /></span><p className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-indigo-200"><Sparkles size={15} /> Sécurité du compte</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{t("changePassword")}</h1><p className="mt-4 leading-7 text-indigo-100">Choisissez un mot de passe unique. Après la modification, une nouvelle connexion protège immédiatement votre session.</p>
          <div className="mt-8 space-y-3">{["Aucun mot de passe n’est affiché en clair par défaut", "Vérification sécurisée du mot de passe actuel", "Déconnexion après la modification"].map((text) => <p key={text} className="flex gap-3 text-sm text-indigo-100"><CheckCircle2 className="shrink-0 text-emerald-300" size={18} />{text}</p>)}</div>
        </div>
      </section>
      <section className="p-5 sm:p-9 lg:p-12"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><KeyRound /></span><div><h2 className="text-xl font-black text-gray-950">Nouveaux identifiants</h2><p className="text-sm text-gray-500">Tous les champs sont obligatoires.</p></div></div>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <Input required autoComplete="current-password" label={t("currentPassword")} type="password" value={form.current_password} onChange={(event) => setForm({ ...form, current_password: event.target.value })} />
          <Input required autoComplete="new-password" label={t("newPassword")} type="password" value={form.new_password} onChange={(event) => setForm({ ...form, new_password: event.target.value })} />
          <Input required autoComplete="new-password" label={t("passwordConfirm")} type="password" value={form.new_password_confirmation} onChange={(event) => setForm({ ...form, new_password_confirmation: event.target.value })} />
          <div className="rounded-2xl bg-gray-50 p-4"><div className="mb-3 grid grid-cols-4 gap-2">{[0,1,2,3].map((item) => <span key={item} className={`h-1.5 rounded-full ${item < strength ? strength < 3 ? "bg-amber-400" : "bg-emerald-500" : "bg-gray-200"}`} />)}</div>{rules.map((rule) => <p key={rule.label} className={`mt-2 flex gap-2 text-xs font-bold ${rule.ok ? "text-emerald-700" : "text-gray-400"}`}><CheckCircle2 size={15} />{rule.label}</p>)}</div>
          <button disabled={saving || !form.current_password || !rules.every((rule) => rule.ok)} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:from-gray-300 disabled:to-gray-300">{saving ? <Loader2 className="animate-spin" /> : <LockKeyhole size={20} />}{saving ? "Sécurisation…" : t("update")}</button>
        </form>
      </section>
    </div>
  </main>;
}
