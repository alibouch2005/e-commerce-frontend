import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 7, name: 'Livreur Test', email: 'livreur@example.test', role: 'livreur' } });
    if (url.pathname === '/api/livreur/orders') return json({ data: [], meta: { current_page: 1, last_page: 1 } });
    if (url.pathname === '/api/livreur/cash') return json({
      date: '2026-09-09', courier: { id: 7, name: 'Livreur Test' },
      summary: { delivered_count: 3, day_cash_cents: 25000, day_cash_products_cents: 20500, day_cash_delivery_cents: 4500, day_card_cents: 10000, day_fees_cents: 4500, outstanding_cents: 25000, outstanding_products_cents: 20500, outstanding_delivery_cents: 4500 },
      untracked_deliveries: 0, untracked_orders: [], entries: { data: [], current_page: 1, last_page: 1 }, history: { data: [], current_page: 1, last_page: 1 },
    });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    return json({ data: [] });
  });
});

test('courier opens cash on its own responsive page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/deliveries');
  await page.getByRole('link', { name: 'Ma caisse' }).first().click();
  await expect(page).toHaveURL(/\/deliveries\/cash$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Ma caisse' })).toBeVisible();
  await expect(page.getByText('Reste à remettre · toutes dates')).toBeVisible();
  await expect(page.getByText(/250\s*MAD/, { exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test('courier can inspect an available order before accepting it', async ({ page }) => {
  const order = {
    id: 31, livreur_id: null, status: 'pending', fulfillment_method: 'delivery',
    adresse_livraison: 'Casablanca', delivery_latitude: 33.5471,
    delivery_longitude: -7.7036, delivery_time_slot: '12_18', phone: '0612345678',
    total_price: 149, computed_total: 149, payment_method: 'cash_on_delivery', route_score: 0.01,
    user: { name: 'Client Oulfa' }, items: [{ id: 1, quantity: 1, price: 149, product: { name: 'Colis test' } }],
  };
  await page.route('**/api/livreur/orders**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === '/api/livreur/orders/31') return route.fulfill({ json: { data: order } });
    if (url.pathname === '/api/livreur/orders') return route.fulfill({ json: { data: [order], meta: { current_page: 1, last_page: 1 } } });
    return route.fallback();
  });
  await page.route('**/api/delivery/address**', (route) => route.fulfill({ json: {
    address: 'Rue Al Azhar, Oulfa, Hay Hassani, Casablanca, Maroc',
  } }));
  await page.goto('/deliveries');
  await expect(page.getByText('Casablanca', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: /Voir les détails/ }).click();
  await expect(page).toHaveURL(/\/deliveries\/31$/);
  await expect(page.getByRole('heading', { name: 'Adresse détaillée' })).toBeVisible();
  await expect(page.getByText('Rue Al Azhar, Oulfa, Hay Hassani, Casablanca, Maroc').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accepter cette livraison' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
