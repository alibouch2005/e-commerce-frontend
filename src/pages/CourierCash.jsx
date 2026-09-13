import { Link } from "react-router-dom";
import { ArrowLeft, Banknote, ShieldCheck } from "lucide-react";
import CashLedger from "../components/delivery/CashLedger";

export default function CourierCash() {
  return <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(16,185,129,.12),transparent_28rem),#f7f8fc] px-3 py-5 sm:px-6 sm:py-9"><div className="mx-auto max-w-5xl space-y-5"><header className="relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br from-slate-950 via-emerald-950 to-teal-900 p-5 text-white shadow-[0_28px_75px_-32px_rgba(5,150,105,.75)] sm:p-7"><Link to="/deliveries" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black hover:bg-white/20"><ArrowLeft size={16} /> Mes livraisons</Link><div className="mt-5 flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400 text-emerald-950"><Banknote size={23} /></span><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-emerald-200">Suivi financier</p><h1 className="text-3xl font-black">Ma caisse</h1></div></div><p className="mt-3 flex items-center gap-2 text-sm text-emerald-100"><ShieldCheck size={16} /> Vérifiez les espèces encaissées et les remises déjà validées.</p></header><CashLedger /></div></div>;
}
