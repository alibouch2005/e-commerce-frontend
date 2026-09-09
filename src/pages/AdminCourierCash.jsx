import { useEffect, useRef, useState } from 'react';
import { Banknote, ChevronLeft, ChevronRight, Phone, Truck, Wallet } from 'lucide-react';
import api from '../Api/axios';
import CashLedger from '../components/delivery/CashLedger';
import { useLanguage } from '../context/LanguageContext';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export default function AdminCourierCash() {
  const { t, locale } = useLanguage();
  const [date, setDate] = useState(today);
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const ledgerRef = useRef(null);
  const money = (cents) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'MAD' }).format(Number(cents || 0) / 100);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const result = await api.get('/api/admin/courier-cash', { params: { date, page }, signal: controller.signal });
        if (!controller.signal.aborted) setResponse(result.data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [date, page, revision]);

  const pagination = response?.couriers;
  const openCashDesk = (courierId) => {
    setSelected(courierId);
    window.setTimeout(() => ledgerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
        <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-indigo-200"><Banknote size={16} /> AliShop Finance</p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">{t('cashTitle')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100">{t('cashIntro')}</p>
      </header>

      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><h2 className="text-xl font-black text-gray-950">{t('deliveries')}</h2><p className="mt-1 text-sm text-gray-500">{t('cashChoose')}</p></div>
          <label className="text-xs font-bold text-gray-500">{t('cashDay')}<input aria-label={t('cashDay')} type="date" value={date} onChange={(event) => { if (event.target.value) { setDate(event.target.value); setPage(1); } }} className="mt-1 block rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900" /></label>
        </div>
        {loading ? <p role="status" className="py-8 text-gray-500">{t('loading')}</p> : error ? <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{t('cashLoadError')}</p> : <>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(pagination?.data || []).map((courier) => <article key={courier.id} className={`min-w-0 rounded-2xl border p-4 transition ${selected === courier.id ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-100 hover:border-indigo-200'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><h3 className="truncate font-black text-gray-950">{courier.name}</h3>{courier.phone && <a className="mt-1 flex items-center gap-1 text-xs text-gray-500" href={`tel:${courier.phone}`}><Phone size={13} />{courier.phone}</a>}</div>
                <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><Truck size={19} /></span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-gray-500">{t('cashDelivered')}</dt><dd className="mt-1 font-black">{courier.delivered_count}</dd></div>
                <div className="rounded-xl bg-amber-50 p-3"><dt className="text-xs text-amber-800">{t('cashOutstanding')}</dt><dd className="mt-1 break-words font-black text-amber-950">{money(courier.outstanding_cents)}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-gray-500">{t('cashProducts')}</dt><dd className="mt-1 break-words font-black">{money(courier.outstanding_products_cents)}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-gray-500">{t('cashDeliveryPrice')}</dt><dd className="mt-1 break-words font-black">{money(courier.outstanding_delivery_cents)}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-gray-500">{t('cashCollected')}</dt><dd className="mt-1 break-words font-black">{money(courier.day_cash_cents)}</dd></div>
                <div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs text-gray-500">{t('cashCard')}</dt><dd className="mt-1 break-words font-black">{money(courier.day_card_cents)}</dd></div>
              </dl>
              <button type="button" onClick={() => openCashDesk(courier.id)} aria-expanded={selected === courier.id} aria-controls="courier-cash-detail" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"><Wallet size={17} />{t(selected === courier.id ? 'cashOpened' : 'cashOpen')}</button>
            </article>)}
          </div>
          {pagination?.data?.length === 0 && <p className="py-8 text-center text-gray-500">{t('cashEmpty')}</p>}
          {pagination?.last_page > 1 && <nav className="mt-5 flex items-center justify-center gap-3">
            <button aria-label={t('cashPrevious')} disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-xl border border-gray-200 p-3 disabled:opacity-30"><ChevronLeft size={18} /></button>
            <span className="text-sm font-bold text-gray-600">{t('cashPage', { page: pagination.current_page, total: pagination.last_page })}</span>
            <button aria-label={t('cashNext')} disabled={page >= pagination.last_page} onClick={() => setPage((value) => value + 1)} className="rounded-xl border border-gray-200 p-3 disabled:opacity-30"><ChevronRight size={18} /></button>
          </nav>}
        </>}
      </section>
      {selected && <div ref={ledgerRef} id="courier-cash-detail" tabIndex={-1} className="scroll-mt-24 outline-none"><CashLedger courierId={selected} revision={revision} onSettled={() => setRevision((value) => value + 1)} /></div>}
    </div>
  );
}
