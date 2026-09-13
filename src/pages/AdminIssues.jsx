import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertOctagon, AlertTriangle, Banknote, CheckCircle2, CreditCard, Headphones, Loader2, PackageX, RefreshCw, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../Api/axios";
import { showApiError } from "../utils/showApiError";
import { formatMoney } from "../utils/money";

const severityConfig = {
  critical: { label: "Critique", className: "border-red-200 bg-red-50/70 text-red-700", dot: "bg-red-500" },
  high: { label: "Haute", className: "border-orange-200 bg-orange-50/70 text-orange-700", dot: "bg-orange-500" },
  medium: { label: "À surveiller", className: "border-amber-200 bg-amber-50/70 text-amber-700", dot: "bg-amber-500" },
};

export default function AdminIssues() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/stats");
      setStats(data);
    } catch (error) {
      showApiError(error, "Impossible d’analyser les risques de la boutique");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const attention = stats?.admin_attention || {};
  const risks = useMemo(() => [
    { id: "unassigned", title: "Livraisons parties sans livreur", count: attention.unassigned_shipping, severity: "critical", icon: Truck, to: "/admin/orders", action: "Assigner immédiatement", detail: "Une commande marquée en livraison sans livreur ne peut pas être suivie correctement." },
    { id: "failed-payment", title: "Paiements carte échoués", count: attention.failed_card_payments, severity: "critical", icon: CreditCard, to: "/admin/orders", action: "Contrôler les paiements", detail: "Le client doit pouvoir réessayer le paiement sécurisé ou choisir la livraison si son montant l’autorise." },
    { id: "overdue", title: "Commandes en attente depuis plus de 2 h", count: attention.overdue_pending_orders, severity: "high", icon: ShoppingBag, to: "/admin/orders", action: "Traiter les commandes", detail: "Ces commandes dépassent le délai normal de prise en charge et risquent une annulation client." },
    { id: "delivery-offer", title: "Commandes sans livreur depuis 30 min", count: attention.stale_delivery_offers, severity: "high", icon: Truck, to: "/admin/orders", action: "Relancer les livreurs", detail: "Aucun livreur n’a encore accepté ces commandes à domicile." },
    { id: "stale-card", title: "Paiements carte bloqués depuis 30 min", count: attention.stale_card_payments, severity: "high", icon: CreditCard, to: "/admin/orders", action: "Vérifier avec CMI", detail: "Le paiement est toujours en attente et nécessite une vérification avant toute préparation." },
    { id: "urgent-support", title: "Tickets support urgents", count: attention.urgent_support, severity: "high", icon: Headphones, to: "/admin/support", action: "Répondre maintenant", detail: "Les demandes urgentes ouvertes doivent être prioritaires pour protéger la satisfaction client." },
    { id: "out-stock", title: "Produits en rupture", count: attention.out_of_stock, severity: "high", icon: PackageX, to: "/admin/products", action: "Réapprovisionner", detail: "Ces produits sont indisponibles et bloquent directement des ventes potentielles." },
    { id: "low-stock", title: "Produits sous le seuil de 10", count: attention.low_stock, severity: "medium", icon: AlertTriangle, to: "/admin/products", action: "Préparer le stock", detail: "Anticipez la rupture avant que les prochaines commandes ne consomment le stock restant." },
    { id: "support", title: "Tickets support actifs", count: attention.open_support, severity: "medium", icon: Headphones, to: "/admin/support", action: "Ouvrir le support", detail: "Demandes ouvertes ou en traitement qui attendent encore une résolution définitive." },
    { id: "requests", title: "Demandes de produits ouvertes", count: attention.open_product_requests, severity: "medium", icon: PackageX, to: "/admin/support", action: "Étudier les demandes", detail: "Ces demandes indiquent des opportunités de catalogue exprimées directement par les clients." },
    { id: "cash", title: "Remises de caisse non validées", count: attention.pending_cash_collections, severity: "high", icon: Banknote, to: "/admin/courier-cash", action: "Rapprocher la caisse", detail: `${formatMoney((attention.pending_cash_amount_cents || 0) / 100)} restent à remettre et valider par l’admin.` },
    { id: "refunds", title: "Commandes remboursées", count: attention.refunds, severity: "medium", icon: RefreshCw, to: "/admin/orders", action: "Analyser les motifs", detail: "Analysez les causes récurrentes pour réduire les retours, pertes et insatisfactions." },
    { id: "at-risk-clients", title: "Clients à surveiller après 2 incidents", count: attention.at_risk_customers, severity: "high", icon: AlertTriangle, to: "/admin/users", action: "Vérifier les comptes", detail: "Deux livraisons consécutives ont été refusées ou non récupérées. Un troisième incident signalera automatiquement le compte." },
    { id: "flagged-clients", title: "Comptes clients signalés", count: attention.flagged_customers, severity: "critical", icon: AlertOctagon, to: "/admin/users", action: "Décider d’une action", detail: "Ces clients ont atteint trois incidents consécutifs ou ont été signalés manuellement. Vérifiez l’historique avant réactivation ou suppression." },
  ], [attention.at_risk_customers, attention.failed_card_payments, attention.flagged_customers, attention.low_stock, attention.open_product_requests, attention.open_support, attention.out_of_stock, attention.overdue_pending_orders, attention.pending_cash_amount_cents, attention.pending_cash_collections, attention.refunds, attention.stale_card_payments, attention.stale_delivery_offers, attention.unassigned_shipping, attention.urgent_support]);

  const visibleRisks = showResolved ? risks : risks.filter((risk) => Number(risk.count || 0) > 0);
  const critical = risks.filter((risk) => risk.severity === "critical" && Number(risk.count || 0) > 0).length;
  const active = risks.filter((risk) => Number(risk.count || 0) > 0).length;
  const health = Math.max(0, 100 - risks.reduce((score, risk) => score + Math.min(Number(risk.count || 0), 10) * ({ critical: 6, high: 3, medium: 1 }[risk.severity]), 0));

  if (loading && !stats) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="animate-spin text-indigo-600" size={36} /></div>;

  return <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
    <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-slate-950 via-red-950 to-indigo-950 p-6 text-white shadow-xl sm:p-8"><div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-red-400/20 blur-3xl" /><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-200">Supervision opérationnelle</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black sm:text-4xl"><ShieldCheck /> Centre des problèmes</h1><p className="mt-2 max-w-3xl text-sm text-slate-200">Tous les blocages mesurables de la boutique, classés par gravité avec l’action recommandée.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 font-black text-slate-900 shadow-lg disabled:opacity-60"><RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Actualiser l’analyse</button></div>
      <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric label="Santé opérationnelle" value={`${health}%`} tone={health < 70 ? "red" : health < 90 ? "amber" : "green"} /><Metric label="Types de risques actifs" value={active} tone={active ? "amber" : "green"} /><Metric label="Risques critiques" value={critical} tone={critical ? "red" : "green"} /><Metric label="Commandes en attente" value={attention.pending_orders || 0} tone="neutral" /></div>
    </header>

    <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black text-gray-950">Registre des risques</h2><p className="text-sm text-gray-500">Les éléments à zéro sont masqués pour concentrer l’équipe sur les vrais problèmes.</p></div><label className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700"><input type="checkbox" checked={showResolved} onChange={(event) => setShowResolved(event.target.checked)} className="h-5 w-5 accent-indigo-600" /> Afficher aussi les contrôles sans problème</label></section>

    {visibleRisks.length ? <div className="grid gap-4 lg:grid-cols-2">{visibleRisks.map((risk) => <RiskCard key={risk.id} risk={risk} />)}</div> : <section className="rounded-3xl border border-emerald-100 bg-emerald-50 p-10 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={48} /><h2 className="mt-4 text-2xl font-black text-emerald-950">Aucun blocage actif détecté</h2><p className="mt-2 text-sm text-emerald-700">Les indicateurs opérationnels contrôlés sont actuellement au vert.</p></section>}

    <section className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-6"><h2 className="font-black text-gray-950">Contrôles permanents déjà protégés</h2><p className="mt-1 text-sm text-gray-500">Ces règles réduisent les risques même lorsqu’aucune alerte n’est active.</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{["Total recalculé depuis les articles, remises et livraison", "Paiement CMI signé sans stockage de carte ou CVV", "Stock verrouillé pendant le checkout", "Livraison limitée à Casablanca et caisse livreur auditée"].map((text) => <div key={text} className="flex gap-3 rounded-2xl bg-indigo-50/60 p-4 text-sm font-bold text-indigo-950"><CheckCircle2 className="shrink-0 text-emerald-600" size={19} />{text}</div>)}</div></section>
  </div>;
}

function RiskCard({ risk }) { const severity = severityConfig[risk.severity]; const Icon = risk.icon; const active = Number(risk.count || 0) > 0; return <article className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${active ? severity.className : "border-emerald-100 bg-emerald-50/50 text-emerald-700"}`}><div className="flex items-start justify-between gap-4"><span className="rounded-2xl bg-white p-3 shadow-sm"><Icon size={23} /></span><div className="text-right"><span className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase`}><span className={`h-2 w-2 rounded-full ${active ? severity.dot : "bg-emerald-500"}`} />{active ? severity.label : "Contrôlé"}</span><p className="mt-2 text-3xl font-black text-gray-950">{risk.count || 0}</p></div></div><h3 className="mt-4 text-lg font-black text-gray-950">{risk.title}</h3><p className="mt-2 min-h-10 text-sm leading-6 text-gray-600">{risk.detail}</p><Link to={risk.to} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-black text-indigo-700 shadow-sm transition hover:bg-indigo-600 hover:text-white">{risk.action}</Link></article>; }
function Metric({ label, value, tone }) { const tones = { red: "border-red-300/30 bg-red-400/20", amber: "border-amber-300/30 bg-amber-400/15", green: "border-emerald-300/30 bg-emerald-400/15", neutral: "border-white/15 bg-white/10" }; return <div className={`rounded-2xl border p-4 backdrop-blur ${tones[tone]}`}><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-slate-200">{label}</p></div>; }
