import { useCallback, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Camera, CheckCircle2, Clock3, Handshake, MapPin, Navigation, PackageCheck, Phone, ReceiptText, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import api from "../Api/axios";
import DeliveryMap from "../components/delivery/DeliveryMap";
import { formatAmount } from "../utils/money";
import { showApiError } from "../utils/showApiError";

const slotLabel = (slot) => ({ "08_12": "08:00 – 12:00", "12_18": "12:00 – 18:00", "18_21": "18:00 – 21:00" }[slot] || "Créneau non précisé");
const lineTotal = (item) => Number(item.total_price || (Number(item.price || item.product?.current_price || 0) * Number(item.quantity || 1)));

export default function DeliveryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [proof, setProof] = useState({ recipient_name: "", delivery_note: "", proof_image: null, preview: "" });

  const fetchOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/livreur/orders/${id}`);
      const nextOrder = data.data || data;
      setOrder(nextOrder);
      setProof((current) => current.recipient_name ? current : { ...current, recipient_name: nextOrder.user?.name || "" });
    }
    catch (error) { showApiError(error, "Cette livraison n’est plus disponible"); navigate("/deliveries", { replace: true }); }
    finally { setLoading(false); }
  }, [id, navigate]);
  useEffect(() => { void fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    if (!order?.delivery_latitude || !order?.delivery_longitude) return;
    let active = true;
    const resolveAddress = async () => {
      try {
        setAddressLoading(true);
        const { data } = await api.get("/api/delivery/address", {
          params: { latitude: order.delivery_latitude, longitude: order.delivery_longitude },
        });
        if (active && data.address) setResolvedAddress(data.address);
      } catch {
        // L'adresse saisie lors de la commande reste disponible comme solution de secours.
      } finally {
        if (active) setAddressLoading(false);
      }
    };
    void resolveAddress();
    return () => { active = false; };
  }, [order?.delivery_latitude, order?.delivery_longitude]);

  const accept = async () => {
    try { setUpdating(true); await api.post(`/api/livreur/orders/${id}/accept`); toast.success("Livraison ajoutée à vos missions."); await fetchOrder(); }
    catch (error) { showApiError(error, "Cette livraison vient d’être acceptée par un autre livreur"); await fetchOrder(); }
    finally { setUpdating(false); }
  };
  const confirmDelivery = async () => {
    if (!proof.recipient_name || !proof.proof_image) return toast.error("Le nom du destinataire et la photo sont obligatoires.");
    if (order.payment_method === "cash_on_delivery" && !window.confirm(`Confirmer l’encaissement de ${formatAmount(order.computed_total ?? order.total_price)} DH ?`)) return;
    const payload = new FormData(); payload.append("status", "delivered"); payload.append("recipient_name", proof.recipient_name); payload.append("proof_image", proof.proof_image); if (proof.delivery_note) payload.append("delivery_note", proof.delivery_note);
    try { setUpdating(true); await api.post(`/api/livreur/orders/${id}/status?_method=PUT`, payload); toast.success("Livraison confirmée."); await fetchOrder(); }
    catch (error) { showApiError(error, "Impossible de confirmer la livraison"); }
    finally { setUpdating(false); }
  };
  const reportFailure = async () => {
    const failureType = window.confirm("Le client a-t-il refusé la commande ?\nOK = refus · Annuler = absent") ? "client_refused" : "client_absent";
    const note = window.prompt("Précisez l’appel effectué, l’heure et la réponse du client :", "") ?? "";
    if (!window.confirm("Confirmer cet incident de livraison ?")) return;
    try { setUpdating(true); await api.put(`/api/livreur/orders/${id}/status`, { status: "delivery_failed", failure_type: failureType, delivery_note: note }); toast.success("Incident transmis à l’administration."); navigate("/deliveries"); }
    catch (error) { showApiError(error, "Impossible d’enregistrer l’incident"); }
    finally { setUpdating(false); }
  };

  if (loading || !order) return <div role="status" className="grid min-h-[60vh] place-items-center font-bold text-gray-400">Chargement de la livraison…</div>;
  const available = !order.livreur_id;
  const displayAddress = resolvedAddress || order.adresse_livraison || "Adresse non renseignée";
  const mapsUrl = order.delivery_latitude && order.delivery_longitude ? `https://www.google.com/maps?q=${order.delivery_latitude},${order.delivery_longitude}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.adresse_livraison || "")}`;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(99,102,241,.13),transparent_28rem),#f7f8fc] px-3 py-5 sm:px-6 sm:py-9"><div className="mx-auto max-w-5xl space-y-4">
    <div className="flex items-center justify-between gap-3"><Link to="/deliveries" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 text-sm font-black text-gray-700 shadow-sm"><ArrowLeft size={17} /> Retour</Link><Link to="/deliveries/cash" className="rounded-xl bg-emerald-50 px-4 py-3 text-xs font-black text-emerald-700">Ma caisse</Link></div>
    <header className="overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 p-5 text-white shadow-xl sm:p-7"><p className="text-[10px] font-black uppercase tracking-[.2em] text-indigo-200">Mission de livraison</p><div className="mt-2 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-3xl font-black">Commande {order.id}</h1><p className="mt-1 text-sm text-indigo-100">{order.user?.name || "Client"}</p></div><b className="text-2xl text-emerald-300">{formatAmount(order.computed_total ?? order.total_price)} DH</b></div></header>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-black text-gray-950"><MapPin size={18} className="text-indigo-600" /> Adresse détaillée</h2>{addressLoading && <span className="text-[10px] font-black uppercase tracking-wide text-indigo-500">Localisation…</span>}</div><p className="mt-3 rounded-2xl bg-indigo-50 p-4 text-sm font-bold leading-6 text-indigo-950">{displayAddress}</p>{order.delivery_latitude && order.delivery_longitude && <p className="mt-2 text-[10px] font-semibold text-gray-400">Position GPS vérifiée : {Number(order.delivery_latitude).toFixed(5)}, {Number(order.delivery_longitude).toFixed(5)}</p>}<div className="mt-3 grid gap-2 sm:grid-cols-2"><a href={order.phone ? `tel:${order.phone}` : undefined} className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-bold text-gray-700"><Phone size={16} /> {order.phone || "Téléphone indisponible"}</a><div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-bold text-gray-700"><Clock3 size={16} /> {slotLabel(order.delivery_time_slot)}</div></div></section>
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-4 shadow-sm sm:p-5"><h2 className="flex items-center gap-2 font-black"><ReceiptText size={18} className="text-indigo-600" /> Contenu de la commande</h2><div className="mt-3 divide-y divide-gray-100">{order.items?.map((item) => <div key={item.id} className="flex justify-between gap-3 py-3 text-sm"><span className="min-w-0"><b className="block truncate">{item.product?.name}</b><span className="text-xs text-gray-400">Quantité : {item.quantity}</span></span><b>{formatAmount(lineTotal(item))} DH</b></div>)}</div><div className="mt-3 flex justify-between rounded-xl bg-gray-950 p-4 text-white"><span className="text-sm">{order.payment_method === "cash_on_delivery" ? "À encaisser en espèces" : "Déjà payée en ligne"}</span><b>{formatAmount(order.computed_total ?? order.total_price)} DH</b></div></section>
      </div>
      <div className="space-y-4"><section className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm"><DeliveryMap latitude={order.delivery_latitude} longitude={order.delivery_longitude} address={displayAddress} /><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 font-black text-white"><Navigation size={18} /> Ouvrir l’itinéraire</a></section>
        {available ? <section className="rounded-[1.5rem] border border-amber-100 bg-amber-50 p-4"><h2 className="font-black text-amber-950">Cette mission est disponible</h2><p className="mt-1 text-sm leading-6 text-amber-800">Vérifiez l’adresse, le montant et le créneau avant de l’accepter.</p><button type="button" disabled={updating} onClick={() => void accept()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 font-black text-white disabled:opacity-50"><Handshake size={18} /> Accepter cette livraison</button></section> : order.status === "delivered" ? <section className="flex items-center gap-3 rounded-[1.5rem] bg-emerald-50 p-5 font-black text-emerald-700"><CheckCircle2 size={21} /> Livraison terminée</section> : <section className="space-y-3 rounded-[1.5rem] border border-indigo-100 bg-white p-4 shadow-sm"><h2 className="flex items-center gap-2 font-black"><UserRound size={18} /> Preuve de remise</h2><input value={proof.recipient_name} onChange={(event) => setProof({ ...proof, recipient_name: event.target.value })} placeholder="Nom de la personne qui reçoit" className="w-full rounded-xl border border-gray-200 p-3 text-base" /><label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 p-4 text-indigo-700"><Camera size={23} /><b className="mt-2 text-sm">Photo sur place</b><input type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setProof({ ...proof, proof_image: file, preview: URL.createObjectURL(file) }); }} /></label>{proof.preview && <img src={proof.preview} alt="Aperçu de la preuve" className="h-40 w-full rounded-xl object-cover" />}<textarea value={proof.delivery_note} onChange={(event) => setProof({ ...proof, delivery_note: event.target.value })} placeholder="Note facultative" rows="2" className="w-full rounded-xl border border-gray-200 p-3 text-base" /><button type="button" disabled={updating} onClick={() => void confirmDelivery()} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-black text-white disabled:opacity-50"><PackageCheck size={18} /> Confirmer la livraison</button><button type="button" disabled={updating} onClick={() => void reportFailure()} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 font-black text-rose-700"><AlertTriangle size={17} /> Client absent ou refus</button></section>}
      </div>
    </div>
  </div></div>;
}
