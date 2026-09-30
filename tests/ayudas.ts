import type { Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'fs'

export type Entrada = {
  archivo: string
  pantalla: string
  flujo: string
  paso: string
  url: string
  demuestra: string
  criterio: string
}

export const MANIFIESTO: Entrada[] = []

export const DIR = 'informe/capturas'

export const q = (extra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams({ demo: '1', pin: 'skip', ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })
  return `?${p.toString()}`
}

export const abrir = async (page: Page, ruta: string, extra: Record<string, string | number> = {}) => {
  await page.goto(`${q(extra)}#${ruta}`)
  await page.waitForLoadState('networkidle').catch(() => {})
  await page.waitForTimeout(450)
}

export const quieto = async (page: Page, ms = 400) => {
  await page.waitForTimeout(ms)
}

export const capturar = async (page: Page, e: Omit<Entrada, 'url'> & { url?: string }) => {
  mkdirSync(DIR, { recursive: true })
  await quieto(page, 260)
  await page.screenshot({ path: `${DIR}/${e.archivo}`, animations: 'disabled' })
  MANIFIESTO.push({ ...e, url: e.url ?? page.url().split('/justicia-cercana/')[1] ?? page.url() })
}

export const guardarManifiesto = () => {
  mkdirSync('informe', { recursive: true })
  writeFileSync('informe/captures.json', JSON.stringify(MANIFIESTO, null, 2), 'utf-8')
}

export const tocar = async (page: Page, nombre: string | RegExp, exacto = false) => {
  const b = page.getByRole('button', { name: nombre, exact: exacto }).first()
  if (await b.count()) {
    await b.click()
  } else {
    await page.getByText(nombre).first().click()
  }
  await quieto(page, 260)
}

export const escribir = async (page: Page, etiqueta: string | RegExp, texto: string) => {
  const c = page.getByLabel(etiqueta).first()
  await c.fill(texto)
  await c.blur().catch(() => {})
  await quieto(page, 150)
}

export const enlazar = async (page: Page, nombre: string | RegExp) => {
  await page.getByRole('link', { name: nombre }).first().click()
  await quieto(page, 300)
}
