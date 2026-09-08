import { Link } from 'react-router-dom';
import { ArrowRight, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function ShoppingGuide() {
  const { t } = useLanguage();
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Gift size={32} className="shrink-0 text-indigo-600" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-black text-gray-950">{t('loyaltyTitle')}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">{t('loyaltyText')}</p>
          </div>
        </div>
        <Link to="/products?sale=1" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700">
          {t('discoverOffers')} <ArrowRight size={18} className="rtl:rotate-180" />
        </Link>
      </div>
      <div>
        <h2 className="mb-5 text-2xl font-black text-gray-950">{t('shoppingGuide')}</h2>
        <div className="grid items-start gap-3 md:grid-cols-2">
          {['delivery', 'pickup', 'payment', 'help'].map((topic) => (
            <details key={topic} className="rounded-2xl border border-gray-200 bg-white p-5 open:border-indigo-300">
              <summary className="cursor-pointer font-bold text-gray-900">{t(`${topic}Question`)}</summary>
              <p className="mt-3 text-sm leading-7 text-gray-600">{t(`${topic}Answer`)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
