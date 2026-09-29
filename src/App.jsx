import { useEffect, useState } from 'react'
import { useApp } from './state/AppContext.jsx'
import { useRuta } from './lib/rutas.js'
import { params } from './lib/params.js'
import Marco from './components/Marco.jsx'
import Orientacion from './screens/Orientacion.jsx'
import P00Pin from './screens/P00Pin.jsx'
import P00bIntro from './screens/P00bIntro.jsx'
import P01Inicio from './screens/P01Inicio.jsx'
import P02Casos from './screens/P02Casos.jsx'
import P03CasoForm from './screens/P03CasoForm.jsx'
import P04CasoDetalle from './screens/P04CasoDetalle.jsx'
import P05Actuaciones from './screens/P05Actuaciones.jsx'
import P06ActuacionForm from './screens/P06ActuacionForm.jsx'
import P07Agenda from './screens/P07Agenda.jsx'
import P08ActividadForm from './screens/P08ActividadForm.jsx'
import P09Envio from './screens/P09Envio.jsx'
import P10Computadora from './screens/P10Computadora.jsx'
import Ayuda from './screens/Ayuda.jsx'

const INACTIVIDAD = 5 * 60 * 1000

function Pantalla() {
  const { partes } = useRuta()
  const [a, b, c] = partes

  if (a === 'casos') {
    if (!b) return <P02Casos />
    if (b === 'nuevo') return <P03CasoForm />
    if (c === 'editar') return <P03CasoForm id={b} />
    return <P04CasoDetalle id={b} />
  }
  if (a === 'actuaciones') {
    if (!b) return <P05Actuaciones />
    if (b === 'nueva') return <P06ActuacionForm />
    return <P06ActuacionForm id={b} />
  }
  if (a === 'agenda') {
    if (!b) return <P07Agenda />
    if (b === 'nueva') return <P08ActividadForm />
    return <P08ActividadForm id={b} />
  }
  if (a === 'envio') return <P09Envio />
  if (a === 'ayuda') return <Ayuda />
  return <P01Inicio />
}

export default function App() {
  const { listo, meta, desbloqueado, setDesbloqueado } = useApp()
  const { partes } = useRuta()
  const [vertical, setVertical] = useState(false)
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    const mide = () => setVertical(window.innerHeight > window.innerWidth)
    mide()
    window.addEventListener('resize', mide)
    return () => window.removeEventListener('resize', mide)
  }, [])

  useEffect(() => {
    if (!listo || !meta) return
    setIntro(params.intro === '1' || !meta.introVista)
  }, [listo, meta])

  useEffect(() => {
    if (!desbloqueado) return
    let t
    const reinicia = () => {
      clearTimeout(t)
      t = setTimeout(() => setDesbloqueado(false), INACTIVIDAD)
    }
    reinicia()
    for (const ev of ['pointerdown', 'keydown']) window.addEventListener(ev, reinicia)
    return () => {
      clearTimeout(t)
      for (const ev of ['pointerdown', 'keydown']) window.removeEventListener(ev, reinicia)
    }
  }, [desbloqueado, setDesbloqueado])

  if (!listo) return <div className="centro"><p>Abriendo la aplicación…</p></div>
  if (partes[0] === 'pc') return <P10Computadora />
  if (vertical) return <Orientacion />
  if (!desbloqueado) return <P00Pin />
  if (intro) return <P00bIntro alTerminar={() => setIntro(false)} />

  return (
    <Marco>
      <Pantalla />
    </Marco>
  )
}
