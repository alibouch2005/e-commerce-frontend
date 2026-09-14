import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Clock3, ExternalLink, Inbox, Loader2, Mail, MessageCircleReply, PackageSearch, Search, Send, UserRound } from "lucide-react";
import api from "../Api/axios";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";
import { showApiError } from "../utils/showApiError";

const statuses = {
  open: { label: "Ouvert", className: "bg-sky-50 text-sky-700" },
  in_progress: { label: "En traitement", className: "bg-amber-50 text-amber-700" },
  answered: { label: "Répondu", className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Fermé", className: "bg-slate-100 text-slate-600" },
};
const priorities = {
  low: { label: "Faible", className: "bg-slate-100 text-slate-600" },
  normal: { label: "Normale", className: "bg-indigo-50 text-indigo-700" },
  high: { label: "Haute", className: "bg-orange-50 text-orange-700" },
  urgent: { label: "Urgente", className: "bg-red-50 text-red-700" },
};
const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "").replace(/\/api$/, "");
const assetUrl = (path) => (!path ? "" : path.startsWith("http") ? path : `${apiUrl}${path}`);

export default function AdminSupport() {
  const { formatDate } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, urgent: 0, answered: 0, closed: 0 });
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/support/messages", { params: { page, search: search || undefined, status: status || undefined, priority: priority || undefined, type: type || undefined } });
      const nextMessages = data.data || [];
      setMessages(nextMessages);
      setSummary(data.summary || summary);
      setMeta({ current_page: data.current_page || 1, last_page: data.last_page || 1, total: data.total || 0, from: data.from, to: data.to });
      setSelectedId((current) => nextMessages.some((message) => message.id === current) ? current : nextMessages[0]?.id || null);
    } catch (error) {
      showApiError(error, "Impossible de charger les demandes clients");
    } finally {
      setLoading(false);
    }
  // summary is intentionally refreshed from the API, not used to trigger requests.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, priority, search, status, type]);

  useEffect(() => { void load(); }, [load]);
  const selected = useMemo(() => messages.find((message) => message.id === selectedId) || null, [messages, selectedId]);

  const updateTicket = async (changes) => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/api/admin/support/messages/${selected.id}`, {
        status: changes.status ?? selected.status,
        priority: changes.priority ?? selected.priority,
        admin_reply: changes.admin_reply,
      });
      setMessages((current) => current.map((item) => item.id === selected.id ? { ...item, ...data } : item));
      if (changes.admin_reply) setReply("");
      toast.success(changes.admin_reply ? "Réponse envoyée au client" : "Ticket mis à jour");
      await load();
    } catch (error) {
      showApiError(error, "Mise à jour du ticket impossible");
    } finally {
      setSaving(false);
    }
  };

  const resetFilters = () => { setSearchInput(""); setSearch(""); setStatus(""); setPriority(""); setType(""); setPage(1); };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-12 -top-16 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="relative"><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-200">Relation client</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black sm:text-4xl"><Inbox /> Centre de support</h1><p className="mt-2 max-w-2xl text-sm text-indigo-100">Traitez chaque demande, priorisez les urgences et conservez une réponse claire pour le client.</p></div>
        <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <SupportMetric label="Total" value={summary.total} icon={<Inbox />} />
          <SupportMetric label="À traiter" value={summary.active} icon={<Clock3 />} />
          <SupportMetric label="Urgents" value={summary.urgent} icon={<AlertTriangle />} danger />
          <SupportMetric label="Répondus" value={summary.answered} icon={<MessageCircleReply />} />
          <SupportMetric label="Fermés" value={summary.closed} icon={<CheckCircle2 />} />
        </div>
      </header>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,170px)_auto]">
          <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-gray-50 px-4"><Search size={18} className="text-gray-400" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Sujet, client, email ou message…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
          <FilterSelect label="Statut" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={Object.entries(statuses)} />
          <FilterSelect label="Priorité" value={priority} onChange={(value) => { setPriority(value); setPage(1); }} options={Object.entries(priorities)} />
          <FilterSelect label="Type" value={type} onChange={(value) => { setType(value); setPage(1); }} options={[["support", "Support"], ["product_request", "Produit demandé"]]} />
          <button type="button" onClick={resetFilters} className="min-h-12 rounded-2xl bg-gray-100 px-4 text-sm font-black text-gray-600 hover:bg-gray-200">Réinitialiser</button>
        </div>
      </section>

      <section className="grid min-h-[620px] overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm xl:grid-cols-[390px_1fr]">
        <div className="border-b border-gray-100 xl:border-b-0 xl:border-r">
          <div className="border-b border-gray-100 p-4"><p className="font-black text-gray-950">Boîte de réception</p><p className="text-xs text-gray-500">{meta.total} résultat(s)</p></div>
          <div className="max-h-[640px] overflow-y-auto">
            {loading ? <div className="grid place-items-center p-16"><Loader2 className="animate-spin text-indigo-600" /></div> : messages.length ? messages.map((message) => {
              const ticketStatus = statuses[message.status] || statuses.open;
              const ticketPriority = priorities[message.priority] || priorities.normal;
              return <button key={message.id} type="button" onClick={() => { setSelectedId(message.id); setReply(""); }} className={`w-full border-b border-gray-100 p-4 text-left transition hover:bg-indigo-50/50 ${selectedId === message.id ? "bg-indigo-50 ring-1 ring-inset ring-indigo-100" : "bg-white"}`}>
                <div className="flex items-start justify-between gap-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${ticketPriority.className}`}>{ticketPriority.label}</span><span className="text-[10px] font-bold text-gray-400">{formatDate(message.created_at, { dateStyle: "short" })}</span></div>
                <p className="mt-3 line-clamp-1 font-black text-gray-950">{message.subject}</p><p className="mt-1 truncate text-xs text-gray-500">{message.name} · {message.email}</p>
                <div className="mt-3 flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${ticketStatus.className}`}>{ticketStatus.label}</span>{message.type === "product_request" && <PackageSearch size={16} className="text-amber-600" />}</div>
              </button>;
            }) : <div className="p-12 text-center"><Inbox className="mx-auto text-gray-300" size={38} /><p className="mt-3 text-sm font-bold text-gray-500">Aucun ticket trouvé</p><button type="button" onClick={resetFilters} className="mt-3 text-sm font-black text-indigo-600">Effacer les filtres</button></div>}
          </div>
          <Pagination meta={meta} page={page} onPage={setPage} />
        </div>

        <div className="min-w-0 bg-gray-50/40 p-4 sm:p-6">
          {selected ? <TicketDetail message={selected} reply={reply} setReply={setReply} saving={saving} updateTicket={updateTicket} formatDate={formatDate} /> : <div className="grid h-full min-h-80 place-items-center text-center"><div><Mail className="mx-auto text-gray-300" size={48} /><p className="mt-4 font-black text-gray-700">Sélectionnez une demande</p><p className="mt-1 text-sm text-gray-400">Le détail complet apparaîtra ici.</p></div></div>}
        </div>
      </section>
    </div>
  );
}

