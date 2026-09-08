import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return <section className="mx-auto max-w-xl px-4 py-20 text-center">
    <p className="text-6xl font-black text-indigo-600">404</p>
    <h1 className="mt-6 text-3xl font-black">{t('pageNotFound')}</h1>
    <p className="mt-4 text-gray-500">{t('pageNotFoundText')}</p>
    <Link to="/products" className="mt-8 inline-flex rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">{t('exploreProducts')}</Link>
  </section>;
}
