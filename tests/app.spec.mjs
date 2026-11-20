import { expect, test } from '@playwright/test';
import { newProgress, PROGRESS_KEY } from '../progress.js';

test('all sections are reachable on desktop, tablet and phone widths', async ({ page }) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    if (width <= 820) await page.locator('.nav-more summary').click();
    await page.getByRole('link', { name: 'Справочник', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Linux cheat sheet' })).toBeVisible();
    if (width <= 820) await page.locator('.nav-more summary').click();
    await page.getByRole('link', { name: 'Настройки', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Экспорт' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Импорт' })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('lesson and incident links survive refresh and browser back', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('link', { name: 'Курсы', exact: true }).click();
  await page.locator('a[href="#/courses/files"]').click();
  await expect(page.getByRole('heading', { name: 'Навигация и файлы', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Навигация и файлы', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Учебные модули' })).toBeVisible();
  await page.goto('./#/incidents/nginx-down');
  await expect(page.getByRole('heading', { name: 'Nginx не запускается' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Вывод терминала' })).toBeVisible();
  await page.reload();
  await page.getByRole('textbox', { name: 'Команда для диагностики' }).fill('systemctl status nginx');
  await page.getByRole('textbox', { name: 'Команда для диагностики' }).press('Enter');
  await expect(page.locator('#incident-stage')).toContainText('ШАГ 2');
});

test('a hidden solution still counts as seen and Enter advances from the result', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Начать тренировку' }).click();
  const solution = page.getByRole('button', { name: 'Решение', exact: true });
  await solution.click();
  const answer = await page.locator('.feedback.hint code').textContent();
  await solution.press('Enter');
  const input = page.getByRole('textbox', { name: 'Команда Linux' });
  await input.fill(answer);
  await input.press('Enter');
  await expect(page.locator('.feedback.good')).toContainText('Верно, решение найдено.');
  await expect(page.locator('.xp-pill')).toContainText('1 XP');
  const next = page.getByRole('button', { name: 'Дальше' });
  await expect(next).toBeFocused();
  await next.press('Enter');
  await expect(page.getByRole('heading', { name: /Задание 2/ })).toBeVisible();
  await expect(input).toBeFocused();
});

test('the TCP exercise explains mobile punctuation and accepts the reordered flags', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const backup = newProgress();
  backup.drills['network-05'] = { seen: 1, correct: 0, fails: 1, streak: 0, interval: 0, due: 0, last: 1 };
  await page.addInitScript(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), {
    key: PROGRESS_KEY,
    progress: backup,
  });
  await page.goto('./#/review');
  await page.getByRole('button', { name: 'Начать повторение' }).click();
  const input = page.getByRole('textbox', { name: 'Команда Linux' });

  await input.fill('nc −zv 10.10.20.15 5432');
  await input.press('Enter');
  await expect(page.locator('.feedback.bad')).toContainText('обычный дефис');

  await input.fill('nc -zv 10.10.20.15 5433');
  await input.press('Enter');
  await expect(page.locator('.feedback.bad')).toContainText('номер порта');

  await input.fill('nc -zv 10.10.20.15 5432');
  await input.press('Enter');
  await expect(page.locator('.feedback.good')).toContainText('Верно');
});

test('invalid imports preserve data and valid old backups restore it', async ({ page }) => {
  await page.goto('./#/settings');
  const file = page.locator('#import-file');
  await file.setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"version":1}') });
  await expect(page.getByText('В резервной копии есть некорректные данные прогресса.')).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), PROGRESS_KEY)).toBeNull();
  const backup = { ...newProgress(), xp: 42, settings: { dailyGoal: 20 } };
  page.once('dialog', dialog => dialog.accept());
  await file.setInputFiles({ name: 'v1.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await expect(page.locator('.xp-pill')).toContainText('42 XP');
  await page.reload();
  await expect(page.locator('.xp-pill')).toContainText('42 XP');
});

test('cached deep links reload offline and sibling caches survive', async ({ page, context }) => {
  await page.goto('../missing');
  await page.evaluate(() => caches.open('other-site-v1'));
  await page.goto('./#/courses/files');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  expect(await page.evaluate(() => caches.keys())).toContain('other-site-v1');
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Навигация и файлы', exact: true })).toBeVisible();
  const missingAssetFailed = await page.evaluate(() => fetch('./missing.css').then(() => false, () => true));
  expect(missingAssetFailed).toBe(true);
});
