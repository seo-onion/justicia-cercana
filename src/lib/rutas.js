import { useEffect, useState } from 'react'
import { con } from './params.js'

export const ir = (ruta) => {
  location.hash = `#${ruta}`
}

export const enlace = (ruta) => `${location.pathname}${con()}#${ruta}`

export const rutaActual = () => {
  const h = location.hash.replace(/^#/, '') || '/'
  const [camino, consulta] = h.split('?')
  const partes = camino.split('/').filter(Boolean)
  return { camino, partes, q: new URLSearchParams(consulta || '') }
}

export const useRuta = () => {
  const [r, setR] = useState(rutaActual())
  useEffect(() => {
    const f = () => setR(rutaActual())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])
  return r
}
