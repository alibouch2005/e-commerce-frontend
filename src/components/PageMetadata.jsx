import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function PageMetadata({ product }) {
  const { t, locale } = useLanguage();
  const { pathname, search } = useLocation();
  // Product pages provide metadata only after the actual product is loaded.
  if (/^\/products\/[^/]+$/.test(pathname) && !product) return null;
  const isPublic = Boolean(product) || ['/', '/products', '/support', '/contact'].includes(pathname) || pathname.startsWith('/legal/');
  const base = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '');
  const canonical = new URL(pathname, base);
  const page = Number(new URLSearchParams(search).get('page'));
  if (pathname === '/products' && Number.isSafeInteger(page) && page > 1) canonical.searchParams.set('page', page);
  const legalTitle = { contact: 'Contact', 'delivery-returns': 'Livraison et retours', terms: 'Conditions de vente', privacy: 'Confidentialité' }[pathname.split('/').pop()];
  const title = product ? `${product.name} | AliShop Casablanca` : pathname === '/' ? t('seoHomeTitle') : `${pathname === '/contact' ? 'Contact' : legalTitle || (pathname === '/products' ? t('products') : pathname === '/support' ? t('support') : 'AliShop')} | AliShop Casablanca`;
  const description = product ? (product.short_description || product.description || product.name).slice(0, 170) : pathname === '/contact' ? 'Contactez AliShop Casablanca pour une question sur un produit, une commande ou une livraison.' : t(pathname === '/products' ? 'seoProductsDescription' : 'seoHomeDescription');
  const image = new URL(product?.image || '/store-hero-pro.png', base).href;
  const structured = product ? {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    image: [image], description, url: canonical.href,
    ...(!product.has_variants ? { offers: {
      '@type': 'Offer', url: canonical.href, priceCurrency: 'MAD',
      price: Number(product.current_price ?? product.price).toFixed(2),
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'AliShop' },
    } } : {}),
  } : pathname === '/' ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite', name: 'AliShop', url: `${base}/`, inLanguage: ['fr-MA', 'ar-MA', 'en'],
        potentialAction: { '@type': 'SearchAction', target: `${base}/products?search={search_term_string}`, 'query-input': 'required name=search_term_string' },
      },
      {
        '@type': 'Store', name: 'AliShop', url: `${base}/`, image, logo: new URL('/alishop-logo.png', base).href,
        address: { '@type': 'PostalAddress', streetAddress: 'Rue 177', postalCode: '20202', addressLocality: 'Casablanca', addressCountry: 'MA' },
        areaServed: { '@type': 'City', name: 'Casablanca' }, currenciesAccepted: 'MAD', paymentAccepted: 'Cash',
      },
    ],
  } : null;
  return <>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content={isPublic ? 'index,follow' : 'noindex,nofollow'} />
    <link rel="canonical" href={canonical.href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content="AliShop" />
    <meta property="og:url" content={canonical.href} />
    <meta property="og:image" content={image} />
    <meta property="og:type" content={product ? 'product' : 'website'} />
    <meta property="og:locale" content={{ fr: 'fr_MA', en: 'en_US', ar: 'ar_MA' }[locale]} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
    {structured && <script type="application/ld+json">{JSON.stringify(structured).replaceAll('<', '\\u003c')}</script>}
  </>;
}
