import { params } from './params.js'

export const HOY = params.today

const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']
const DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIA_C = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const aDate = (iso) => {
  const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d)
}

export const aISO = (fecha) => {
  const p = (n) => String(n).padStart(2, '0')
  return `${fecha.getFullYear()}-${p(fecha.getMonth() + 1)}-${p(fecha.getDate())}`
}

export const sumarDias = (iso, n) => {
  const f = aDate(iso)
  f.setDate(f.getDate() + n)
  return aISO(f)
}

export const dias = (a, b) => Math.round((aDate(b) - aDate(a)) / 86400000)

export const corto = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}` : '')
export const largo = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '')
export const nombreMes = (iso) => `${MES[Number(iso.slice(5, 7)) - 1]} de ${iso.slice(0, 4)}`
export const nombreDia = (iso) => DIA[aDate(iso).getDay()]
export const nombreDiaC = (iso) => DIA_C[aDate(iso).getDay()]

export const relativo = (iso) => {
  const d = dias(HOY, iso)
  if (d === 0) return 'hoy'
  if (d === 1) return 'mañana'
  if (d === -1) return 'ayer'
  if (d > 1) return `en ${d} días`
  return `hace ${-d} días`
}

export const conHora = (iso, hora) => (hora ? `${corto(iso)}, ${hora}` : corto(iso))

export const lunesDe = (iso) => {
  const f = aDate(iso)
  const g = f.getDay()
  f.setDate(f.getDate() - (g === 0 ? 6 : g - 1))
  return aISO(f)
}

export const semanaDe = (iso) => {
  const l = lunesDe(iso)
  return Array.from({ length: 7 }, (_, i) => sumarDias(l, i))
}

export const mesDe = (iso) => {
  const primero = `${iso.slice(0, 7)}-01`
  const inicio = lunesDe(primero)
  return Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i))
}

export const sello = (iso) => {
  if (!iso) return ''
  const f = iso.slice(0, 10)
  const h = iso.length > 10 ? iso.slice(11, 16) : ''
  return h ? `${corto(f)}, ${h}` : corto(f)
}

export const minutos = (hora) => {
  if (!hora) return null
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}
