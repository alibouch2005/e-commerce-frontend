import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, LockKeyhole, RefreshCw, ShoppingBag, XCircle } from 'lucide-react';
import api from '../Api/axios';
import { useLanguage } from '../context/LanguageContext';
import { showApiError } from '../utils/showApiError';
import submitGatewayForm from '../utils/submitGatewayForm';
import { formatMoney } from '../utils/money';

export default function PaymentResult() {
  const { t, locale } = useLanguage();
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [result, setResult] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const validOrderId = /^\d+$/.test(orderId || '');
  const checking = validOrderId && result?.id !== orderId;
  const order = result?.id === orderId ? result.order : null;
  const success = order?.payment_status === 'paid';
  const retryAllowed = order?.payment_method === 'card' && order?.status === 'pending'
    && ['pending', 'failed'].includes(order?.payment_status);
  const money = formatMoney(order?.computed_total || order?.total_price || 0, locale);

  useEffect(() => {
    const controller = new AbortController();
    if (!validOrderId) return undefined;
    api.get(`/api/orders/${orderId}`, { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => { if (!controller.signal.aborted) setResult({ id: orderId, order: data.data }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ id: orderId, order: null }); });
    return () => controller.abort();
  }, [orderId, validOrderId]);

  const retryPayment = async () => {
    try {
      setRetrying(true);
      const { data } = await api.post(`/api/orders/${orderId}/payment/retry`);
      submitGatewayForm(data.payment);
    } catch (error) {
      showApiError(error, t('paymentRetryError'));
      setRetrying(false);
    }
  };

  if (checking) return <div role="status" className="grid min-h-[70vh] place-items-center"><div className="flex items-center gap-3 font-bold text-indigo-700"><LoaderCircle className="animate-spin" />{t('paymentVerification')}</div></div>;

  return (
    <main className="relative isolate grid min-h-[calc(100dvh-4.5rem)] place-items-center overflow-hidden px-4 py-10 sm:px-6">
      <div className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b ${success ? 'from-emerald-100/80' : 'from-rose-100/80'} to-transparent dark:opacity-20`} />
      <section className="premium-surface w-full max-w-2xl overflow-hidden rounded-[2rem] text-center sm:rounded-[2.5rem]">
        <div className={`px-6 py-9 text-white sm:px-10 ${success ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950'}`}>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-[1.5rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur">{success ? <CheckCircle2 size={42} /> : <XCircle size={42} />}</span>
          <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-white/70">{t('secureCheckout')}</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{success ? t('paymentConfirmed') : t('paymentNotConfirmed')}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/80">{success ? t('paymentSuccessMessage', { order: orderId ? t('forOrder', { id: orderId }) : '' }) : t('paymentFailureMessage')}</p>
        </div>
        <div className="p-5 sm:p-8">
          {order && <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-left dark:bg-white/5 rtl:text-right"><div><p className="text-xs text-slate-500">{t('order')}</p><p className="font-black">{order.id}</p></div><div className="text-right rtl:text-left"><p className="text-xs text-slate-500">{t('total')}</p><p className="font-black text-indigo-600">{money}</p></div></div>}
          {!success && <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">{t('paymentFailureCashOption')}</p>}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {retryAllowed && <button type="button" onClick={retryPayment} disabled={retrying} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-black text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:opacity-60 dark:shadow-none">{retrying ? <LoaderCircle className="animate-spin" size={18} /> : <RefreshCw size={18} />}{retrying ? t('paymentRedirecting') : t('retryCardPayment')}</button>}
            <Link to="/orders" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 font-black text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-white/5"><ShoppingBag size={18} />{t('viewOrders')}</Link>
          </div>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"><LockKeyhole size={15} />{t('cardNeverStored')}</p>
        </div>
      </section>
    </main>
  );
}
