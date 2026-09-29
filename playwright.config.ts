import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/justicia-cercana/',
    reducedMotion: 'reduce',
    deviceScaleFactor: 2,
    hasTouch: true,
    viewport: { width: 1280, height: 800 }
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/justicia-cercana/',
    reuseExistingServer: true,
    timeout: 120_000
  }
})
