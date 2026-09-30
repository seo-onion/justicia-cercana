import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFileSync, mkdirSync } from 'fs'
import { PANTALLAS } from './pantallas'

test('contraste WCAG AA con axe-core', async ({ page }) => {
  const filas: any[] = []
  const fallos: any[] = []

  for (const p of PANTALLAS) {
    await page.setViewportSize(p.pc ? { width: 1440, height: 900 } : { width: 1280, height: 800 })
    await page.goto(p.url)
    await page.waitForTimeout(600)

    const r = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze()

    const contraste = r.violations.filter((v) => v.id === 'color-contrast')
    const otras = r.violations.filter((v) => v.id !== 'color-contrast')

    filas.push({
      pantalla: `${p.id} ${p.nombre}`,
      elementos: r.passes.filter((v) => v.id === 'color-contrast').reduce((a, v) => a + v.nodes.length, 0),
      contraste: contraste.reduce((a, v) => a + v.nodes.length, 0),
      otras: otras.reduce((a, v) => a + v.nodes.length, 0)
    })

    for (const v of r.violations)
      for (const n of v.nodes)
        fallos.push({ pantalla: `${p.id} ${p.nombre}`, regla: v.id, impacto: v.impact, elemento: n.target.join(' '), detalle: (n.failureSummary || '').split('\n').slice(0, 2).join(' ') })
  }

  mkdirSync('informe/datos', { recursive: true })
  writeFileSync('informe/datos/contraste.json', JSON.stringify({ filas, fallos }, null, 2), 'utf-8')
  console.log(`Pantallas auditadas: ${filas.length}. Incumplimientos: ${fallos.length}`)
  for (const f of fallos.slice(0, 30)) console.log(` ✗ ${f.pantalla} [${f.regla}] ${f.elemento} → ${f.detalle}`)
  expect(fallos, `axe-core encontró ${fallos.length} incumplimientos WCAG AA`).toHaveLength(0)
})
