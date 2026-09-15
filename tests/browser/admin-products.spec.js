import { test, expect } from '@playwright/test';

const product = (id) => ({
  id, name: `Produit admin ${id}`, price: 100 + id, current_price: 100 + id,
  stock: 20, image: '/product-placeholder.svg', category: { id: 1, name: 'Maison' },
  images: [], has_variants: false, free_delivery: false,
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 1, name: 'Admin Test', email: 'admin@example.test', role: 'admin' } });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    if (url.pathname === '/api/admin/categories') return json({ categories: Array.from({ length: 10 }, (_, index) => ({ id: index + 1, name: `Categorie ${index + 1}`, products_count: index })) });
    if (url.pathname === '/api/users') return json(Array.from({ length: 12 }, (_, index) => ({ id: index + 2, name: `Utilisateur ${index + 1}`, email: `user${index + 1}@example.test`, role: 'client', orders_count: index, total_spent: index * 100 })));
    if (url.pathname === '/api/admin/products') {
      const current = Number(url.searchParams.get('page') || 1);
      return json({ data: Array.from({ length: current === 1 ? 10 : 5 }, (_, index) => product((current - 1) * 10 + index + 1)), meta: {
        current_page: current, last_page: 2, from: (current - 1) * 10 + 1,
        to: current === 1 ? 10 : 15, total: 15,
      } });
    }
    if (url.pathname === '/api/admin/ordered-products') return json({
      data: [{ ...product(30), name: 'Cigar', stock: 9, orders_count: 5 }],
      current_page: 1, last_page: 1, total: 1,
    });
    if (url.pathname === '/api/admin/stats') return json({ total_orders: 2, delivered_orders: 1, low_stock_products: [], status: {}, revenue_trends: { monthly: [], yearly: [] }, customer_conversion: {}, admin_attention: {}, revenue_breakdown: {} });
    if (url.pathname === '/api/admin/sales-by-day') return json([]);
    if (url.pathname === '/api/admin/orders') return json({ data: [], meta: {} });
    if (url.pathname === '/api/admin/analytics') return json({});
    return json({ data: [] });
  });
});

test('product inventory is primary and editor opens only on demand', async ({ page }) => {
  await page.goto('/admin/products');
  await expect(page.getByRole('heading', { name: 'Gestion des produits' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByText('Produit admin 1', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Ajouter un produit' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Prix de livraison (DH)')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: '2', exact: true }).click();
  await expect(page.getByText('Produit admin 11', { exact: true })).toBeVisible();
  await expect(page.getByText(/Produits 11–15 sur/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('admin route reload restores the page without a bare loading screen', async ({ page }) => {
  await page.goto('/admin/coupons');
  await expect(page.getByRole('heading', { name: 'Promotions', level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Promotions', level: 1 })).toBeVisible();
  await expect(page.getByText('Loading...', { exact: true })).toHaveCount(0);
});

test('dashboard provides a direct orders action', async ({ page }) => {
  await page.goto('/admin/dashboard');
  await expect(page.getByRole('link', { name: 'Mes commandes' }).last()).toHaveAttribute('href', '/admin/orders');
  await expect(page.getByRole('link', { name: 'Voir le détail' })).toHaveAttribute('href', '/admin/issues');
  await expect(page.getByText(/Recherche marché terrain/i)).toHaveCount(0);
});

test('categories use premium cards, search and pagination', async ({ page }) => {
  await page.goto('/admin/categories');
  await expect(page.locator('h1').filter({ hasText: 'Catégories' })).toBeVisible();
  await expect(page.getByText('Categorie 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Page suivante' }).click();
  await expect(page.getByText('Categorie 9', { exact: true })).toBeVisible();
});

test('users list is paginated', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page.getByText('Utilisateur 1', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Page suivante' }).click();
  await expect(page.getByText('Utilisateur 11', { exact: true })).toBeVisible();
});

test('ordered products show only order count and current stock', async ({ page }) => {
  await page.goto('/admin/ordered-products');
  const card = page.locator('article').filter({ hasText: 'Cigar' });
  await expect(card).toContainText('5');
  await expect(card).toContainText('Commandes');
  await expect(card).toContainText('9');
  await expect(card).toContainText('Stock actuel');
  await expect(card.getByText(/unités|DH/i)).toHaveCount(0);
});
