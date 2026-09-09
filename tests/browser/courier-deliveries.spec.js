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

test('courier sees daily and outstanding cash on every screen size', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/deliveries');
  await expect(page.getByRole('heading', { name: 'Ma caisse' })).toBeVisible();
  await expect(page.getByText('Reste à remettre · toutes dates')).toBeVisible();
  await expect(page.getByText('250,00', { exact: false }).first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});
