import { HOY } from './fechas.js'

export const JUZGADO = '04'
export const TABLETA = '01'

const aamm = (iso = HOY) => iso.slice(0, 4) + iso.slice(5, 7)

const siguiente = (existentes, prefijo) => {
  const n = existentes
    .map((c) => (c.startsWith(prefijo) ? Number(c.slice(prefijo.length)) : 0))
    .reduce((a, b) => Math.max(a, b), 0)
  return String(n + 1).padStart(4, '0')
}

export const codigoCaso = (codigos, iso = HOY) => {
  const p = `JZ${JUZGADO}-TAB${TABLETA}-${aamm(iso)}-`
  return p + siguiente(codigos, p)
}

export const codigoActuacion = (codigos, iso = HOY) => {
  const p = `NOT-TAB${TABLETA}-${aamm(iso)}-`
  return p + siguiente(codigos, p)
}

let n = 0
export const uid = (p = 'x') => `${p}-${Date.now().toString(36)}-${(n++).toString(36)}`
