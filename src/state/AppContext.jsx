import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { cargar, escribir, escribirMeta, escribirServidor } from '../lib/db.js'
import { params } from '../lib/params.js'
import { HOY, dias } from '../lib/fechas.js'
import { marcarRegistro } from '../lib/reglas.js'
import { enviar } from '../lib/api.js'
import { DIAS_SIN_ENVIAR } from '../lib/catalogos.js'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const TIENDA = { caso: 'casos', actuacion: 'actuaciones', actividad: 'actividades' }

const ahora = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${HOY}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function Proveedor({ children }) {
  const [listo, setListo] = useState(false)
  const [casos, setCasos] = useState([])
  const [actuaciones, setActuaciones] = useState([])
  const [actividades, setActividades] = useState([])
  const [meta, setMeta] = useState(null)
  const [servidor, setServidor] = useState({ casos: [], actuaciones: [], actividades: [], ultimoEnvioTableta: '' })
  const [enLinea, setEnLinea] = useState(params.net === 'offline' ? false : typeof navigator === 'undefined' ? true : navigator.onLine)
  const [avisos, setAvisos] = useState([])
  const [envio, setEnvio] = useState(null)
  const [bateria, setBateria] = useState(params.battery)
  const [desbloqueado, setDesbloqueado] = useState(params.pin === 'skip')
  const lanzado = useRef(false)

  useEffect(() => {
    cargar().then((d) => {
      setCasos(d.casos)
      setActuaciones(d.actuaciones)
      setActividades(d.actividades)
      setMeta(d.meta)
      setServidor(d.servidor || { casos: [], actuaciones: [], actividades: [], ultimoEnvioTableta: '' })
      document.documentElement.dataset.font = params.font || (d.meta?.tamanoLetra === 'normal' ? '' : d.meta?.tamanoLetra) || ''
      setListo(true)
    })
  }, [])

  useEffect(() => {
    if (params.net === 'offline') return
    const sube = () => setEnLinea(true)
    const baja = () => setEnLinea(false)
    window.addEventListener('online', sube)
    window.addEventListener('offline', baja)
    return () => {
      window.removeEventListener('online', sube)
      window.removeEventListener('offline', baja)
    }
  }, [])

  const avisar = useCallback((aviso) => {
    const id = Math.random().toString(36).slice(2)
    setAvisos((a) => [...a, { id, ...aviso }])
    if (!params.freeze && !aviso.fijo) setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 6000)
  }, [])

  const cerrarAviso = useCallback((id) => setAvisos((a) => a.filter((x) => x.id !== id)), [])

  const colecciones = { caso: [casos, setCasos], actuacion: [actuaciones, setActuaciones], actividad: [actividades, setActividades] }

  const guardar = useCallback(
    (tipo, registro) => {
      const [lista, poner] = colecciones[tipo]
      const sellado = marcarRegistro(tipo, { ...registro, envio: 'local', actualizadoEn: ahora(), creadoEn: registro.creadoEn || ahora() })
      const existe = lista.some((r) => r.id === sellado.id)
      const nueva = existe ? lista.map((r) => (r.id === sellado.id ? sellado : r)) : [...lista, sellado]
      poner(nueva)
      escribir(TIENDA[tipo], nueva)
      return sellado
    },
    [casos, actuaciones, actividades]
  )

  const actualizarMeta = useCallback(
    (parche) => {
      setMeta((m) => {
        const n = { ...m, ...parche }
        escribirMeta(n)
        return n
      })
    },
    []
  )

  const pendientes = useMemo(() => {
    const arma = (tipo, lista) =>
      lista.filter((r) => r.envio === 'local').map((r) => ({ tipo, tienda: TIENDA[tipo], registro: r }))
    return [...arma('caso', casos), ...arma('actuacion', actuaciones), ...arma('actividad', actividades)]
  }, [casos, actuaciones, actividades])

  const diasSinEnviar = meta?.ultimoEnvio ? dias(meta.ultimoEnvio.slice(0, 10), HOY) : 0
  const recuerdaEnviar = pendientes.length > 0 && diasSinEnviar >= DIAS_SIN_ENVIAR

  const enviarTodo = useCallback(
    async (escenario = params.scenario) => {
      if (!pendientes.length) return null
      setEnvio({ fase: 'enviando', hechos: 0, total: pendientes.length, actual: null, escenario })
      const r = await enviar({
        pendientes,
        servidor,
        escenario,
        alAvanzar: (p) => setEnvio((e) => ({ ...e, ...p }))
      })

      const porTipo = { caso: [...casos], actuacion: [...actuaciones], actividad: [...actividades] }
      const nuevoServidor = { ...servidor, casos: [...servidor.casos], actuaciones: [...servidor.actuaciones], actividades: [...servidor.actividades] }

      for (const res of r.resultados) {
        if (res.estado !== 'enviado') continue
        const lista = porTipo[res.tipo]
        const i = lista.findIndex((x) => x.id === res.registro.id)
        const guardado = { ...res.registro, envio: 'enviado' }
        if (i >= 0) lista[i] = guardado
        const sv = nuevoServidor[res.tienda]
        const j = sv.findIndex((x) => x.id === guardado.id)
        if (j >= 0) sv[j] = { ...guardado }
        else sv.push({ ...guardado })
      }

      if (r.desenlace === 'error') {
        for (const res of r.resultados) {
          const lista = porTipo[res.tipo]
          const i = lista.findIndex((x) => x.id === res.registro.id)
          if (i >= 0) lista[i] = { ...lista[i], envio: 'local' }
        }
      }

      setCasos(porTipo.caso)
      setActuaciones(porTipo.actuacion)
      setActividades(porTipo.actividad)
      escribir('casos', porTipo.caso)
      escribir('actuaciones', porTipo.actuacion)
      escribir('actividades', porTipo.actividad)
      setServidor(nuevoServidor)
      escribirServidor(nuevoServidor)
      if (r.enviados) actualizarMeta({ ultimoEnvio: ahora() })
      setEnvio({ fase: 'fin', ...r, escenario })
      return r
    },
    [pendientes, servidor, casos, actuaciones, actividades, actualizarMeta]
  )

  useEffect(() => {
    if (!listo || !enLinea || !pendientes.length || lanzado.current) return
    if (!location.hash.startsWith('#/envio')) return
    lanzado.current = true
    enviarTodo()
  }, [listo, enLinea, pendientes.length, enviarTodo])

  useEffect(() => {
    if (bateria === null || bateria > 20) return
    avisar({
      tono: bateria <= 10 ? 'ambar' : 'gris',
      grande: bateria <= 10,
      icono: 'BatteryLow',
      titulo: `Batería baja (${bateria} %).`,
      texto: 'Lo que registró ya está guardado en la tableta.',
      accion: enLinea && pendientes.length ? 'enviar' : null,
      fijo: true
    })
  }, [bateria, listo])

  const valor = {
    listo,
    casos,
    actuaciones,
    actividades,
    meta,
    servidor,
    enLinea,
    bateria,
    setBateria,
    desbloqueado,
    setDesbloqueado,
    guardar,
    actualizarMeta,
    pendientes,
    diasSinEnviar,
    recuerdaEnviar,
    envio,
    setEnvio,
    enviarTodo,
    avisos,
    avisar,
    cerrarAviso,
    marcarEnviadoLocal: () => {}
  }

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
