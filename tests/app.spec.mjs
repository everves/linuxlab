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

test('interpret terminal output offline, train the same command and retry only what needed help', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'На корневом разделе закончилось место' }).click();
  await expect(page.locator('.reading-feedback')).toContainText('24G');
  await page.getByRole('button', { name: 'Раздел /var заполнен' }).click();
  await expect(page.locator('.lab-count')).toHaveText('Разобрано 1/200');
  await page.getByRole('button', { name: 'Набрать команду' }).click();
  await expect(page.locator('#training-question')).toContainText('заполненность файловых систем');
  const input = page.getByRole('textbox', { name: 'Команда Linux' });
  await input.fill('pwd');
  await input.press('Enter');
  await input.fill('df -h');
  await input.press('Enter');
  await expect(input).toHaveValue('df -h');
  await page.getByRole('button', { name: 'Завершить' }).click();
  await expect(page.locator('.recap li')).toHaveCount(1);
  await page.getByRole('button', { name: 'Повторить трудные задания' }).click();
  await input.fill('df -h');
  await input.press('Enter');
  await expect(page.locator('.feedback.good')).toContainText('уже зачтено');
  await expect(page.locator('.xp-pill')).toHaveText(/5 XP/);
  await page.goto('./');
  await page.reload();
  await expect(page.locator('#reading-title')).toHaveText('Оперативная память');
  await expect(page.locator('.lab-count')).toHaveText('Разобрано 1/200');
});

test('the dashboard preview matches the daily exercise across screen sizes', async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('./');
    const prompt = await page.locator('.plan-preview strong').textContent();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Начать тренировку' }).click();
    await expect(page.locator('#training-question')).toHaveText(prompt);
    await expect(page.getByRole('heading', { name: /Задание 1.*5/ })).toBeVisible();
  }
});

test('reading library keeps old completions and tracks cases of the same command separately offline', async ({ page, context }) => {
  const legacy = { ...newProgress(), readings: {
    'storage-01': 1, 'processes-04': 1, 'systemd-04': 1, 'storage-02': 1, 'reading-07': 1,
  } };
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('./');
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), {
    key: PROGRESS_KEY, progress: legacy,
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  const counter = page.locator('.lab-count');
  const topic = page.getByRole('combobox', { name: 'Тема', exact: true });
  const picker = page.getByRole('combobox', { name: 'Пример', exact: true });
  await expect(counter).toHaveText('Разобрано 5/200');
  await expect(picker.locator('option')).toHaveCount(200);
  await topic.selectOption('docker');
  await expect(picker.locator('option')).toHaveCount(15);
  await picker.selectOption('docker-01-exit');
  await page.getByRole('button', { name: 'Контейнер завершился с нулевым кодом' }).click();
  await expect(counter).toHaveText('Разобрано 6/200');
  await expect(picker.locator('option:checked')).toContainText('пройдено');
  await page.getByRole('button', { name: 'Другой пример' }).click();
  await expect(picker).toHaveValue('docker-01-restart');
  await page.getByRole('button', { name: 'Контейнер в цикле перезапуска после завершения с кодом 1' }).click();
  await expect(counter).toHaveText('Разобрано 7/200');
  await page.getByRole('button', { name: 'Набрать команду' }).click();
  await expect(page.locator('#training-question')).toHaveText('Покажи все контейнеры, включая остановленные');
  await page.goto('./#/practice');
  await expect(counter).toHaveText('Разобрано 7/200');
  await topic.selectOption('observability');
  await picker.selectOption('observability-06-delta');
  await expect(page.locator('#reading-title')).toContainText('Два замера');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
