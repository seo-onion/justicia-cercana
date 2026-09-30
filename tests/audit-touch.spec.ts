import { test, expect } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'fs'
import { PANTALLAS, q } from './pantallas'

const MIN = 48
const SEP = 8

type Fallo = { pantalla: string; letra: string; elemento: string; ancho: number; alto: number; motivo: string }

const medir = async (page: any) =>
  page.evaluate(
    ({ MIN, SEP }: { MIN: number; SEP: number }) => {
      const sel = 'button, a[href], input:not([type=hidden]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
      const nodos = Array.from(document.querySelectorAll(sel)) as HTMLElement[]
      const visibles = nodos.filter((n) => {
        const r = n.getBoundingClientRect()
        const s = getComputedStyle(n)
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !n.closest('[hidden]')
      })
      const nombre = (n: HTMLElement) => {
        const t = (n.getAttribute('aria-label') || n.textContent || n.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ')
        return `${n.tagName.toLowerCase()}${n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').filter(Boolean).slice(0, 2).join('.') : ''} «${t.slice(0, 42)}»`
      }
      const fallos: any[] = []
      const zona = (n: HTMLElement) => {
        const etiqueta = n.closest('label')
        if (etiqueta) {
          const re = etiqueta.getBoundingClientRect()
          if (re.width >= MIN && re.height >= MIN) return re
        }
        return n.getBoundingClientRect()
      }
      const cajas = visibles.map((n) => ({ n, r: zona(n) }))
      for (const { n, r } of cajas) {
        if (r.width < MIN || r.height < MIN) {
          fallos.push({ elemento: nombre(n), ancho: Math.round(r.width), alto: Math.round(r.height), motivo: `menor que ${MIN}x${MIN} px` })
        }
      }
      for (let i = 0; i < cajas.length; i++) {
        for (let j = i + 1; j < cajas.length; j++) {
          const a = cajas[i]
          const b = cajas[j]
          if (a.n.contains(b.n) || b.n.contains(a.n)) continue
          if (a.n.closest('label') && a.n.closest('label') === b.n.closest('label')) continue
          const dx = Math.max(0, Math.max(a.r.left - b.r.right, b.r.left - a.r.right))
          const dy = Math.max(0, Math.max(a.r.top - b.r.bottom, b.r.top - a.r.bottom))
          const solapanX = a.r.left < b.r.right && b.r.left < a.r.right
          const solapanY = a.r.top < b.r.bottom && b.r.top < a.r.bottom
          if (solapanY && !solapanX && dx < SEP) fallos.push({ elemento: `${nombre(a.n)} / ${nombre(b.n)}`, ancho: Math.round(dx), alto: 0, motivo: `separación horizontal ${Math.round(dx)} px, menor que ${SEP} px` })
          if (solapanX && !solapanY && dy < SEP) fallos.push({ elemento: `${nombre(a.n)} / ${nombre(b.n)}`, ancho: 0, alto: Math.round(dy), motivo: `separación vertical ${Math.round(dy)} px, menor que ${SEP} px` })
        }
      }
      return { total: visibles.length, fallos }
    },
    { MIN, SEP }
  )

test('objetivos táctiles de 48x48 px con separación de 8 px', async ({ page }) => {
  const fallos: Fallo[] = []
  const filas: any[] = []

  for (const letra of ['normal', 'large', 'xlarge']) {
    for (const p of PANTALLAS) {
      if (p.id === 'P-10') continue
      const url = letra === 'normal' ? p.url : p.url.replace('demo=1', `demo=1&font=${letra}`)
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.goto(url)
      await page.waitForTimeout(600)
      const r = await medir(page)
      filas.push({ pantalla: `${p.id} ${p.nombre}`, letra, controles: r.total, fallos: r.fallos.length })
      for (const f of r.fallos) fallos.push({ pantalla: `${p.id} ${p.nombre}`, letra, ...f })
    }
  }

  mkdirSync('informe/datos', { recursive: true })
  writeFileSync('informe/datos/tactil.json', JSON.stringify({ minimo: MIN, separacion: SEP, filas, fallos }, null, 2), 'utf-8')
  console.log(`Controles medidos en ${filas.length} pantallas. Fallos: ${fallos.length}`)
  for (const f of fallos.slice(0, 30)) console.log(` ✗ ${f.pantalla} [${f.letra}] ${f.elemento} → ${f.motivo}`)
  expect(fallos, `Hay ${fallos.length} controles que no cumplen 48x48 px o la separación de 8 px`).toHaveLength(0)
})
