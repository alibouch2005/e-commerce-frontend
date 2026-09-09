import { ArrowRight, BadgeCheck, CreditCard, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SecureCardPayment({ amount }) {
  const { t, locale, dir } = useLanguage();
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'MAD' }).format(Number(amount || 0));

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 text-white shadow-2xl" aria-labelledby="secure-card-title">
      <div className="grid xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950 p-6 sm:p-8">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="group relative w-full max-w-sm [perspective:1000px]">
            <div className="relative aspect-[1.58/1] overflow-hidden rounded-[1.5rem] border border-white/20 bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 p-5 shadow-[0_25px_70px_rgba(79,70,229,.45)] transition duration-500 motion-safe:group-hover:[transform:rotateY(-7deg)_rotateX(4deg)] sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.38),transparent_30%),linear-gradient(115deg,transparent_35%,rgba(255,255,255,.18)_48%,transparent_62%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="h-9 w-12 rounded-lg bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-inner" aria-hidden="true" />
                  <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-black tracking-widest">{t('cardProtected')}</span>
                </div>
                <p className="font-mono text-lg font-bold tracking-[.16em] drop-shadow sm:text-xl">••••&nbsp; ••••&nbsp; ••••&nbsp; 4242</p>
                <div className="flex items-end justify-between gap-4 text-[9px] uppercase tracking-widest text-white/75">
                  <span>{t('cardHolder')}<strong className="mt-1 block text-xs text-white">{t('yourName')}</strong></span>
                  <span>{t('cardExpiry')}<strong className="mt-1 block text-xs text-white">MM/AA</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-cyan-300"><LockKeyhole size={15} />{t('secureCheckout')}</p>
          <h3 id="secure-card-title" className="mt-3 text-2xl font-black sm:text-3xl">{t('secureCheckoutTitle')}</h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">{t('secureCheckoutText')}</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">{t('total')}</p>
            <p className="mt-1 text-3xl font-black text-white">{money}</p>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-3 xl:grid-cols-1">
            <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={18} />{t('secureThreeDs')}</li>
            <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 shrink-0 text-cyan-300" size={18} />{t('secureCmi')}</li>
            <li className="flex items-start gap-2"><ArrowRight className={`mt-0.5 shrink-0 text-violet-300 ${dir === 'rtl' ? 'rotate-180' : ''}`} size={18} />{t('secureReturn')}</li>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
            {[t('paymentStepOrder'), t('paymentStepBank'), t('paymentStepResult')].map((step) => <span key={step} className="rounded-full border border-white/10 px-3 py-1.5">{step}</span>)}
          </div>
          <p className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-400/10 p-3 text-xs leading-relaxed text-emerald-200"><CreditCard className="shrink-0" size={17} />{t('cardNeverStored')}</p>
          <p className="mt-3 text-xs text-slate-400">{t('acceptedCards')}</p>
        </div>
      </div>
    </section>
  );
}
