import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.mjs',
  use: { baseURL: 'http://127.0.0.1:4173/linuxlab/', trace: 'retain-on-failure' },
  projects: ['chromium', 'firefox', 'webkit'].map(browserName => ({ name: browserName, use: { browserName } })),
  webServer: {
    command: 'npm run build && npm run serve',
    url: 'http://127.0.0.1:4173/linuxlab/',
  },
});
