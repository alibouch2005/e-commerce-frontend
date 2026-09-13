import { test, expect } from '@playwright/test';

const tickets = [
  { id: 9, type: 'support', name: 'Client Urgent', email: 'urgent@example.test', subject: 'Commande non reçue', message: 'Ma commande devait arriver mais je ne l’ai toujours pas reçue.', priority: 'urgent', status: 'open', created_at: '2026-09-11T09:00:00Z', user: { id: 2, name: 'Client Urgent' } },
  { id: 8, type: 'product_request', name: 'Client Produit', email: 'produit@example.test', subject: 'Recherche un produit', message: 'Je souhaite trouver ce produit dans votre catalogue.', requested_product_name: 'Casque premium', requested_product_city: 'Casablanca', priority: 'normal', status: 'in_progress', created_at: '2026-09-10T10:00:00Z' },
];

test.beforeEach(async ({ page }) => {
  const activeTickets = tickets.map((ticket) => ({ ...ticket }));
  await page.addInitScript(() => localStorage.setItem('ali_analytics_consent', 'declined'));
  await page.route('**/sanctum/csrf-cookie', (route) => route.fulfill({ status: 204 }));
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 1, name: 'Admin Test', email: 'admin@example.test', role: 'admin' } });
    if (url.pathname === '/api/notifications') return json({ data: [] });
    if (url.pathname === '/api/admin/support/messages' && route.request().method() === 'GET') return json({ data: activeTickets, current_page: 1, last_page: 1, total: 2, from: 1, to: 2, summary: { total: 9, active: 4, urgent: 1, answered: 3, closed: 2 } });
    if (url.pathname === '/api/admin/support/messages/9' && route.request().method() === 'PATCH') {
      activeTickets[0] = { ...activeTickets[0], status: 'answered', admin_reply: 'Nous contactons immédiatement le livreur.' };
      return json(activeTickets[0]);
    }
    if (url.pathname === '/api/admin/stats') return json({ admin_attention: { pending_orders: 5, overdue_pending_orders: 2, stale_delivery_offers: 1, unassigned_shipping: 0, failed_card_payments: 1, stale_card_payments: 0, urgent_support: 1, open_support: 4, open_product_requests: 1, out_of_stock: 2, low_stock: 3, refunds: 1, pending_cash_collections: 2, pending_cash_amount_cents: 15500 } });
    return json({ data: [] });
  });
});

test('premium admin support prioritizes and answers tickets', async ({ page }) => {
  await page.goto('/admin/support');
  await expect(page.getByRole('heading', { name: 'Centre de support' })).toBeVisible();
  await expect(page.getByText('Commande non reçue', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Ma commande devait arriver mais je ne l’ai toujours pas reçue.')).toBeVisible();
  await page.getByLabel('Répondre au client').fill('Nous contactons immédiatement le livreur.');
  await page.getByRole('button', { name: 'Envoyer la réponse' }).click();
  await expect(page.getByText('Dernière réponse envoyée')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});

test('issue center exposes blockers and direct actions', async ({ page }) => {
  await page.goto('/admin/issues');
  await expect(page.getByRole('heading', { level: 1, name: 'Centre des problèmes' })).toBeVisible();
  await expect(page.getByText('Paiements carte échoués')).toBeVisible();
  await expect(page.getByText('Remises de caisse non validées')).toBeVisible();
  await expect(page.getByText(/155\s*MAD/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Répondre maintenant' })).toHaveAttribute('href', '/admin/support');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
});
