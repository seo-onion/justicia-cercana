import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { HOY, corto, largo } from '../lib/fechas.js'
import { CONFLICTOS, DOCUMENTOS, ESTADOS_CASO, et } from '../lib/catalogos.js'
import { atencion } from '../lib/reglas.js'
import { uid } from '../lib/ids.js'
import Campo, { Grupo, Ops } from '../components/Campo.jsx'
import Icono from '../components/Icono.jsx'
import Nota from '../components/Nota.jsx'
import Ventana from '../components/Ventana.jsx'
import { Dist, MarcaAtencion, MarcaBorrador, MarcaEnvio, MarcaEstadoCaso } from '../components/Marcas.jsx'

const CAMPOS = [
  ['estado', 'Estado'],
  ['observaciones', 'Observaciones'],
  ['descripcion', 'Descripción']
]

const AVANCE = { fecha: HOY, queSeHizo: '', nuevoEstado: '', fecha2: '', hora2: '', resultado: '', evidencias: [], referencia: '' }

export default function P04CasoDetalle({ id }) {
  const { casos, guardar, avisar } = useApp()
  const caso = casos.find((c) => c.id === id)
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState({})
  const [ventana, setVentana] = useState(false)
  const [av, setAv] = useState(AVANCE)
  const [err, setErr] = useState({})

  if (!caso) return <p className="vacio">No se encontró el caso.</p>

  const valor = (k) => (k in borrador ? borrador[k] : caso[k])
  const cambiado = (k) => k in borrador && borrador[k] !== caso[k]
  const cambios = CAMPOS.filter(([k]) => cambiado(k))

  const crearActividad = (fecha, hora) => {
    guardar('actividad', {
      id: uid('t'),
      titulo: 'Audiencia',
      categoria: 'audiencia',
      fecha,
      horaInicio: hora,
      sinHoraFija: !hora,
      horaFin: '',
      lugar: caso.personas.find((p) => p.rol === 'Solicitante')?.comunidad || '',
      estado: 'programada',
      vinculo: { tipo: 'caso', id: caso.id, codigo: caso.codigo },
      recordatorio: '1-dia',
      creadaDesdeCaso: true
    })
  }

  const cerrarEdicion = () => {
    setEditando(false)
    setBorrador({})
  }

  const guardarCambios = () => {
    const n = cambios.length
    if (!n) return cerrarEdicion()
    guardar('caso', { ...caso, ...borrador })
    avisar({
      tono: 'azul',
      icono: 'Check',
      titulo: `${n === 1 ? 'Se guardó 1 cambio' : `Se guardaron ${n} cambios`} en la tableta: ${cambios.map(([, e]) => e).join(', ')}.`
    })
    cerrarEdicion()
  }

  const abrirAvance = () => {
    setAv(AVANCE)
    setErr({})
    setVentana(true)
  }

  const setA = (k, v) => setAv((a) => ({ ...a, [k]: v }))

  const guardarAvance = () => {
    const e = {}
    if (av.fecha > HOY) e.fecha = 'La fecha no puede ser posterior a hoy.'
    if (!av.queSeHizo.trim()) e.queSeHizo = 'Cuente qué se hizo hoy en el caso.'
    if (av.fecha2 && av.fecha2 < HOY) e.fecha2 = 'La próxima cita no puede ser en una fecha pasada.'
    if (av.nuevoEstado === 'concluido' && !av.resultado.trim()) e.resultado = 'Para cerrar el caso, escriba el acuerdo o resultado.'
    setErr(e)
    if (Object.keys(e).length) return
    const proxima = av.fecha2 ? `${av.fecha2}${av.hora2 ? `T${av.hora2}` : ''}` : ''
    const evidencias = [...av.evidencias, ...(av.referencia.trim() ? [{ tipo: 'fisica', valor: av.referencia.trim() }] : [])]
    guardar('caso', {
      ...caso,
      avances: [...(caso.avances || []), { id: uid('av'), fecha: av.fecha, queSeHizo: av.queSeHizo.trim(), nuevoEstado: av.nuevoEstado, proximaFecha: proxima, resultado: av.resultado.trim(), evidencias }],
      estado: av.nuevoEstado || caso.estado,
      resultado: av.nuevoEstado === 'concluido' ? av.resultado.trim() : caso.resultado,
      proximaFecha: proxima || caso.proximaFecha
    })
    if (av.fecha2) crearActividad(av.fecha2, av.hora2)
    avisar({ tono: 'azul', icono: 'Check', titulo: 'Avance guardado en la tableta.' })
    if (av.fecha2) avisar({ tono: 'azul', icono: 'Calendar', titulo: `También se agendó: Audiencia, ${corto(av.fecha2)}${av.hora2 ? `, ${av.hora2}` : ''}` })
    setVentana(false)
  }

  const marcado = (k, campo) =>
    cambiado(k) ? (
      <Nota id="17">
        {campo}
      </Nota>
    ) : (
      campo
    )

  const etiquetaMod = (k, texto) => (
    <>
      {texto} {cambiado(k) && <Dist color="azul" icono="Pencil">Modificado</Dist>}
    </>
  )

  const avances = [...(caso.avances || [])].sort((a, b) => a.fecha.localeCompare(b.fecha))
  const acciones = editando ? (
    <>
      <Nota id="18" etiqueta="span">
        <button className="btn" onClick={() => setBorrador({})}><Icono n="Undo2" /> Deshacer cambios</button>
      </Nota>
      <button className="btn" onClick={cerrarEdicion}>Cancelar</button>
      <button className="btn btn-1" onClick={guardarCambios}>Guardar cambios</button>
    </>
  ) : (
    <>
      <button className="btn" onClick={() => setEditando(true)}>Editar datos</button>
      <button className="btn btn-1" onClick={abrirAvance}>Registrar avance</button>
    </>
  )

  return (
    <div className="pila">
      <div className="pila-2">
        <h1>{caso.codigo}</h1>
        <div className="item-marcas">
          <MarcaEstadoCaso estado={caso.estado} />
          <MarcaAtencion motivo={atencion(caso)?.motivo} />
          <MarcaBorrador tipo="caso" registro={caso} />
          <MarcaEnvio envio={caso.envio} />
        </div>
      </div>

      <div className="rejilla-2">
        <div className="pila">
          <div className="tarjeta pila-2">
            <h2>El problema</h2>
            <p><b>Tipo:</b> {caso.tipoConflicto === 'otro' ? caso.tipoConflictoOtro || 'Otro' : et(CONFLICTOS, caso.tipoConflicto)}</p>
            {editando ? (
              <>
                {marcado('descripcion',
                  <Campo etiqueta={etiquetaMod('descripcion', 'Descripción')}>
                    {(i) => <textarea id={i} rows={4} className={cambiado('descripcion') ? 'modificado' : undefined} value={valor('descripcion')} onChange={(e) => setBorrador({ ...borrador, descripcion: e.target.value })} />}
                  </Campo>
                )}
                <Grupo etiqueta={etiquetaMod('estado', 'Estado')}>
                  <div className={cambiado('estado') ? 'modificado' : undefined}>
                    <Ops opciones={ESTADOS_CASO} valor={valor('estado')} alElegir={(v) => setBorrador({ ...borrador, estado: v })} />
                  </div>
                </Grupo>
                {marcado('observaciones',
                  <Campo etiqueta={etiquetaMod('observaciones', 'Observaciones')}>
                    {(i) => <textarea id={i} rows={3} className={cambiado('observaciones') ? 'modificado' : undefined} value={valor('observaciones')} onChange={(e) => setBorrador({ ...borrador, observaciones: e.target.value })} />}
                  </Campo>
                )}
              </>
            ) : (
              <>
                <p><b>Qué pasó:</b> {caso.descripcion}</p>
                <p><b>Fecha de registro:</b> {largo(caso.fechaRegistro)}</p>
                {caso.observaciones && <p><b>Observaciones:</b> {caso.observaciones}</p>}
              </>
            )}
            {editando && <p><b>Fecha de registro:</b> {largo(caso.fechaRegistro)}</p>}
          </div>
          <div className="tarjeta pila-2">
            <h2>Personas</h2>
            {caso.personas.length === 0 && <p className="vacio">Sin personas registradas</p>}
            {caso.personas.map((p) => (
              <div key={p.id} className="pila-2">
                <span className="item-tit">{p.nombre} · {p.rol}</span>
                <span className="item-sub">
                  {p.comunidad} · {p.tipoDoc && p.numDoc ? `${et(DOCUMENTOS, p.tipoDoc)} ${p.numDoc}` : 'Sin documento'} · {p.telefono || 'Sin teléfono'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pila">
          <div className="tarjeta pila-2">
            <h2>Historial de avances</h2>
            {avances.length === 0 && <p className="vacio">Todavía no hay avances.</p>}
            {avances.map((a) => (
              <div key={a.id} className="pila-2">
                <span className="item-tit">{largo(a.fecha)}</span>
                <p>{a.queSeHizo}</p>
                {a.nuevoEstado && <span className="item-sub">Nuevo estado: {et(ESTADOS_CASO, a.nuevoEstado)}</span>}
                {(a.evidencias || []).map((x, i) => (
                  <span key={i} className="item-sub"><Icono n={x.tipo === 'foto' ? 'Camera' : 'FileText'} t={16} /> {x.valor}</span>
                ))}
              </div>
            ))}
          </div>
          <div className="tarjeta pila-2">
            <h2>Próxima cita</h2>
            <p>{caso.proximaFecha ? `${largo(caso.proximaFecha.slice(0, 10))}${caso.proximaFecha.length > 10 ? `, ${caso.proximaFecha.slice(11, 16)}` : ''}` : 'Sin cita fijada'}</p>
          </div>
          {caso.estado === 'concluido' && (
            <div className="tarjeta pila-2">
              <h2>Acuerdo o resultado</h2>
              <p>{caso.resultado}</p>
            </div>
          )}
        </div>
      </div>

      <Nota id="16">
        <div className="acciones">{acciones}</div>
      </Nota>

      {ventana && (
        <Ventana
          titulo="Registrar avance"
          alCerrar={() => setVentana(false)}
          acciones={
            <>
              <button className="btn" onClick={() => setVentana(false)}>Cancelar</button>
              <button className="btn btn-1" onClick={guardarAvance}>Guardar avance</button>
            </>
          }
        >
          <div className="pila">
            <Campo etiqueta="Fecha del avance" error={err.fecha}>
              {(i) => <input id={i} type="date" value={av.fecha} onChange={(e) => setA('fecha', e.target.value)} />}
            </Campo>
            <Campo etiqueta="¿Qué se hizo hoy?" ayuda="Puede hablar en vez de escribir: toque el micrófono del teclado." error={err.queSeHizo}>
              {(i) => <textarea id={i} rows={3} value={av.queSeHizo} onChange={(e) => setA('queSeHizo', e.target.value)} />}
            </Campo>
            <Grupo etiqueta="Nuevo estado" opcional cuando="Si no elige ninguno, el caso mantiene su estado actual.">
              <Ops opciones={ESTADOS_CASO} valor={av.nuevoEstado} alElegir={(v) => setA('nuevoEstado', v)} />
            </Grupo>
            <Campo etiqueta="Próxima fecha de atención" opcional error={err.fecha2}>
              {(i) => (
                <div className="fila">
                  <input id={i} type="date" value={av.fecha2} onChange={(e) => setA('fecha2', e.target.value)} style={{ width: 'auto' }} />
                  <input type="time" aria-label="Hora" value={av.hora2} onChange={(e) => setA('hora2', e.target.value)} style={{ width: 'auto' }} />
                </div>
              )}
            </Campo>
            {av.nuevoEstado === 'concluido' && (
              <Nota id="19">
                <Campo etiqueta="Acuerdo o resultado" cuando="Se pide cuando el caso pasa a Concluido" error={err.resultado}>
                  {(i) => <textarea id={i} rows={3} value={av.resultado} onChange={(e) => setA('resultado', e.target.value)} />}
                </Campo>
              </Nota>
            )}
            <Grupo etiqueta="Evidencias" opcional>
              {av.evidencias.map((x, i) => (
                <span key={i} className="item-sub"><Icono n="Camera" t={16} /> {x.valor}</span>
              ))}
              <div className="fila">
                <button className="btn" onClick={() => setA('evidencias', [...av.evidencias, { tipo: 'foto', valor: 'Foto del acta (tomada con la tableta)' }])}>
                  <Icono n="Camera" /> Tomar foto
                </button>
              </div>
            </Grupo>
            <Campo etiqueta="Referencia al documento físico" opcional>
              {(i) => <input id={i} value={av.referencia} onChange={(e) => setA('referencia', e.target.value)} placeholder="Acta en cuaderno 3, folio 12" />}
            </Campo>
          </div>
        </Ventana>
      )}
    </div>
  )
}
