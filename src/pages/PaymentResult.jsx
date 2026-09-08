import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, ShoppingBag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from 'react';
import api from '../Api/axios';

export default function PaymentResult() {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const orderId = params.get("order");
  const [result, setResult] = useState(null);
  const validOrderId = /^\d+$/.test(orderId || '');
  const checking = validOrderId && result?.id !== orderId;
  const verifiedOrder = result?.id === orderId ? result.order : null;
  useEffect(() => {
    const controller = new AbortController();
    if (!validOrderId) return;
    api.get(`/api/orders/${orderId}`, { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => { if (!controller.signal.aborted) setResult({ id: orderId, order: data.data }); })
      .catch(() => { if (!controller.signal.aborted) setResult({ id: orderId, order: null }); });
    return () => controller.abort();
  }, [orderId, validOrderId]);
  const success = verifiedOrder?.payment_status === 'paid';
  const orderText = orderId ? t("forOrder", { id: orderId }) : "";

  if (checking) return <div role="status" className="p-16 text-center">{t('loading')}</div>;

  return (
    <div className="min-h-[70vh] bg-[#f7f8fc] px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${success ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {success ? <CheckCircle2 size={34} /> : <XCircle size={34} />}
        </div>

        <h1 className="mt-6 text-3xl font-black text-gray-950">
          {success ? t("paymentConfirmed") : t("paymentNotConfirmed")}
        </h1>
        <p className="mt-3 text-gray-600">
          {success
            ? t("paymentSuccessMessage", { order: orderText })
            : t("paymentFailureMessage")}
        </p>
        {!success && (
          <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            <Link to="/support" className="underline">{t("needHelp")}</Link>
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/orders" className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">
            <ShoppingBag size={18} />
            {t("viewOrders")}
          </Link>
          <Link to="/products" className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700 hover:bg-gray-50">
            {t("continueShopping")}
          </Link>
        </div>
      </div>
    </div>
  );
}
