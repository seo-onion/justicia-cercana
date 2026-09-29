import { params } from './params.js'

const espera = (ms) => new Promise((r) => setTimeout(r, params.freeze ? 1e9 : ms))

export const LATENCIA = 420

const CAMPOS = {
  caso: [
    ['observaciones', 'Observaciones'],
    ['descripcion', 'Descripcion'],
    ['estado', 'Estado'],
    ['resultado', 'Resultado o acuerdo']
  ],
  actuacion: [
    ['observaciones', 'Observaciones'],
    ['resultado', 'Resultado'],
    ['estadoAtencion', 'Estado de atencion']
  ],
  actividad: [
    ['descripcion', 'Descripcion'],
    ['lugar', 'Lugar'],
    ['estado', 'Estado']
  ]
}

const fundir = (local, remoto, tipo) => {
  if (!remoto) return { registro: local, cambios: [] }
  const masNuevoRemoto = (remoto.actualizadoEn || '') > (local.actualizadoEn || '')
  const cambios = []
  const fusion = { ...local }
  for (const [campo, etiqueta] of CAMPOS[tipo]) {
    if (String(local[campo] || '') === String(remoto[campo] || '')) continue
    if (masNuevoRemoto) {
      cambios.push({
        campo,
        etiqueta,
        tomado: 'computadora',
        fecha: remoto.actualizadoEn,
        valorUsado: remoto[campo],
        valorDescartado: local[campo]
      })
      fusion[campo] = remoto[campo]
    } else {
      cambios.push({
        campo,
        etiqueta,
        tomado: 'tableta',
        fecha: local.actualizadoEn,
        valorUsado: local[campo],
        valorDescartado: remoto[campo]
      })
    }
  }
  if (cambios.length) fusion.actualizadoEn = masNuevoRemoto ? remoto.actualizadoEn : local.actualizadoEn
  return { registro: fusion, cambios }
}

export const enviar = async ({ pendientes, servidor, escenario = params.scenario, alAvanzar = () => {} }) => {
  const total = pendientes.length
  const resultados = []
  const conflictos = []
  let enviados = 0

  for (let i = 0; i < total; i++) {
    const p = pendientes[i]
    alAvanzar({ hechos: i, total, actual: p })
    await espera(LATENCIA)

    if (escenario === 'sync-error') {
      resultados.push({ ...p, estado: 'error' })
      continue
    }
    if (escenario === 'sync-partial' && i >= 2) {
      resultados.push({ ...p, estado: 'corte' })
      continue
    }

    const lista = servidor[p.tienda] || []
    const remoto = lista.find((r) => r.id === p.registro.id)
    const { registro, cambios } = escenario === 'conflict' ? fundir(p.registro, remoto, p.tipo) : { registro: p.registro, cambios: [] }
    if (cambios.length) conflictos.push({ codigo: p.registro.codigo || p.registro.titulo, tipo: p.tipo, id: p.registro.id, cambios })
    resultados.push({ ...p, estado: 'enviado', registro })
    enviados++
  }

  alAvanzar({ hechos: total, total, actual: null })

  const desenlace =
    escenario === 'sync-error' ? 'error' : escenario === 'sync-partial' ? 'parcial' : conflictos.length ? 'conflicto' : 'ok'

  return { desenlace, total, enviados, resultados, conflictos }
}
