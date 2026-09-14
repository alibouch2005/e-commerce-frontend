import { test, expect } from '@playwright/test';

const orders = Array.from({ length: 12 }, (_, index) => ({
  id: 22 - index,
  client_order_number: 12 - index,
  status: 'pending',
  fulfillment_method: 'delivery',
  created_at: '2026-09-09T10:00:00Z',
  total_price: 57,
  computed_total: 57,
  items_subtotal: 31,
  delivery_fee: 26,
  delivery_distance_km: 5.27,
  delivery_time_slot: '18_21',
  can_client_cancel: true,
  items: [{ id: index + 1, quantity: 1, price: 31, total_price: 31, product: { name: 'Produit test' } }],
}));

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 2, name: 'Client Test', email: 'client@example.test', role: 'client' } });
    if (url.pathname === '/api/cart') return json({ data: { items: [], total: 0 } });
    if (url.pathname === '/api/orders') return json({ data: orders, meta: { current_page: 1, last_page: 1 } });
    if (url.pathname === '/api/orders/22') return json({ data: orders[0] });
    return json({ data: [] });
  });
});

test('order details fit the viewport and close outside or with Escape', async ({ page }, testInfo) => {
  await page.goto('/orders');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('button', { name: /Commande 12/ }).click();

  const dialog = page.getByRole('dialog', { name: 'Commande 12' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/Distance livraison/i)).toHaveCount(0);
  await expect(dialog.getByText(/57\s*MAD/i)).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  if (['mobile', 'small-mobile'].includes(testInfo.project.name)) {
    expect(Math.abs(box.y + box.height - viewport.height)).toBeLessThan(3);
  } else {
    expect(Math.abs((box.y + box.height / 2) - viewport.height / 2)).toBeLessThan(3);
  }

  await dialog.getByText('Produit test x1').click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(Math.round(viewport.width / 2), Math.max(70, Math.floor(box.y - 10)));
  await expect(dialog).toHaveCount(0);

  await page.getByRole('button', { name: /Commande 12/ }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
