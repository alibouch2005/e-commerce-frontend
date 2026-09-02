import { useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, Clock, ImagePlus, LifeBuoy, MessageSquareText, Send } from "lucide-react";
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
    <div className="min-h-screen bg-[#f7f8fc] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[420px_1fr] lg:gap-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600">
            <LifeBuoy size={16} /> {t("supportClient")}
          </p>
          <h1 className="mt-2 text-3xl font-black text-gray-950 sm:text-4xl">{t("supportTitle")}</h1>
          <p className="mt-4 text-gray-500">{t("supportSubtitle")}</p>

          <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "support", requested_product_name: "" })}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${form.type === "support" ? "bg-indigo-600 text-white" : "text-gray-500"}`}
              >
                {t("supportProblem")}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "product_request", subject: t("productRequestSubject") })}
                className={`rounded-lg px-3 py-2 text-sm font-bold ${form.type === "product_request" ? "bg-indigo-600 text-white" : "text-gray-500"}`}
              >
                {t("requestProduct")}
              </button>
            </div>
            <input required placeholder={t("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500" />
            <input required type="email" placeholder={t("email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="low">{t("low")}</option>
              <option value="normal">{t("normal")}</option>
              <option value="high">{t("high")}</option>
              <option value="urgent">{t("urgent")}</option>
            </select>
            {form.type === "product_request" && (
              <>
                <input required placeholder={t("wantedProductName")} value={form.requested_product_name} onChange={(e) => setForm({ ...form, requested_product_name: e.target.value, subject: e.target.value ? `${t("productRequestSubject")}: ${e.target.value}` : t("productRequestSubject") })} className="w-full rounded-xl bg-amber-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500" />
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-800 hover:bg-amber-100">
                  <ImagePlus size={18} />
                  {productImage ? productImage.name : t("wantedProductPhoto")}
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setProductImage(e.target.files?.[0] || null)} />
                </label>
              </>
            )}
            <input required placeholder={t("subject")} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea required rows="6" placeholder={t("yourMessage")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl bg-gray-50 p-3 text-base outline-none focus:ring-2 focus:ring-indigo-500" />
            <button disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-700 disabled:bg-gray-300">
              <Send size={18} /> {sending ? t("sending") : t("sendMessage")}
            </button>
          </form>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{t("myRequests")}</p>
              <h2 className="text-2xl font-black text-gray-950">{t("supportHistory")}</h2>
            </div>
            <button onClick={loadMessages} className="rounded-xl bg-gray-50 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100">{t("refresh")}</button>
          </div>

          {!user && <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500">{t("loginToSeeSupport")}</div>}
          {user && loadingMessages && <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500">{t("loading")}</div>}
          {user && !loadingMessages && messages.length === 0 && <div className="rounded-2xl bg-gray-50 p-6 text-sm text-gray-500">{t("noSupportMessages")}</div>}

          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message.id} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-black text-gray-950">{message.subject}</h3>
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
                <p className="mt-4 whitespace-pre-wrap text-sm text-gray-600">{message.message}</p>
                {message.admin_reply && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="mb-2 flex items-center gap-2 font-black"><MessageSquareText size={17} /> {t("supportReply")}</p>
                    <p className="whitespace-pre-wrap">{message.admin_reply}</p>
                  </div>
                )}
                {message.status !== "closed" && (
                  <button onClick={() => closeTicket(message)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
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
