import { useApp } from '../state/AppContext.jsx'
import Icono from './Icono.jsx'
import Nota from './Nota.jsx'
import { enlace, useRuta, ir } from '../lib/rutas.js'
import Ventana from './Ventana.jsx'
import { useState } from 'react'
import { Ops } from './Campo.jsx'

const OPCIONES = [
  { ruta: '/', icono: 'House', texto: 'Inicio' },
  { ruta: '/casos', icono: 'FileText', texto: 'Casos' },
  { ruta: '/actuaciones', icono: 'Stamp', texto: 'Actuaciones' },
  { ruta: '/agenda', icono: 'Calendar', texto: 'Agenda' }
]

const LETRAS = [
  { id: 'normal', etiqueta: 'Normal' },
  { id: 'large', etiqueta: 'Grande' },
  { id: 'xlarge', etiqueta: 'Muy grande' }
]

export default function Nav() {
  const { camino } = useRuta()
  const { meta, actualizarMeta, setDesbloqueado } = useApp()
  const [letra, setLetra] = useState(false)
  const actual = meta?.tamanoLetra || 'normal'

  const cambiar = (id) => {
    document.documentElement.dataset.font = id === 'normal' ? '' : id
    actualizarMeta({ tamanoLetra: id })
  }

  return (
    <nav className="nav" aria-label="Secciones">
      <Nota id="4">
        {OPCIONES.map((o) => (
          <a key={o.ruta} href={enlace(o.ruta)} aria-current={camino === o.ruta ? 'page' : undefined}>
            <Icono n={o.icono} t={24} /> {o.texto}
          </a>
        ))}
      </Nota>
      <div className="nav-esp" />
      <a href={enlace('/ayuda')} aria-current={camino === '/ayuda' ? 'page' : undefined}>
        <Icono n="CircleHelp" t={24} /> Ayuda
      </a>
      <button className="btn btn-plano" style={{ justifyContent: 'flex-start' }} onClick={() => setLetra(true)}>
        <Icono n="Type" t={24} /> Tamaño de letra
      </button>
      <button className="btn btn-plano" style={{ justifyContent: 'flex-start' }} onClick={() => { setDesbloqueado(false); ir('/') }}>
        <Icono n="Lock" t={24} /> Bloquear
      </button>

      {letra && (
        <Ventana título="Tamaño de letra" alCerrar={() => setLetra(false)} estrecha acciones={<button className="btn btn-1" onClick={() => setLetra(false)}>Listo</button>}>
          <Ops opciones={LETRAS} valor={actual} alElegir={cambiar} />
          <p className="pista">Se recuerda para las próximas veces que abra la aplicación.</p>
        </Ventana>
      )}
    </nav>
  )
}
