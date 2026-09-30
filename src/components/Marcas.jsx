import Icono from './Icono.jsx'
import { ESTADOS_CASO, ESTADOS_ATENCION, ESTADOS_ACTIVIDAD, CATEGORIAS, et } from '../lib/catalogos.js'
import { textoFalta } from '../lib/reglas.js'

export function Dist({ color = 'gris', icono, children, tachado = false }) {
  return (
    <span className={`dist dist-${color}${tachado ? ' dist-tachado' : ''}`}>
      {icono && <Icono n={icono} t={16} />}
      {children}
    </span>
  )
}

const ENVIO = {
  local: { color: 'ambar', icono: 'Tablet', texto: 'En la tableta' },
  enviado: { color: 'verde', icono: 'CircleCheckBig', texto: 'Enviado' },
  revisar: { color: 'rojo', icono: 'TriangleAlert', texto: 'Revisar' }
}

export function MarcaEnvio({ envio = 'local' }) {
  const e = ENVIO[envio] || ENVIO.local
  return <Dist color={e.color} icono={e.icono}>{e.texto}</Dist>
}

const CASO = { tramite: 'gris', conciliacion: 'azul', concluido: 'verde' }

const ICONO_CASO = { tramite: 'Clock', conciliacion: 'Users', concluido: 'CircleCheckBig' }

export function MarcaEstadoCaso({ estado }) {
  return <Dist color={CASO[estado] || 'gris'} icono={ICONO_CASO[estado] || 'Clock'}>{et(ESTADOS_CASO, estado)}</Dist>
}

const ATENCION = { pendiente: 'gris', atendida: 'azul', concluida: 'verde' }

export function MarcaEstadoAtencion({ estado }) {
  return <Dist color={ATENCION[estado] || 'gris'} icono={estado === 'concluida' ? 'CircleCheckBig' : 'Clock'}>{et(ESTADOS_ATENCION, estado)}</Dist>
}

export function MarcaEstadoActividad({ estado }) {
  const e = ESTADOS_ACTIVIDAD.find((x) => x.id === estado) || ESTADOS_ACTIVIDAD[0]
  return <Dist color={e.color} icono={e.icono} tachado={estado === 'cancelada'}>{e.etiqueta}</Dist>
}

export function MarcaCategoria({ categoria }) {
  const c = CATEGORIAS.find((x) => x.id === categoria) || CATEGORIAS[3]
  return <Dist color={c.color} icono={c.icono}>{c.etiqueta}</Dist>
}

export function MarcaAtencion({ motivo }) {
  if (!motivo) return null
  const urgente = motivo === 'Cita vencida'
  return <Dist color={urgente ? 'rojo' : 'ambar'} icono={urgente ? 'TriangleAlert' : 'Clock'}>{motivo}</Dist>
}

export function MarcaBorrador({ tipo, registro }) {
  const t = textoFalta(tipo, registro)
  if (!t) return null
  return <Dist color="gris" icono="Pencil">{t}</Dist>
}
