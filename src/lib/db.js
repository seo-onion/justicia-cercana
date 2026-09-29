import { openDB } from 'idb'
import { params } from './params.js'
import { semilla } from './semilla.js'

const NOMBRE = 'justicia-cercana'
const TIENDAS = ['casos', 'actuaciones', 'actividades', 'meta', 'servidor']

let bd = null

const abrir = () =>
  (bd ||= openDB(NOMBRE, 1, {
    upgrade(d) {
      for (const t of TIENDAS) if (!d.objectStoreNames.contains(t)) d.createObjectStore(t, { keyPath: 'id' })
    }
  }))

const sembrar = async (d, variante) => {
  const s = semilla(variante)
  const tx = d.transaction(TIENDAS, 'readwrite')
  for (const t of TIENDAS) tx.objectStore(t).clear()
  for (const c of s.casos) tx.objectStore('casos').put(c)
  for (const a of s.actuaciones) tx.objectStore('actuaciones').put(a)
  for (const t of s.actividades) tx.objectStore('actividades').put(t)
  tx.objectStore('meta').put(s.meta)
  tx.objectStore('servidor').put({ id: 'servidor', ...s.servidor })
  await tx.done
  return s
}

export const cargar = async () => {
  const d = await abrir()
  const meta = await d.get('meta', 'meta')
  if (params.reset || !meta || meta.variante !== params.seed) {
    const s = await sembrar(d, params.seed)
    return { casos: s.casos, actuaciones: s.actuaciones, actividades: s.actividades, meta: s.meta, servidor: s.servidor }
  }
  const [casos, actuaciones, actividades, servidor] = await Promise.all([
    d.getAll('casos'),
    d.getAll('actuaciones'),
    d.getAll('actividades'),
    d.get('servidor', 'servidor')
  ])
  return { casos, actuaciones, actividades, meta, servidor }
}

export const escribir = async (tienda, registros) => {
  const d = await abrir()
  const tx = d.transaction(tienda, 'readwrite')
  await tx.objectStore(tienda).clear()
  for (const r of registros) tx.objectStore(tienda).put(r)
  await tx.done
}

export const escribirMeta = async (meta) => {
  const d = await abrir()
  await d.put('meta', meta)
}

export const escribirServidor = async (servidor) => {
  const d = await abrir()
  await d.put('servidor', { id: 'servidor', ...servidor })
}
