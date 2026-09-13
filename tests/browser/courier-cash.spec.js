import { test, expect } from '@playwright/test';

const courier = {
  id: 7, name: 'Livreur Casablanca', phone: '0611223344', delivered_count: 2,
  day_cash_cents: 15500, day_cash_products_cents: 12500, day_cash_delivery_cents: 3000,
  day_card_cents: 7000, day_fees_cents: 3000, outstanding_cents: 15500,
  outstanding_products_cents: 12500, outstanding_delivery_cents: 3000,
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 1, name: 'Admin Test', email: 'admin@example.test', role: 'admin' } });
    if (url.pathname === '/api/admin/courier-cash') return json({ date: '2026-09-09', couriers: { data: [courier], current_page: 1, last_page: 1 } });
    if (url.pathname === '/api/admin/courier-cash/7') return json({
      date: '2026-09-09', courier, summary: courier, untracked_deliveries: 1,
      untracked_orders: [{ id: 40, phone: '0600000000', client_name: 'Ancien client', amount_cents: 9000, product_amount_cents: 7000, delivery_fee_cents: 2000 }],
      entries: { data: [{ id: 11, order_id: 42, payment_method: 'cash_on_delivery', amount_cents: 15500, delivery_fee_cents: 3000, settlement_id: null, collected_at: '2026-09-09T12:00:00Z', order: { phone: '0611223344', adresse_livraison: 'Maarif, Casablanca', user: { name: 'Client Test' } } }], current_page: 1, last_page: 1 },
      history: { data: [], current_page: 1, last_page: 1 },
    });
    if (url.pathname === '/api/cart') return json({ data: { items: [], total: 0 } });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    return json({ data: [] });
  });
});

test('admin cash reconciliation is readable and responsive', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/admin/courier-cash');
  await expect(page.getByRole('heading', { level: 1, name: 'Caisse des livreurs' })).toBeVisible();
  await expect(page.getByText(/155\s*MAD/, { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Ouvrir la caisse' }).click();
  await expect(page.locator('#courier-cash-detail')).toBeVisible();
  await expect(page.getByText('Commande 42')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Initialiser les anciennes livraisons/ })).toBeVisible();
  await expect(page.getByText('Montant des produits').first()).toBeVisible();
  await expect(page.getByText('Prix de livraison').first()).toBeVisible();
  await expect(page.getByText('Carte · déjà payé en ligne').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});
