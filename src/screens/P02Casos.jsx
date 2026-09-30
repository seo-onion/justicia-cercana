import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { CONFLICTOS, COMUNIDADES, ESTADOS_CASO, et } from '../lib/catalogos.js'
import { atencion, enRango, filtraTexto, ordenCasos } from '../lib/reglas.js'
import Buscador from '../components/Buscador.jsx'
import Icono from '../components/Icono.jsx'
import Nota from '../components/Nota.jsx'
import { MarcaAtencion, MarcaBorrador, MarcaEnvio, MarcaEstadoCaso } from '../components/Marcas.jsx'

export default function P02Casos() {
  const { casos } = useApp()
  const [texto, setTexto] = useState('')
  const [comunidad, setComunidad] = useState('')
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [borradores, setBorradores] = useState(false)

  const filtrados = casos.filter(
    (c) =>
      filtraTexto(c, texto) &&
      (!comunidad || c.personas.some((p) => p.comunidad === comunidad)) &&
      (!estado || c.estado === estado) &&
      (!desde && !hasta ? true : enRango(c.fechaRegistro, desde, hasta)) &&
      (!borradores || c.registro === 'borrador')
  )
  const lista = ordenCasos(filtrados)

  return (
    <div className="pila">
      <h1>Casos</h1>
      <Buscador
        texto={texto}
        alTexto={setTexto}
        grupos={[
          { etiqueta: 'Comunidad', valor: comunidad, alElegir: setComunidad, opciones: COMUNIDADES.map((c) => ({ id: c, etiqueta: c })) },
          { etiqueta: 'Estado', valor: estado, alElegir: setEstado, opciones: ESTADOS_CASO }
        ]}
        desde={desde}
        hasta={hasta}
        alFecha={(a, b) => {
          setDesde(a)
          setHasta(b)
        }}
        soloBorradores={borradores}
        alBorradores={setBorradores}
      />
      <p>{lista.length === 1 ? '1 caso' : `${lista.length} casos`}</p>
      {lista.length === 0 ? (
        <p className="vacio">No hay casos con esos filtros.</p>
      ) : (
        <Nota id="10">
          <div className="lista">
            {lista.map((c, i) => {
              const nombres = c.personas.map((p) => p.nombre).join(' y ')
              const at = atencion(c)
              const marca = <MarcaAtencion motivo={at?.motivo} />
              return (
                <button key={c.id} className="item" onClick={() => ir(`/casos/${c.id}`)}>
                  <span className="codigo">{c.codigo}</span>
                  <span className="item-tit">{nombres || 'Sin personas registradas'}</span>
                  <span className="item-sub">{et(CONFLICTOS, c.tipoConflicto)}</span>
                  <div className="item-marcas">
                    <MarcaEstadoCaso estado={c.estado} />
                    {i === lista.findIndex((x) => atencion(x)) && at ? <Nota id="11" etiqueta="span">{marca}</Nota> : marca}
                    <MarcaBorrador tipo="caso" registro={c} />
                    <MarcaEnvio envio={c.envio} />
                  </div>
                </button>
              )
            })}
          </div>
        </Nota>
      )}
      <div className="acciones">
        <button className="btn btn-1" onClick={() => ir('/casos/nuevo')}>
          <Icono n="Plus" /> Nuevo caso
        </button>
      </div>
    </div>
  )
}