function TicketDetail({ message, reply, setReply, saving, updateTicket, formatDate }) {
  const status = statuses[message.status] || statuses.open;
  const priority = priorities[message.priority] || priorities.normal;
  return <article className="mx-auto max-w-3xl space-y-5">
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${status.className}`}>{status.label}</span><span className={`rounded-full px-3 py-1 text-xs font-black ${priority.className}`}>{priority.label}</span>{message.type === "product_request" && <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Produit demandé</span>}</div><h2 className="mt-4 break-words text-2xl font-black text-gray-950">{message.subject}</h2><p className="mt-2 text-xs text-gray-400">Ticket {message.id} · reçu le {formatDate(message.created_at)}</p></div></div>
      <div className="mt-5 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2"><div className="flex items-center gap-3"><UserRound className="text-indigo-600" size={19} /><div className="min-w-0"><p className="truncate font-bold text-gray-900">{message.name}</p><p className="truncate text-xs text-gray-500">{message.email}</p></div></div>{message.user && <div className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-emerald-700">Client enregistré</div>}</div>
      {message.type === "product_request" && <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4"><p className="text-xs font-black uppercase tracking-wider text-amber-700">Produit recherché</p><p className="mt-1 font-black text-gray-950">{message.requested_product_name} · {message.requested_product_city || "Casablanca"}</p>{message.requested_product_image && <a href={assetUrl(message.requested_product_image)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-black text-indigo-700"><ExternalLink size={16} /> Ouvrir la photo</a>}</div>}
      <div className="mt-5"><p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">Message du client</p><p className="whitespace-pre-wrap break-words rounded-2xl bg-slate-950 p-5 leading-7 text-slate-100">{message.message}</p></div>
      {message.attachment_url && (message.attachment_type === "audio" ? <audio controls preload="metadata" className="mt-4 w-full" src={assetUrl(message.attachment_url)} /> : <a href={assetUrl(message.attachment_url)} target="_blank" rel="noreferrer" className="mt-4 block"><img src={assetUrl(message.attachment_url)} alt="Pièce jointe envoyée par le client" className="max-h-80 w-full rounded-2xl border border-gray-100 object-contain" /></a>)}
      {message.requested_product_image && <img src={assetUrl(message.requested_product_image)} alt={message.requested_product_name || message.subject} className="mt-4 max-h-72 w-full rounded-2xl border border-gray-100 object-contain" />}
    </div>

    <div className="grid gap-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6"><label className="text-xs font-black uppercase tracking-wider text-gray-500">Priorité<select value={message.priority || "normal"} disabled={saving} onChange={(event) => updateTicket({ priority: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold normal-case outline-none focus:ring-2 focus:ring-indigo-500">{Object.entries(priorities).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select></label><label className="text-xs font-black uppercase tracking-wider text-gray-500">Statut<select value={message.status} disabled={saving} onChange={(event) => updateTicket({ status: event.target.value })} className="mt-2 min-h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold normal-case outline-none focus:ring-2 focus:ring-indigo-500">{Object.entries(statuses).map(([value, config]) => <option key={value} value={value}>{config.label}</option>)}</select></label></div>

    <ConversationHistory message={message} formatDate={formatDate} />

    <div className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"><label htmlFor="support-reply" className="font-black text-gray-950">Répondre au client</label><p className="mt-1 text-xs text-gray-500">La réponse sera enregistrée et une notification sera envoyée au client connecté.</p><textarea id="support-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={5} maxLength={5000} placeholder="Écrivez une réponse précise avec la solution ou la prochaine étape…" className="mt-4 w-full resize-y rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100" /><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs font-bold text-gray-400">{reply.length} / 5000 caractères</span><button type="button" disabled={saving || reply.trim().length < 5} onClick={() => updateTicket({ admin_reply: reply.trim() })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 font-black text-white shadow-lg transition hover:bg-indigo-700 disabled:bg-gray-300">{saving ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Envoyer la réponse</button></div></div>
  </article>;
}

function ConversationHistory({ message, formatDate }) {
  const replies = message.replies || [];
  if (!replies.length && !message.admin_reply) return null;
  return <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"><p className="flex items-center gap-2 font-black text-gray-950"><MessageCircleReply size={18} className="text-indigo-600" /> Discussion avec le client · Dernière réponse envoyée</p><div className="mt-5 space-y-3">
    {replies.map((reply) => <div key={reply.id} className={`flex ${reply.sender_role === "admin" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 ${reply.sender_role === "admin" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-800"}`}><p className="whitespace-pre-wrap break-words text-sm leading-6">{reply.message}</p><p className={`mt-2 text-[10px] font-bold ${reply.sender_role === "admin" ? "text-indigo-200" : "text-gray-400"}`}>{reply.sender?.name || (reply.sender_role === "admin" ? "Support AliShop" : message.name)} · {formatDate(reply.created_at)}</p></div></div>)}
    {!replies.length && message.admin_reply && <div className="flex justify-end"><div className="max-w-[88%] rounded-2xl bg-indigo-600 px-4 py-3 text-white"><p className="whitespace-pre-wrap text-sm">{message.admin_reply}</p><p className="mt-2 text-[10px] text-indigo-200">Ancienne réponse enregistrée</p></div></div>}
  </div></section>;
}

function SupportMetric({ label, value, icon, danger = false }) { return <div className={`rounded-2xl border p-3 backdrop-blur ${danger && value ? "border-red-300/30 bg-red-400/20" : "border-white/15 bg-white/10"}`}><div className="flex items-center justify-between text-indigo-100">{icon}<span className="text-2xl font-black text-white">{value || 0}</span></div><p className="mt-2 text-xs font-bold">{label}</p></div>; }
function FilterSelect({ label, value, onChange, options }) { return <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"><option value="">Tous · {label}</option>{options.map(([optionValue, config]) => <option key={optionValue} value={optionValue}>{typeof config === "string" ? config : config.label}</option>)}</select>; }
function Pagination({ meta, page, onPage }) { const last = Math.max(Number(meta.last_page || 1), 1); return <nav aria-label="Pagination du support" className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-3"><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Page précédente" className="grid h-10 w-10 place-items-center rounded-xl border bg-white disabled:opacity-30"><ChevronLeft size={18} /></button><span className="text-xs font-black text-gray-500">Page {page} / {last}</span><button type="button" disabled={page >= last} onClick={() => onPage(page + 1)} aria-label="Page suivante" className="grid h-10 w-10 place-items-center rounded-xl border bg-white disabled:opacity-30"><ChevronRight size={18} /></button></nav>; }
