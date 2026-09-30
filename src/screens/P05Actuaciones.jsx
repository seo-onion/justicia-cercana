import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { ACTUACIONES, ESTADOS_ATENCION, COMUNIDADES, et } from '../lib/catalogos.js'
import { filtraTexto, enRango } from '../lib/reglas.js'
import Icono from '../components/Icono.jsx'
import Nota from '../components/Nota.jsx'
import Buscador from '../components/Buscador.jsx'
import { MarcaEnvio, MarcaEstadoAtencion, MarcaBorrador } from '../components/Marcas.jsx'

const nombreTipo = (a) => (a.tipo === 'otra' ? a.tipoOtro : et(ACTUACIONES, a.tipo))

export default function P05Actuaciones() {
  const { actuaciones } = useApp()
  const [texto, setTexto] = useState('')
  const [comunidad, setComunidad] = useState('')
  const [tipo, setTipo] = useState('')
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [soloBorradores, setSoloBorradores] = useState(false)

  const lista = actuaciones
    .filter((a) => filtraTexto(a, texto))
    .filter((a) => !comunidad || (a.personas || []).some((p) => p.comunidad === comunidad))
    .filter((a) => !tipo || a.tipo === tipo)
    .filter((a) => !estado || a.estadoAtencion === estado)
    .filter((a) => (!desde && !hasta) || enRango(a.fechaSolicitud, desde, hasta))
    .filter((a) => !soloBorradores || a.registro === 'borrador')
    .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))

  return (
    <div className="pila">
      <h1>Actuaciones</h1>
      <div className="acciones">
        <button className="btn btn-1" onClick={() => ir('/actuaciones/nueva')}>
          <Icono n="Plus" /> Nuevo trámite
        </button>
      </div>
      <Nota id="28">
        <Buscador
          texto={texto}
          alTexto={setTexto}
          etiquetaTexto="Buscar por nombre o DNI"
          grupos={[
            { etiqueta: 'Comunidad', valor: comunidad, alElegir: setComunidad, opciones: COMUNIDADES.map((c) => ({ id: c, etiqueta: c })) },
            { etiqueta: 'Tipo de trámite', valor: tipo, alElegir: setTipo, opciones: ACTUACIONES },
            { etiqueta: 'Estado de atención', valor: estado, alElegir: setEstado, opciones: ESTADOS_ATENCION }
          ]}
          desde={desde}
          hasta={hasta}
          alFecha={(d, h) => {
            setDesde(d)
            setHasta(h)
          }}
          soloBorradores={soloBorradores}
          alBorradores={setSoloBorradores}
        />
      </Nota>
      <p>{lista.length} {lista.length === 1 ? 'trámite' : 'trámites'}</p>
      {lista.length === 0 ? (
        <p className="vacio">No hay trámites con esos filtros.</p>
      ) : (
        <div className="lista">
          {lista.map((a, i) => {
            const sol = (a.personas || []).find((p) => p.rol === 'Solicitante') || (a.personas || [])[0]
            const marcas = (
              <span className="item-marcas">
                <MarcaEstadoAtencion estado={a.estadoAtencion} />
                <MarcaBorrador tipo="actuacion" registro={a} />
                <MarcaEnvio envio={a.envio} />
              </span>
            )
            return (
              <button key={a.id} className="item" onClick={() => ir(`/actuaciones/${a.id}`)}>
                <span className="codigo">{a.codigo}</span>
                <span className="pila-2 crece">
                  <span className="item-tit">{nombreTipo(a)}</span>
                  <span className="item-sub">{sol ? `${sol.nombre}, ${sol.comunidad}` : 'Sin solicitante'}</span>
                </span>
                {i === 0 ? <Nota id="29" etiqueta="span">{marcas}</Nota> : marcas}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
