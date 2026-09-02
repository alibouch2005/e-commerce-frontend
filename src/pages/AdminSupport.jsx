import { useCallback, useEffect, useState } from "react";
import { MessageCircleReply, Send } from "lucide-react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

const statusValues = ["open", "in_progress", "answered", "closed"];
const priorityValues = ["low", "normal", "high", "urgent"];
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);

export default function AdminSupport() {
  const { t, formatDate } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});
  const [saving, setSaving] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get("/api/admin/support/messages");
    setMessages(data.data || []);
  }, []);

  useEffect(() => {
    void load().catch(() => toast.error(t("supportAdminLoadError")));
  }, [load, t]);

  const updateMessage = async (message, changes) => {
    try {
      setSaving(message.id);
      const { data } = await api.patch(`/api/admin/support/messages/${message.id}`, {
        status: changes.status ?? message.status,
        priority: changes.priority ?? message.priority,
        admin_reply: changes.admin_reply,
      });
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, ...data } : item));
      if (changes.admin_reply) setReplies((current) => ({ ...current, [message.id]: "" }));
      toast.success(t("supportUpdated"));
    } catch (error) {
      showApiError(error, t("updateImpossible"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-indigo-600">{t("support")}</p>
        <h1 className="text-2xl font-black">{t("adminSupportWorkflow")}</h1>
        <p className="text-gray-500">{t("adminSupportSubtitle")}</p>
      </div>

      <div className="grid gap-4">
        {messages.length ? messages.map((message) => (
          <article key={message.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row">
              <div className="min-w-0">
                <h2 className="font-black text-gray-950">{message.subject}</h2>
                {message.type === "product_request" && (
                  <p className="mt-1 w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                    {t("requestProduct")}: {message.requested_product_name} · {message.requested_product_city || "Casablanca"}
                  </p>
                )}
                <p className="text-sm text-gray-500">{message.name} · {message.email}</p>
                <p className="mt-1 text-xs text-gray-400">{formatDate(message.created_at)}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <select value={message.priority || "normal"} onChange={(e) => updateMessage(message, { priority: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  {priorityValues.map((value) => <option key={value} value={value}>{t(value)}</option>)}
                </select>
                <select value={message.status} onChange={(e) => updateMessage(message, { status: e.target.value })} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  {statusValues.map((value) => <option key={value} value={value}>{t(value)}</option>)}
                </select>
              </div>
            </div>

            <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-gray-700">{message.message}</p>
            {message.requested_product_image && (
              <a href={assetUrl(message.requested_product_image)} target="_blank" rel="noreferrer" className="mt-4 block w-fit overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-2">
                <img src={assetUrl(message.requested_product_image)} alt={message.requested_product_name || message.subject} className="h-32 w-44 rounded-xl object-cover" />
              </a>
            )}

            {message.admin_reply && (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                <p className="mb-2 flex items-center gap-2 font-black"><MessageCircleReply size={17} /> {t("lastReply")}</p>
                <p className="whitespace-pre-wrap">{message.admin_reply}</p>
              </div>
            )}

            <div className="mt-4 grid gap-3">
              <textarea
                value={replies[message.id] || ""}
                onChange={(e) => setReplies((current) => ({ ...current, [message.id]: e.target.value }))}
                placeholder={t("writeCustomerReply")}
                rows="3"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                disabled={saving === message.id || !(replies[message.id] || "").trim()}
                onClick={() => updateMessage(message, { admin_reply: replies[message.id] })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700 disabled:bg-gray-300 sm:w-fit"
              >
                <Send size={17} /> {t("sendReply")}
              </button>
            </div>
          </article>
        )) : <div className="rounded-2xl bg-white p-8 text-gray-400">{t("noCustomerMessage")}</div>}
      </div>
    </div>
  );
}
