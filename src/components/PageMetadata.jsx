import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PageMetadata({ product }) {
  const { t, locale } = useLanguage();
  const { pathname, search } = useLocation();
  // Product pages provide metadata only after the actual product is loaded.
  if (/^\/products\/[^/]+$/.test(pathname) && !product) return null;
  const isPublic = Boolean(product) || ['/', '/products', '/support'].includes(pathname);
  const base = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
  const canonical = new URL(pathname, base);
  const page = Number(new URLSearchParams(search).get('page'));
  if (pathname === '/products' && Number.isSafeInteger(page) && page > 1) canonical.searchParams.set('page', page);
  const title = product ? `${product.name} | AliShop Casablanca` : pathname === '/' ? t('seoHomeTitle') : `${pathname === '/products' ? t('products') : pathname === '/support' ? t('support') : 'AliShop'} | AliShop Casablanca`;
  const description = product ? (product.short_description || product.description || product.name).slice(0, 170) : t(pathname === '/products' ? 'seoProductsDescription' : 'seoHomeDescription');
  const image = new URL(product?.image || '/store-hero-pro.png', base).href;
  const structured = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    image: [image], description, url: canonical.href,
    ...(!product.has_variants ? { offers: {
      '@type': 'Offer', url: canonical.href, priceCurrency: 'MAD',
      price: Number(product.current_price ?? product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    } } : {}),
  } : null;
  return <>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content={isPublic ? 'index,follow' : 'noindex,nofollow'} />
    <link rel="canonical" href={canonical.href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical.href} />
    <meta property="og:image" content={image} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content={{ fr: 'fr_MA', en: 'en_US', ar: 'ar_MA' }[locale]} />
    <meta name="twitter:card" content="summary_large_image" />
    {structured && <script type="application/ld+json">{JSON.stringify(structured).replaceAll('<', '\\u003c')}</script>}
  </>;
}
