import { HOY, dias, aDate } from './fechas.js'
import { DIAS_SIN_AVANCE } from './catalogos.js'

const vacio = (v) => !v || !String(v).trim()

export const personaCompleta = (p, obligarRol = true) => {
  const falta = []
  const partes = String(p.nombre || '').trim().split(/\s+/)
  if (partes.length < 2) falta.push('nombre y apellido')
  if (vacio(p.comunidad)) falta.push('comunidad')
  if (p.tipoDoc && ['dni', 'ce', 'otro'].includes(p.tipoDoc) && vacio(p.numDoc)) falta.push('número de documento')
  if (p.tipoDoc === 'dni' && p.numDoc && String(p.numDoc).length !== 8) falta.push('DNI de 8 números')
  if (obligarRol && vacio(p.rol)) falta.push('rol')
  return falta
}

export const faltaCaso = (c) => {
  const f = []
  if (vacio(c.tipoConflicto)) f.push('tipo de problema')
  if (c.tipoConflicto === 'otro' && vacio(c.tipoConflictoOtro)) f.push('tipo de problema')
  if (vacio(c.descripcion)) f.push('descripción')
  if (vacio(c.estado)) f.push('estado')
  const sol = (c.personas || []).filter((p) => p.rol === 'Solicitante')
  if (!sol.length) f.push('personas')
  else if ((c.personas || []).some((p) => personaCompleta(p).length)) f.push('datos de personas')
  if (c.estado === 'concluido' && vacio(c.resultado)) f.push('acuerdo o resultado')
  return f
}

export const faltaActuacion = (a) => {
  const f = []
  if (vacio(a.fechaSolicitud)) f.push('fecha de solicitud')
  if (vacio(a.tipo)) f.push('tipo de trámite')
  if (a.tipo === 'otra' && vacio(a.tipoOtro)) f.push('tipo de trámite')
  if (vacio(a.descripcion)) f.push('descripción')
  if (vacio(a.estadoAtencion)) f.push('estado de atención')
  if (['atendida', 'concluida'].includes(a.estadoAtencion) && vacio(a.fechaAtencion)) f.push('fecha de atención')
  if (a.estadoAtencion === 'concluida' && vacio(a.resultado)) f.push('resultado')
  if (a.estadoAtencion === 'concluida' && vacio(a.fechaEntrega)) f.push('fecha de entrega')
  const sol = (a.personas || []).filter((p) => p.rol === 'Solicitante')
  if (!sol.length) f.push('personas')
  else if ((a.personas || []).some((p) => personaCompleta(p).length)) f.push('datos de personas')
  return f
}

export const faltaActividad = (a) => {
  const f = []
  if (vacio(a.titulo)) f.push('título')
  if (vacio(a.categoria)) f.push('categoría')
  if (vacio(a.fecha)) f.push('fecha')
  if (vacio(a.lugar)) f.push('lugar')
  if (vacio(a.estado)) f.push('estado')
  return f
}

export const FALTA = { caso: faltaCaso, actuacion: faltaActuacion, actividad: faltaActividad }

export const registroDe = (tipo, r) => (FALTA[tipo](r).length ? 'borrador' : 'completo')

export const marcarRegistro = (tipo, r) => ({ ...r, registro: registroDe(tipo, r) })

export const textoFalta = (tipo, r) => {
  const f = [...new Set(FALTA[tipo](r))]
  return f.length ? `Borrador · falta: ${f.join(', ')}` : ''
}

export const ultimoAvance = (c) =>
  (c.avances || []).map((a) => a.fecha).sort().slice(-1)[0] || c.fechaRegistro

export const atencion = (c, hoy = HOY) => {
  if (c.estado === 'concluido') return null
  const prox = c.proximaFecha ? c.proximaFecha.slice(0, 10) : null
  if (prox) {
    const d = dias(hoy, prox)
    if (d === 0) return { motivo: 'Cita hoy', orden: 1 }
    if (d < 0) {
      const ult = ultimoAvance(c)
      if (dias(prox, ult) <= 0) return { motivo: 'Cita vencida', orden: 0 }
    }
  }
  const sin = dias(ultimoAvance(c), hoy)
  if (sin >= DIAS_SIN_AVANCE) return { motivo: `${sin} días sin avance`, orden: 2 }
  return null
}

export const ordenCasos = (casos, hoy = HOY) =>
  [...casos].sort((a, b) => {
    const aa = atencion(a, hoy)
    const bb = atencion(b, hoy)
    const oa = aa ? aa.orden : 9
    const ob = bb ? bb.orden : 9
    if (oa !== ob) return oa - ob
    return (b.actualizadoEn || '').localeCompare(a.actualizadoEn || '')
  })

const normaliza = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const similar = (a, b) => {
  const x = new Set(normaliza(a).split(' ').filter((w) => w.length > 2))
  const y = normaliza(b).split(' ').filter((w) => w.length > 2)
  if (!x.size || !y.length) return false
  const comunes = y.filter((w) => x.has(w)).length
  return comunes >= 2
}

export const personasDe = (registros) =>
  registros.flatMap((r) =>
    (r.personas || []).map((p) => ({ ...p, origenCodigo: r.codigo, origenTipo: r.tipoConflicto ? 'caso' : 'actuacion' }))
  )

export const buscarParecida = (banco, nueva, excluirIds = []) => {
  const doc = String(nueva.numDoc || '').trim()
  for (const p of banco) {
    if (excluirIds.includes(p.id)) continue
    if (doc && String(p.numDoc || '').trim() === doc) return p
    if (!doc && similar(p.nombre, nueva.nombre) && normaliza(p.comunidad) === normaliza(nueva.comunidad)) return p
  }
  return null
}

export const actuacionParecida = (actuaciones, nueva) => {
  for (const a of actuaciones) {
    if (a.id === nueva.id) continue
    if (a.tipo !== nueva.tipo) continue
    if (Math.abs(dias(a.fechaSolicitud, nueva.fechaSolicitud)) > 7) continue
    const bancoA = a.personas || []
    const nuevaSol = (nueva.personas || [])[0]
    if (nuevaSol && buscarParecida(bancoA, nuevaSol)) return a
  }
  return null
}

export const cruceHorario = (actividades, act) =>
  actividades.find((o) => {
    if (o.id === act.id) return false
    if (o.fecha !== act.fecha) return false
    if (o.estado === 'cancelada') return false
    if (!o.horaInicio || !act.horaInicio) return false
    const a1 = o.horaInicio
    const a2 = o.horaFin || o.horaInicio
    const b1 = act.horaInicio
    const b2 = act.horaFin || act.horaInicio
    return b1 < a2 && a1 < b2
  })

export const filtraTexto = (r, texto) => {
  if (!texto || !texto.trim()) return true
  const t = normaliza(texto)
  const campos = [r.codigo, r.descripcion, r.titulo, r.lugar]
  const gente = (r.personas || []).flatMap((p) => [p.nombre, p.numDoc, p.comunidad])
  return [...campos, ...gente].some((c) => normaliza(c).includes(t))
}

export const enRango = (iso, desde, hasta) => {
  if (!iso) return false
  const f = iso.slice(0, 10)
  if (desde && f < desde) return false
  if (hasta && f > hasta) return false
  return true
}

export const esPasada = (iso) => aDate(iso) < aDate(HOY)
