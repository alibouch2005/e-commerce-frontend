import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 2, name: 'Client Test', email: 'client@example.test', phone: '0612345678', address: 'Casablanca', role: 'client' } });
    if (url.pathname === '/api/cart') return json({ data: { items: [{ id: 10, quantity: 1, price: 249, total_price: 249, product: { id: 1, name: 'Produit test', price: 249, current_price: 249 } }], total: 249 } });
    if (url.pathname === '/api/delivery/quote') return json({ delivery_fee: 30, delivery_distance_km: null, is_estimated: true, free_delivery: false });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    return json({ data: [] });
  });
});

test('secure CMI choice is professional without collecting card data', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/checkout');
  await page.getByRole('radio', { name: /Paiement par carte/ }).check();
  await expect(page.getByRole('heading', { name: 'Réglez votre commande en toute confiance' })).toBeVisible();
  await expect(page.getByText('AliShop ne voit et ne conserve jamais votre numéro de carte ni votre CVV.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmer et continuer vers CMI' })).toBeVisible();
  await expect(page.locator('input[autocomplete="cc-number"], input[autocomplete="cc-csc"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});
