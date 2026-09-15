import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 2, name: 'Client Test', email: 'client@example.test', phone: '0612345678', address: 'Casablanca', role: 'client' } });
    if (url.pathname === '/api/cart') return json({ data: { items: [{ id: 10, quantity: 1, price: 6000, total_price: 6000, product: { id: 1, name: 'Produit test', price: 6000, current_price: 6000 } }], total: 6000 } });
    if (url.pathname === '/api/delivery/quote') return json({ delivery_fee: 30, delivery_distance_km: 5.27, is_estimated: false, free_delivery: false });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    return json({ data: [] });
  });
});

test('cash stays available for a high-value order and card is disabled', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/checkout');
  await expect(page.getByText(/Frais calculés et confirmés/i)).toBeVisible();
  await expect(page.getByText(/5[.,]27\s*km/i)).toHaveCount(0);
  await expect(page.getByRole('radio', { name: /Paiement à la livraison/ })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Paiement à la livraison/ })).toBeEnabled();
  await expect(page.getByRole('radio', { name: /Paiement par carte/ })).toBeDisabled();
  await expect(page.getByText(/quel que soit le montant/).last()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Confirmer la commande' })).toBeEnabled();
  await expect(page.locator('input[autocomplete="cc-number"], input[autocomplete="cc-csc"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
});

test('delivery and store pickup use a clear mobile choice', async ({ page }) => {
  await page.goto('/checkout');

  const delivery = page.getByRole('button', { name: /Livraison à domicile/ });
  const pickup = page.getByRole('button', { name: /Retrait en magasin/ });
  await expect(delivery).toHaveAttribute('aria-pressed', 'true');
  await pickup.click();
  await expect(pickup).toHaveAttribute('aria-pressed', 'true');
  await expect(delivery).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByPlaceholder('Adresse de livraison')).toHaveCount(0);
  await expect(page.getByText('Retrait après notification')).toBeVisible();
  await expect(page.getByText(/Aucun livreur ne sera affecté/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('a failed card payment can be retried on the same secured order', async ({ page }) => {
  await page.context().addCookies([{ name: 'XSRF-TOKEN', value: 'test-token', url: 'http://127.0.0.1:4173' }]);
  await page.addInitScript(() => {
    window.HTMLFormElement.prototype.submit = function submit() {
      window.__cmiSubmission = {
        action: this.action,
        fields: Object.fromEntries(new FormData(this).entries()),
      };
    };
  });
  await page.route('**/api/orders/77', (route) => route.fulfill({ json: { data: {
    id: 77, total_price: 249, computed_total: 249, status: 'pending',
    payment_method: 'card', payment_status: 'failed',
  } } }));
  await page.route('**/api/orders/77/payment/retry', (route) => route.fulfill({ json: { payment: {
    gateway_url: 'https://payment.example.test/cmi', method: 'POST',
    fields: { oid: 'ORDER-77-TEST', amount: '249.00', hash: 'signed-value' },
  } } }));

  await page.goto('/payment/failure?order=77');
  await page.getByRole('button', { name: 'Réessayer le paiement par carte' }).click();
  await expect.poll(() => page.evaluate(() => window.__cmiSubmission)).toEqual({
    action: 'https://payment.example.test/cmi',
    fields: { oid: 'ORDER-77-TEST', amount: '249.00', hash: 'signed-value' },
  });
  await expect(page.locator('input[autocomplete="cc-number"], input[autocomplete="cc-csc"]')).toHaveCount(0);
});
