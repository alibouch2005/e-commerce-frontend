import { useCallback, useContext, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  ImagePlus,
  LifeBuoy,
  Mail,
  MessageSquareText,
  PackageSearch,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
import { AuthContext } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

export default function Support() {
  const { user } = useContext(AuthContext);
  const { t, formatDate } = useLanguage();
  const [form, setForm] = useState({ type: "support", name: user?.name || "", email: user?.email || "", subject: "", requested_product_name: "", requested_product_city: "Casablanca", message: "", priority: "normal" });
  const [productImage, setProductImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const priorities = ["low", "normal", "high", "urgent"];
  const openCount = messages.filter((message) => message.status !== "closed").length;
  const resolvedCount = messages.filter((message) => message.status === "closed").length;

  const loadMessages = useCallback(async () => {
    if (user?.role !== "client") return;
    setLoadingMessages(true);
    try {
      const { data } = await api.get("/api/support/messages");
      setMessages(data.data || []);
    } catch {
      toast.error(t("supportLoadError"));
    } finally {
      setLoadingMessages(false);
    }
  }, [t, user?.role]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value || ""));
      if (productImage) payload.append("requested_product_image", productImage);

      await api.post("/api/support/messages", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(t("messageSent"));
      setForm((current) => ({ ...current, subject: "", requested_product_name: "", message: "", priority: "normal" }));
      setProductImage(null);
      await loadMessages();
    } catch (error) {
      showApiError(error, t("messageSendError"));
    } finally {
      setSending(false);
    }
  };

  const closeTicket = async (message) => {
    try {
      await api.patch(`/api/support/messages/${message.id}/close`);
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, status: "closed" } : item));
      toast.success(t("ticketClosed"));
    } catch {
      toast.error(t("closeTicketError"));
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(125deg,#111827_0%,#312e81_52%,#6d28d9_100%)] px-5 py-7 text-white shadow-[0_30px_90px_-35px_rgba(79,70,229,.75)] sm:px-8 sm:py-9 lg:col-span-2">
          <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-indigo-200">
                <Sparkles size={16} /> {t("premiumExperience")}
              </p>
              <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">{t("supportPromise")}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">{t("supportPromiseText")}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                [<MessageSquareText key="guided" size={20} />, t("guidedRequest")],
                [<Clock key="tracked" size={20} />, t("trackedReplies")],
                [<ShieldCheck key="available" size={20} />, t("supportAvailable")],
              ].map(([icon, label]) => (
                <div key={label} className="min-w-0 rounded-2xl border border-white/15 bg-white/10 px-3 py-4 text-center backdrop-blur sm:min-w-28 sm:px-4">
                  <span className="mx-auto grid w-fit place-items-center text-indigo-200">{icon}</span>
                  <p className="mt-2 truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="min-w-0">
          <form onSubmit={submit} className="premium-surface space-y-5 rounded-[1.75rem] p-4 sm:p-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">
                <LifeBuoy size={16} /> {t("supportClient")}
              </p>
              <h2 className="mt-2 text-2xl font-black text-gray-950 dark:text-white">{t("supportTitle")}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{t("supportSubtitle")}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100/80 p-1.5 dark:bg-gray-800">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "support", requested_product_name: "" })}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-sm font-black transition-all ${form.type === "support" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-gray-700 dark:text-indigo-200 dark:ring-gray-600" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"}`}
              >
                <MessageSquareText size={17} /> {t("supportProblem")}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "product_request", subject: t("productRequestSubject") })}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-sm font-black transition-all ${form.type === "product_request" ? "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-100 dark:bg-gray-700 dark:text-indigo-200 dark:ring-gray-600" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"}`}
              >
                <PackageSearch size={17} /> {t("requestProduct")}
              </button>
            </div>

            <fieldset>
              <legend className="mb-3 text-xs font-black uppercase tracking-[.14em] text-gray-500 dark:text-gray-400">{t("contactDetails")}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="relative block">
                  <span className="sr-only">{t("name")}</span>
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required maxLength="255" placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="premium-control w-full py-3 pl-11 pr-4 text-base" />
                </label>
                <label className="relative block">
                  <span className="sr-only">{t("email")}</span>
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input required maxLength="255" type="email" placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="premium-control w-full py-3 pl-11 pr-4 text-base" />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-xs font-black uppercase tracking-[.14em] text-gray-500 dark:text-gray-400">{t("choosePriority")}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    aria-pressed={form.priority === priority}
                    onClick={() => setForm({ ...form, priority })}
                    className={`min-h-10 rounded-xl border px-2 text-xs font-black transition-all ${form.priority === priority ? "border-indigo-500 bg-indigo-600 text-white shadow-[0_8px_20px_-10px_rgba(79,70,229,.8)]" : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"}`}
                  >
                    {t(priority)}
                  </button>
                ))}
              </div>
            </fieldset>

            {form.type === "product_request" && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <input required maxLength="255" placeholder={t("wantedProductName")} value={form.requested_product_name} onChange={(e) => setForm({ ...form, requested_product_name: e.target.value, subject: e.target.value ? `${t("productRequestSubject")}: ${e.target.value}` : t("productRequestSubject") })} className="premium-control w-full px-4 py-3 text-base" />
                <label className="mt-3 flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-amber-300 bg-white/70 p-4 text-center text-sm font-black text-amber-800 transition hover:-translate-y-0.5 hover:bg-white dark:bg-gray-900/60 dark:text-amber-200">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/50"><ImagePlus size={19} /></span>
                  <span className="min-w-0"><span className="block truncate">{productImage ? productImage.name : t("wantedProductPhoto")}</span><span className="mt-1 block text-[10px] font-medium text-amber-700/70 dark:text-amber-300/70">{t("secureAttachment")}</span></span>
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setProductImage(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}

            <fieldset className="space-y-3">
              <legend className="mb-3 text-xs font-black uppercase tracking-[.14em] text-gray-500 dark:text-gray-400">{t("requestDetails")}</legend>
              <input required maxLength="255" placeholder={t("subject")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="premium-control w-full px-4 py-3 text-base" />
              <div>
                <textarea required minLength="10" maxLength="3000" rows="6" placeholder={t("yourMessage")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="premium-control min-h-36 w-full resize-y px-4 py-3 text-base" />
                <p className="mt-1 text-right text-[11px] font-bold text-gray-400">{t("messageCharacters", { count: form.message.length })}</p>
              </div>
            </fieldset>

            <button disabled={sending} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 font-black text-white shadow-[0_16px_35px_-16px_rgba(79,70,229,.8)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-18px_rgba(79,70,229,.9)] disabled:translate-y-0 disabled:from-gray-300 disabled:to-gray-300">
              <Send size={18} /> {sending ? t("sending") : t("sendMessage")}
            </button>
          </form>
        </div>

        <section className="premium-surface min-w-0 rounded-[1.75rem] p-4 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-indigo-600 dark:text-indigo-300">{t("myRequests")}</p>
              <h2 className="mt-1 text-2xl font-black text-gray-950 dark:text-white">{t("supportHistory")}</h2>
            </div>
            <button onClick={loadMessages} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-gray-600 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">{t("refresh")}</button>
          </div>

          {user && !loadingMessages && messages.length > 0 && (
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/40"><p className="text-2xl font-black text-indigo-700 dark:text-indigo-200">{openCount}</p><p className="text-xs font-bold text-indigo-500">{t("openRequests")}</p></div>
              <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/40"><p className="text-2xl font-black text-emerald-700 dark:text-emerald-200">{resolvedCount}</p><p className="text-xs font-bold text-emerald-600">{t("resolvedRequests")}</p></div>
            </div>
          )}

          {!user && <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">{t("loginToSeeSupport")}</div>}
          {user && loadingMessages && <div className="animate-pulse rounded-2xl bg-gray-100 p-8 text-sm text-gray-500 dark:bg-gray-800">{t("loading")}</div>}
          {user && !loadingMessages && messages.length === 0 && <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400"><MessageSquareText className="mx-auto mb-3 text-indigo-400" size={30} />{t("noSupportMessages")}</div>}

          <div className="max-h-[720px] space-y-3 overflow-y-auto overscroll-contain pr-1">
            {messages.map((message) => (
              <article key={message.id} className="premium-lift rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,.55)] dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-black text-gray-950 dark:text-white">{message.subject}</h3>
                    {message.type === "product_request" && (
                      <p className="mt-1 w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{t("requestProduct")}: {message.requested_product_name}</p>
                    )}
                    <p className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <Clock size={14} /> {formatDate(message.created_at)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {t(message.status) || message.status}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">{message.message}</p>
                {message.admin_reply && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="mb-2 flex items-center gap-2 font-black"><MessageSquareText size={17} /> {t("supportReply")}</p>
                    <p className="whitespace-pre-wrap">{message.admin_reply}</p>
                  </div>
                )}
                {message.status !== "closed" && (
                  <button onClick={() => closeTicket(message)} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300">
                    <CheckCircle2 size={16} /> {t("markResolved")}
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
