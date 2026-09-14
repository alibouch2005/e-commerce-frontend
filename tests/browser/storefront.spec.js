import { test, expect } from '@playwright/test';

const products = Array.from({ length: 26 }, (_, index) => ({
  id: index + 1, name: `Produit test ${index + 1}`, price: 29.9, current_price: 29.9,
  stock: 15, image: '/product-placeholder.svg', category: { id: 1, name: 'Maison' },
  short_description: 'Un produit utile au quotidien.', has_variants: false, images: [],
}));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('ali_analytics_consent', 'declined');
  });
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ message: 'Unauthenticated.' }, 401);
    if (url.pathname === '/api/cart') return json({ data: { items: [], total: 0 } });
    if (url.pathname === '/api/categories') return json({ data: [{ id: 1, name: 'Maison' }] });
    if (url.pathname === '/api/products') {
      const perPage = Number(url.searchParams.get('per_page') || 12);
      const current = Number(url.searchParams.get('page') || 1);
      const term = url.searchParams.get('search') || '';
      const filtered = products.filter((product) => product.name.includes(term) && product.id !== Number(url.searchParams.get('exclude')));
      const from = (current - 1) * perPage;
      return json({ data: filtered.slice(from, from + perPage), meta: {
        current_page: current, last_page: Math.max(1, Math.ceil(filtered.length / perPage)),
        from: from + 1, to: Math.min(from + perPage, filtered.length), total: filtered.length,
      } });
    }
    if (url.pathname === '/api/products/1') return json({ data: products[0] });
    if (url.pathname === '/api/products/999') return json({ message: 'Not found' }, 404);
    return json({ data: [] });
  });
});

const noOverflow = async (page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

test('mobile catalog shows exactly two usable product cards per row', async ({ page }) => {
  await page.goto('/products');
  const cards = page.locator('article');
  await expect(cards).toHaveCount(12);
  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(Math.abs(first.y - second.y)).toBeLessThan(2);
  expect(second.x).toBeGreaterThan(first.x + first.width - 2);
  await noOverflow(page);
});

test('authentication card is centered on desktop and remains responsive', async ({ page }, testInfo) => {
  await page.goto('/login');
  const card = page.getByTestId('auth-card');
  await expect(card).toBeVisible();
  const password = page.locator('input[type="password"]');
  await expect(password).toHaveCount(1);
  await page.getByRole('button', { name: 'Afficher le mot de passe' }).click();
  await expect(page.locator('input[type="text"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Masquer le mot de passe' }).click();
  await expect(password).toHaveCount(1);
  await noOverflow(page);
  if (testInfo.project.name === 'desktop') {
    const box = await card.boundingBox();
    const viewport = page.viewportSize();
    expect(Math.abs((box.y + box.height / 2) - viewport.height / 2)).toBeLessThan(55);
  }
});

test('empty cart is stable, responsive and guides the customer back to products', async ({ page }) => {
  const errors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/cart');
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
  expect(consoleErrors.filter((message) => /ReferenceError|Application error/i.test(message))).toEqual([]);
  await expect(page.getByRole('heading', { name: 'Votre panier est vide' })).toBeVisible();
  await expect(page.getByText('Paiement sécurisé')).toBeVisible();
  await noOverflow(page);
  await page.getByRole('button', { name: 'Voir les produits' }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test('pagination, refresh, search and page size stay synchronized', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/products?page=2');
  await expect(page.getByRole('heading', { name: 'Produit test 13', exact: true })).toBeVisible();
  // Wait beyond the search debounce to catch the original page-reset regression.
  await page.waitForTimeout(700);
  await expect(page).toHaveURL(/page=2/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Produit test 13', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Produit test 25', exact: true })).toBeVisible();
  await page.waitForTimeout(700);
  await expect(page).toHaveURL(/page=3/);
  await page.getByRole('searchbox').fill('Produit test 2');
  await expect(page).not.toHaveURL(/page=3/);
  await expect(page.getByRole('heading', { name: 'Produit test 2', exact: true })).toBeVisible();
  await page.getByRole('searchbox').fill('');
  await expect(page.getByRole('heading', { name: 'Produit test 1', exact: true })).toBeVisible();
  await page.locator('select').filter({ has: page.locator('option[value="24"]') }).selectOption('24');
  await expect(page.getByRole('heading', { name: 'Produit test 24', exact: true })).toBeVisible();
  await noOverflow(page);
  expect(errors).toEqual([]);
});

test('catalog failure offers a working retry', async ({ page }) => {
  let failed = true;
  await page.route('**/api/products?**', async (route) => {
    if (failed) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    return route.fallback();
  });
  await page.goto('/products');
  await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
  failed = false;
  await page.getByRole('button', { name: 'Réessayer' }).click();
  await expect(page.getByRole('heading', { name: 'Produit test 1', exact: true })).toBeVisible();
});

test('home, product details and Arabic layout remain usable', async ({ page }, testInfo) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Vos achats, récompensés' })).toBeVisible();
  await noOverflow(page);
  await page.getByRole('link', { name: 'Découvrir les promotions' }).click();
  await expect(page).toHaveURL(/sale=1/);
  await page.goto('/products/1');
  await expect(page.getByRole('heading', { level: 1, name: 'Produit test 1', exact: true })).toBeVisible();
  await expect(page).toHaveTitle(/Produit test 1/);
  await noOverflow(page);
  await page.evaluate(() => localStorage.setItem('locale', 'ar'));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('nav[dir]')).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'مشترياتك تستحق المكافأة' })).toBeVisible();
  await noOverflow(page);
  await page.screenshot({ path: testInfo.outputPath('home-ar.png') });
  await page.evaluate(() => localStorage.setItem('locale', 'en'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Shopping that rewards you' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});

test('contact page is responsive and exposes the official email', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.getByRole('heading', { level: 1, name: 'Parlons de votre besoin.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'contact@alishop.ma' }).first()).toHaveAttribute('href', 'mailto:contact@alishop.ma');
  await expect(page.getByRole('heading', { name: 'Envoyer un message' })).toBeVisible();
  await noOverflow(page);
});

test('signed-in navigation fits and mobile menu closes outside', async ({ page }) => {
  await page.route('**/api/user', (route) => route.fulfill({ json: {
    user: { id: 1, name: 'Client avec un nom particulièrement long', email: 'client@example.test', role: 'client' },
  } }));
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Produit test 1', exact: true })).toBeVisible();
  await noOverflow(page);
  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.mouse.click(1, 1);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
});

test('cart badge displays the total quantity of products', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'The compact mobile navigation uses the menu instead of the desktop cart shortcut.');
  await page.route('**/api/cart', (route) => route.fulfill({ json: { data: {
    items: [
      { id: 1, quantity: 2, price: 10, product: products[0] },
      { id: 2, quantity: 3, price: 20, product: products[1] },
    ],
    total: 80,
  } } }));
  await page.goto('/products');
  await expect(page.getByRole('link', { name: 'Panier : 5 article(s)' })).toBeVisible();
});

test('unknown pages, missing products and forged payment success are handled', async ({ page }) => {
  await page.goto('/missing-page');
  await expect(page.getByRole('heading', { name: 'Cette page est introuvable' })).toBeVisible();
  await page.goto('/products/999');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.goto('/payment/success?order=123&status=paid');
  await expect(page.getByRole('heading')).not.toHaveText('Paiement confirmé');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,nofollow');
});
