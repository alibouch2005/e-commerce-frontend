import { useEffect, useState } from 'react';
import { Banknote, CheckCircle2, RefreshCw, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../Api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { showApiError } from '../../utils/showApiError';
import { formatMoney } from '../../utils/money';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Casablanca', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const inputStyle = 'mt-1 w-full min-w-0 rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 focus:outline-indigo-500';
const buttonStyle = 'rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-indigo-700 disabled:opacity-40';

export default function CashLedger({ courierId, revision = 0, onSettled }) {
  const admin = Boolean(courierId);
  const { t, locale } = useLanguage();
  const [date, setDate] = useState(today);
  const [scope, setScope] = useState('pending');
  const [page, setPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [legacySelected, setLegacySelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const money = (cents) => formatMoney(Number(cents || 0) / 100, locale);
  const timestamp = (value) => new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: 'Africa/Casablanca' }).format(new Date(value));

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(false);
      setSelected([]);
      try {
        const res = await api.get(admin ? `/api/admin/courier-cash/${courierId}` : '/api/livreur/cash', {
          params: { date, scope, page, history_page: historyPage }, signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setData(res.data);
          setLegacySelected((res.data.untracked_orders || []).map((order) => order.id));
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [admin, courierId, date, scope, page, historyPage, reload, revision]);

  const entries = data?.entries?.data || [];
  const eligible = entries.filter((row) => row.payment_method === 'cash_on_delivery' && !row.settlement_id && row.amount_cents > 0);
  const selectedTotal = entries.filter((row) => selected.includes(row.id)).reduce((sum, row) => sum + row.amount_cents, 0);
  const selectedDelivery = entries.filter((row) => selected.includes(row.id)).reduce((sum, row) => sum + row.delivery_fee_cents, 0);
  const selectedProducts = selectedTotal - selectedDelivery;
  const initializeLegacy = async (state) => {
    if (!admin || initializing || !legacySelected.length) return;
    const confirmation = state === 'already_settled' ? t('cashLegacySettledConfirm') : t('cashLegacyOutstandingConfirm');
    if (!window.confirm(confirmation)) return;
    setInitializing(true);
    try {
      await api.post(`/api/admin/courier-cash/${courierId}/initialize`, {
        order_ids: legacySelected, state, confirmed: true,
      });
      toast.success(t('cashLegacySuccess'));
      setReload((value) => value + 1);
      onSettled?.();
    } catch (err) {
      showApiError(err, t('cashLoadError'));
      setReload((value) => value + 1);
    } finally {
      setInitializing(false);
    }
  };
  const settle = async (event) => {
    event.preventDefault();
    if (saving || loading || !selected.length) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      await api.post(`/api/admin/courier-cash/${courierId}/settlements`, {
        collection_ids: selected, received_amount: String(form.get('amount')).replace(',', '.'),
        confirmed: form.get('confirmed') === 'on', reference: form.get('reference'), note: form.get('note'),
      });
      toast.success(t('cashSuccess'));
      setSelected([]);
      setReload((value) => value + 1);
      onSettled?.();
    } catch (err) {
      showApiError(err, t('cashLoadError'));
      if (err.response?.status === 409) setReload((value) => value + 1);
    } finally {
      setSaving(false);
    }
  };

  const pager = (pagination, changePage) => pagination?.last_page > 1 && (
    <nav aria-label={t('cashPage', { page: pagination.current_page, total: pagination.last_page })} className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <button type="button" className={buttonStyle} disabled={loading || saving || pagination.current_page <= 1} onClick={() => changePage(pagination.current_page - 1)}>{t('cashPrevious')}</button>
      <span className="text-sm text-gray-500">{t('cashPage', { page: pagination.current_page, total: pagination.last_page })}</span>
      <button type="button" className={buttonStyle} disabled={loading || saving || pagination.current_page >= pagination.last_page} onClick={() => changePage(pagination.current_page + 1)}>{t('cashNext')}</button>
    </nav>
  );

  return (
    <section aria-busy={loading} className="mb-6 min-w-0 space-y-5 rounded-3xl border border-indigo-100 bg-white p-4 text-gray-900 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex min-w-0 items-center gap-2 text-xl font-black"><Wallet className="shrink-0 text-indigo-600" /> {admin ? data?.courier?.name || t('cashTitle') : t('cashMine')}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-bold text-gray-500">{t('cashDay')}<input aria-label={t('cashDay')} type="date" value={date} disabled={saving} onChange={(event) => { if (event.target.value) { setDate(event.target.value); setPage(1); } }} className={inputStyle} /></label>
          <button type="button" aria-label={t('refresh')} disabled={loading || saving} className={`${buttonStyle} p-3`} onClick={() => setReload((value) => value + 1)}><RefreshCw size={18} /></button>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-gray-500">{t('cashExplanation')}</p>
      {loading ? <p role="status">{t('loading')}</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">{t('cashLoadError')}</p> : data && <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[
            ['cashOutstanding', money(data.summary.outstanding_cents)],
            ['cashProducts', money(data.summary.outstanding_products_cents)],
            ['cashDeliveryPrice', money(data.summary.outstanding_delivery_cents)],
            ['cashCollected', money(data.summary.day_cash_cents)],
            ['cashCard', money(data.summary.day_card_cents)],
            ['cashDelivered', data.summary.delivered_count],
          ].map(([label, value], index) => <div key={label} className={`min-w-0 rounded-2xl p-4 ${index === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-50'}`}><p className="text-xs font-bold">{t(label)}</p><p className="mt-2 break-words text-2xl font-black tabular-nums">{value}</p></div>)}
        </div>
        <p className="text-sm text-gray-500">{t('cashCollected')} — {t('cashProducts')}: {money(data.summary.day_cash_products_cents)} · {t('cashDeliveryPrice')}: {money(data.summary.day_cash_delivery_cents)}</p>
        {admin && data.untracked_deliveries > 0 && <section className="space-y-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
          <div><h3 className="font-black">{t('cashLegacyTitle')} ({data.untracked_deliveries})</h3><p className="mt-1 text-sm leading-relaxed">{t('cashLegacyHelp')}</p></div>
          {data.untracked_deliveries > 200 && <p className="text-xs font-bold">{t('cashLegacyLimit')}</p>}
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {(data.untracked_orders || []).map((order) => <label key={order.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-200 bg-white p-3 text-sm">
              <input type="checkbox" aria-label={t('cashLegacySelect', { id: order.id })} checked={legacySelected.includes(order.id)} disabled={initializing} onChange={(event) => setLegacySelected((current) => event.target.checked ? [...current, order.id] : current.filter((id) => id !== order.id))} className="mt-1 h-5 w-5 shrink-0 accent-indigo-600" />
              <span className="min-w-0 flex-1"><strong>{t('cashOrder', { id: order.id })}</strong><span className="mt-1 block break-words text-xs text-gray-600">{order.client_name}{order.phone ? ` · ${order.phone}` : ''}</span></span>
              <span className="shrink-0 text-end font-black">{money(order.amount_cents)}<small className="mt-1 block font-normal text-gray-500">{money(order.product_amount_cents)} + {money(order.delivery_fee_cents)}</small></span>
            </label>)}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={initializing || !legacySelected.length} onClick={() => initializeLegacy('outstanding')} className="rounded-xl bg-amber-500 px-4 py-3 font-bold text-white disabled:opacity-40">{t('cashLegacyOutstanding')}</button>
            <button type="button" disabled={initializing || !legacySelected.length} onClick={() => initializeLegacy('already_settled')} className="rounded-xl border border-emerald-300 bg-white px-4 py-3 font-bold text-emerald-700 disabled:opacity-40">{t('cashLegacySettled')}</button>
          </div>
        </section>}
        {!admin && data.untracked_deliveries > 0 && <p role="note" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{t('cashLegacy', { count: data.untracked_deliveries })}</p>}
        <div className="flex flex-wrap gap-2" role="group" aria-label={t('cashMine')}>
          {['pending', 'day'].map((value) => <button type="button" key={value} aria-pressed={scope === value} disabled={saving} onClick={() => { setScope(value); setPage(1); }} className={`${buttonStyle} ${scope === value ? 'ring-2 ring-indigo-500' : ''}`}>{t(value === 'pending' ? 'cashPendingTab' : 'cashDayTab')}</button>)}
        </div>
        {admin && eligible.length > 0 && <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" disabled={saving} checked={eligible.every((row) => selected.includes(row.id))} onChange={(event) => setSelected(event.target.checked ? eligible.map((row) => row.id) : [])} className="h-5 w-5 accent-indigo-600" />{t('cashSelectPage')}</label>}
        <div className="max-h-[32rem] space-y-2 overflow-y-auto">
          {entries.length === 0 && <p className="py-6 text-center text-gray-500">{t('cashEmpty')}</p>}
          {entries.map((row) => <article key={row.id} className="flex items-start gap-3 rounded-2xl border border-gray-100 p-4">
            {admin && eligible.some((item) => item.id === row.id) && <input type="checkbox" aria-label={t('cashSelect', { id: row.order_id })} disabled={saving} checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} className="mt-1 h-5 w-5 shrink-0 accent-indigo-600" />}
            <div className="flex min-w-0 flex-1 flex-wrap justify-between gap-2">
              <div className="min-w-0"><p className="font-bold">{t('cashOrder', { id: row.order_id })}</p><p className="mt-1 text-xs text-gray-500">{t('cashWhen')} {timestamp(row.collected_at)}</p>{row.order?.user?.name && <p className="mt-2 break-words text-sm"><strong>{t('cashCustomer')} :</strong> {row.order.user.name}{row.order.phone ? ` · ${row.order.phone}` : ''}</p>}{row.order?.adresse_livraison && <p className="mt-1 break-words text-xs text-gray-500"><strong>{t('cashAddress')} :</strong> {row.order.adresse_livraison}</p>}</div>
              <div className="text-end"><p className="font-black tabular-nums">{money(row.amount_cents)}</p><p className="mt-1 text-xs text-gray-500">{t('cashFees')} : {money(row.delivery_fee_cents)}</p><span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-semibold ${row.settlement_id || row.payment_method === 'card' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>{t(row.payment_method === 'card' ? 'cashOnline' : row.settlement_id ? 'cashSettled' : 'cashPending')}</span></div>
            </div>
          </article>)}
        </div>
        {pager(data.entries, setPage)}
        {admin && selected.length > 0 && <form key={selected.join(',')} onSubmit={settle} className="space-y-4 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4">
          <h3 className="font-black">{t('cashSelected')}</h3>
          <dl className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3"><dt className="text-xs text-gray-500">{t('cashProducts')}</dt><dd className="mt-1 font-black tabular-nums">{money(selectedProducts)}</dd></div>
            <div className="rounded-xl bg-white p-3"><dt className="text-xs text-gray-500">{t('cashDeliveryPrice')}</dt><dd className="mt-1 font-black tabular-nums">{money(selectedDelivery)}</dd></div>
            <div className="rounded-xl bg-indigo-600 p-3 text-white"><dt className="text-xs">{t('cashGrandTotal')}</dt><dd className="mt-1 font-black tabular-nums">{money(selectedTotal)}</dd></div>
          </dl>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold">{t('cashReceived')}<input name="amount" inputMode="decimal" type="number" step="0.01" min="0.01" value={(selectedTotal / 100).toFixed(2).replace(/\.?0+$/, '')} readOnly className={`${inputStyle} bg-gray-100`} /></label>
            <label className="text-sm font-semibold">{t('cashReference')}<input name="reference" maxLength={100} disabled={saving} className={inputStyle} /></label>
          </div>
          <label className="block text-sm font-semibold">{t('cashNote')}<textarea name="note" maxLength={1000} rows={2} disabled={saving} className={inputStyle} /></label>
          <label className="flex items-start gap-3 text-sm"><input name="confirmed" type="checkbox" required disabled={saving} className="mt-1 h-5 w-5 shrink-0 accent-indigo-600" />{t('cashConfirm')}</label>
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 p-3 font-bold text-white disabled:opacity-50"><Banknote size={18} />{t(saving ? 'processing' : 'cashValidate')}</button>
        </form>}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="mb-3 flex items-center gap-2 font-black"><CheckCircle2 size={18} className="text-emerald-600" />{t('cashHistory')}</h3>
          {data.history.data.length === 0 && <p className="text-sm text-gray-500">{t('cashHistoryEmpty')}</p>}
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {data.history.data.map((receipt) => <details key={receipt.id} className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
              <summary className="cursor-pointer text-sm font-bold">{t('cashReceipt', { id: receipt.id })} · {money(receipt.amount_cents)}<span className="mt-1 block text-xs font-normal text-gray-500">{timestamp(receipt.created_at)} · {t('cashValidatedBy')} {receipt.admin?.name}</span></summary>
              <ul className="mt-3 space-y-1 text-sm">{receipt.collections.map((row) => <li key={row.id}>{t('cashOrder', { id: row.order_id })} — {t('cashProducts')}: {money(row.product_amount_cents)} · {t('cashDeliveryPrice')}: {money(row.delivery_fee_cents)} · <strong>{money(row.amount_cents)}</strong></li>)}</ul>
              {receipt.reference && <p className="mt-2 break-words text-sm">{receipt.reference}</p>}
              {receipt.note && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-600">{receipt.note}</p>}
            </details>)}
          </div>
          {pager(data.history, setHistoryPage)}
        </div>
      </>}
      <p className="text-xs leading-relaxed text-gray-500">{t('cashStart')}</p>
    </section>
  );
}
