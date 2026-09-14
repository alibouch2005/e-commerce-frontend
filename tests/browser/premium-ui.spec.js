import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  let notificationRead = false;
  await page.addInitScript(() => {
    localStorage.setItem('ali_analytics_consent', 'declined');
    localStorage.setItem('locale', 'fr');
  });

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());
    const json = (data, status = 200) => route.fulfill({ status, json: data });
    if (url.pathname === '/api/user') return json({ user: { id: 2, name: 'Client Test', email: 'client@example.test', role: 'client' } });
    if (url.pathname === '/api/cart') return json({ data: { items: [], total: 0 } });
    if (url.pathname === '/api/notifications') return json({ data: [
      { id: 1, type: 'support', title: 'Réponse du support', message: 'Votre demande a reçu une réponse.', read_at: notificationRead ? '2026-09-09T10:10:00Z' : null, created_at: '2026-09-09T10:00:00Z', data: { support_message_id: 7 } },
      { id: 2, type: 'delivery', title: 'Commande en route', message: 'Votre livreur arrive bientôt.', read_at: '2026-09-09T10:05:00Z', created_at: '2026-09-09T10:05:00Z', data: { order_id: 12 } },
    ] });
    if (url.pathname === '/api/support/messages') return json({ data: [
      { id: 7, type: 'support', subject: 'Problème avec ma commande', message: 'Je souhaite obtenir une information détaillée.', status: 'answered', priority: 'normal', admin_reply: 'Votre demande est prise en charge.', created_at: '2026-09-09T09:00:00Z' },
      { id: 6, type: 'support', subject: 'Demande résolue', message: 'Merci pour votre aide.', status: 'closed', priority: 'low', created_at: '2026-09-08T09:00:00Z' },
    ] });
    if (route.request().method() === 'PATCH') {
      notificationRead = true;
      return json({});
    }
    return json({ data: [] });
  });
});

const noOverflow = async (page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

test('premium support is responsive, clear and keyboard friendly', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/support');

  await expect(page.getByRole('heading', { name: 'Une assistance claire, humaine et suivie' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Historique de l’assistance' })).toBeVisible();
  await page.getByRole('button', { name: 'Important' }).click();
  await expect(page.getByRole('button', { name: 'Important' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Demander un produit' }).click();
  await expect(page.getByText('Image JPG, PNG ou WebP · 4 Mo maximum')).toBeVisible();
  await noOverflow(page);
  if (testInfo.project.name === 'desktop') await page.screenshot({ path: testInfo.outputPath('support-premium.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('premium notification stack closes outside and marks an item read', async ({ page }) => {
  await page.goto('/support');
  const toggle = page.getByRole('button', { name: 'Notifications' });
  await toggle.click();
  await expect(page.getByText('Centre de notifications')).toBeVisible();
  await expect(page.getByText('1 nouvelle(s)')).toBeVisible();
  await noOverflow(page);

  const viewport = page.viewportSize();
  await page.mouse.click(2, viewport.height - 2);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await page.getByRole('button', { name: 'Marquer cette notification comme lue' }).click();
  await expect(page.getByRole('button', { name: 'Marquer cette notification comme lue' })).toHaveCount(0);
});

test('mobile language menu is compact and keeps the selected language clear', async ({ page }) => {
  await page.goto('/support');
  const language = page.getByRole('button', { name: 'Langue' });

  await language.click();
  await expect(language).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('listbox', { name: 'Langue' })).toBeVisible();
  await page.getByRole('option', { name: /English/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('button', { name: 'Language' })).toHaveAttribute('aria-expanded', 'false');
  await noOverflow(page);
});
