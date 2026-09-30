export const BASE = '/'

export type Pantalla = {
  id: string
  nombre: string
  url: string
  pc?: boolean
  vertical?: boolean
}

export const q = (extra: Record<string, string | number> = {}) => {
  const p = new URLSearchParams({ demo: '1', reset: '1', 'pin': 'skip', ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])) })
  return `?${p.toString()}`
}

export const PANTALLAS: Pantalla[] = [
  { id: 'P-00', nombre: 'Ingreso con PIN', url: `${q({})}`.replace('pin=skip', 'pin=pedir') },
  { id: 'P-00b', nombre: 'Introducción inicial', url: `${q({ intro: 1 })}` },
  { id: 'P-01', nombre: 'Inicio', url: `${q()}#/` },
  { id: 'P-02', nombre: 'Casos: lista y búsqueda', url: `${q()}#/casos` },
  { id: 'P-03', nombre: 'Caso: nuevo', url: `${q()}#/casos/nuevo` },
  { id: 'P-04', nombre: 'Caso: detalle', url: `${q()}#/casos/c-0010` },
  { id: 'P-05', nombre: 'Actuaciones: lista y búsqueda', url: `${q()}#/actuaciones` },
  { id: 'P-06', nombre: 'Actuación: nueva', url: `${q()}#/actuaciones/nueva` },
  { id: 'P-07', nombre: 'Agenda', url: `${q()}#/agenda` },
  { id: 'P-08', nombre: 'Actividad: nueva', url: `${q()}#/agenda/nueva` },
  { id: 'P-09', nombre: 'Envío al Poder Judicial', url: `${q({ seed: 'mixto' })}#/envio` },
  { id: 'P-10', nombre: 'Vista en computadora', url: `${q()}#/pc`, pc: true },
  { id: 'Ayuda', nombre: 'Ayuda', url: `${q()}#/ayuda` }
]
