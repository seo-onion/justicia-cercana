import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { escribirServidor } from '../lib/db.js'
import { HOY, corto, sello } from '../lib/fechas.js'
import { filtraTexto } from '../lib/reglas.js'
import { ESTADOS_CASO, CONFLICTOS, ACTUACIONES, et } from '../lib/catalogos.js'
import { codigoCaso, uid } from '../lib/ids.js'
import Icono from '../components/Icono.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Ventana from '../components/Ventana.jsx'
import Campo, { Ops } from '../components/Campo.jsx'
import { MarcaEstadoCaso, MarcaEstadoAtencion, MarcaCategoria, MarcaEstadoActividad } from '../components/Marcas.jsx'

const SECCIONES = [
  { id: 'casos', etiqueta: 'Casos' },
  { id: 'actuaciones', etiqueta: 'Actuaciones' },
  { id: 'agenda', etiqueta: 'Agenda' }
]

const ahora = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${HOY}T${p(d.getHours())}:${p(d.getMinutes())}`
}

const partes = (r) => (r.personas || []).map((p) => p.nombre).join(', ') || '—'

export default function P10Computadora() {
  const { servidor } = useApp()
  const [datos, setDatos] = useState(servidor)
  const [seccion, setSeccion] = useState('casos')
  const [texto, setTexto] = useState('')
  const [editando, setEditando] = useState(null)
  const [estado, setEstado] = useState('tramite')
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    document.documentElement.dataset.modo = 'pc'
    return () => {
      delete document.documentElement.dataset.modo
    }
  }, [])

  useEffect(() => {
    setDatos(servidor)
  }, [servidor])

  const abrir = (caso) => {
    setEditando(caso)
    setEstado(caso.estado)
    setObservaciones(caso.observaciones || '')
  }

  const guardar = () => {
    const base = editando.id
      ? editando
      : {
          id: uid('c'),
          codigo: codigoCaso(datos.casos.map((c) => c.codigo)),
          fechaRegistro: HOY,
          tipoConflicto: CONFLICTOS[CONFLICTOS.length - 1].id,
          tipoConflictoOtro: '',
          descripcion: '',
          resultado: '',
          proximaFecha: '',
          personas: [],
          avances: [],
          creadoEn: ahora(),
          envio: 'enviado'
        }
    const nuevo = { ...base, estado, observaciones, actualizadoEn: ahora(), origen: 'computadora' }
    const casos = editando.id ? datos.casos.map((c) => (c.id === nuevo.id ? nuevo : c)) : [...datos.casos, nuevo]
    const copia = { ...datos, casos }
    setDatos(copia)
    escribirServidor(copia)
    setEditando(null)
  }

  const filtrar = (lista) => lista.filter((r) => filtraTexto(r, texto))
  const casos = filtrar(datos.casos)
  const actuaciones = filtrar(datos.actuaciones)
  const agenda = filtrar(datos.actividades).sort((a, b) => (a.fecha + a.horaInicio).localeCompare(b.fecha + b.horaInicio))

  return (
    <div className="pila">
      <header className="fila-sep">
        <div className="fila">
          <Icono n="Scale" t={28} />
          <h1>Poder Judicial · Registros del juzgado de paz de Huayllay</h1>
        </div>
        <div className="fila">
          <Icono n="Monitor" t={24} />
          <span>Computadora</span>
        </div>
      </header>

      <Nota id="47">
        <Aviso tono="azul" icono="Info">
          <p>La tableta envió datos por última vez el {sello(datos.ultimoEnvioTableta)}. Lo que registró después aún no aparece aquí.</p>
        </Aviso>
      </Nota>
      <p className="pista">Lo que se edita aquí puede chocar con lo que la jueza registró en la tableta. Al enviar, se resuelve solo.</p>

      <div className="fila-sep">
        <Ops opciones={SECCIONES} valor={seccion} alElegir={setSeccion} />
        <div className="fila">
          <input type="search" aria-label="Buscar" placeholder="Buscar" value={texto} onChange={(e) => setTexto(e.target.value)} />
          {seccion === 'casos' && (
            <button className="btn btn-1" onClick={() => abrir({ estado: 'tramite', observaciones: '' })}>
              <Icono n="Plus" />
              Nuevo caso
            </button>
          )}
        </div>
      </div>

      {seccion === 'casos' && (
        <Nota id="48">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código</th>
                <th>Partes</th>
                <th>Tipo de problema</th>
                <th>Estado</th>
                <th>Última actualización</th>
                <th><span className="sr">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {casos.map((c, i) => {
                const boton = (
                  <button className="btn" onClick={() => abrir(c)}>
                    <Icono n="Pencil" />
                    Editar
                  </button>
                )
                return (
                  <tr key={c.id}>
                    <td className="codigo">{c.codigo}</td>
                    <td>{partes(c)}</td>
                    <td>{et(CONFLICTOS, c.tipoConflicto)}</td>
                    <td><MarcaEstadoCaso estado={c.estado} /></td>
                    <td>{sello(c.actualizadoEn)}</td>
                    <td>{i === 0 ? <Nota id="49">{boton}</Nota> : boton}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Nota>
      )}

      {seccion === 'actuaciones' && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Trámite</th>
              <th>Solicitante</th>
              <th>Estado de atención</th>
              <th>Fecha de solicitud</th>
            </tr>
          </thead>
          <tbody>
            {actuaciones.map((a) => (
              <tr key={a.id}>
                <td className="codigo">{a.codigo}</td>
                <td>{et(ACTUACIONES, a.tipo)}</td>
                <td>{partes(a)}</td>
                <td><MarcaEstadoAtencion estado={a.estadoAtencion} /></td>
                <td>{corto(a.fechaSolicitud)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {seccion === 'agenda' && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Actividad</th>
              <th>Categoría</th>
              <th>Lugar</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {agenda.map((a) => (
              <tr key={a.id}>
                <td>{corto(a.fecha)}</td>
                <td>{a.sinHoraFija ? 'Sin hora fija' : a.horaInicio}</td>
                <td>{a.titulo}</td>
                <td><MarcaCategoria categoria={a.categoria} /></td>
                <td>{a.lugar}</td>
                <td><MarcaEstadoActividad estado={a.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editando && (
        <Ventana
          titulo="Editar el caso desde la computadora"
          alCerrar={() => setEditando(null)}
          acciones={
            <>
              <button className="btn" onClick={() => setEditando(null)}>Cancelar</button>
              <button className="btn btn-1" onClick={guardar}>Guardar cambios</button>
            </>
          }
        >
          {editando.codigo && <p className="codigo">{editando.codigo}</p>}
          <div className="pila">
            <b>Estado</b>
            <Ops opciones={ESTADOS_CASO} valor={estado} alElegir={setEstado} />
            <Campo etiqueta="Observaciones" opcional>
              {(id) => <textarea id={id} rows={4} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />}
            </Campo>
          </div>
        </Ventana>
      )}
    </div>
  )
}
