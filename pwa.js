export async function registerOffline(onStatus) {
  if (!('serviceWorker' in navigator) || !isSecureContext) {
    onStatus('Недоступен в этом браузере');
    return;
  }
  if (!document.documentElement.hasAttribute('data-offline')) {
    onStatus('Доступен в собранной версии');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('./sw.js');
    const updateBanner = document.getElementById('pwa-update');
    const sync = () => {
      updateBanner.hidden = !registration.waiting || !navigator.serviceWorker.controller;
      onStatus(navigator.serviceWorker.controller ? 'Готов к работе без сети' : 'Загружается');
    };
    const watch = () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        sync();
        if (worker.state === 'redundant' && !registration.active) onStatus('Не удалось подготовить офлайн-режим');
      });
    };
    watch();
    sync();
    registration.addEventListener('updatefound', watch);
    navigator.serviceWorker.addEventListener('controllerchange', sync);
  } catch {
    onStatus('Не удалось подготовить офлайн-режим');
  }
}
