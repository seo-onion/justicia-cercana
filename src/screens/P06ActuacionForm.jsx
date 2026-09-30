import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { HOY, corto, largo } from '../lib/fechas.js'
import { ACTUACIONES, ACTUACIONES_VISIBLES, ESTADOS_ATENCION, ROLES_ACTUACION, et } from '../lib/catalogos.js'
import { codigoActuacion, uid } from '../lib/ids.js'
import { personasDe, actuacionParecida, textoFalta, registroDe } from '../lib/reglas.js'
import Icono from '../components/Icono.jsx'
import Campo, { Grupo, Ops } from '../components/Campo.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Personas from '../components/Personas.jsx'
import Pasos from '../components/Pasos.jsx'
import { Dist, MarcaBorrador, MarcaEstadoAtencion } from '../components/Marcas.jsx'

const TITULOS = ['¿Qué trámite?', 'Las personas', 'Resultado']

const nombreDe = (f) => ((f.personas || []).find((p) => p.rol === 'Solicitante') || (f.personas || [])[0] || {}).nombre || ''

export default function P06ActuacionForm({ id }) {
  const { casos, actuaciones, meta, guardar, actualizarMeta, avisar } = useApp()
  const [form, setForm] = useState(() => {
    const existente = id && actuaciones.find((a) => a.id === id)
    if (existente) return existente
    if (meta.borrador?.tipo === 'actuacion') return meta.borrador.datos
    return {
      id: uid('a'),
      codigo: codigoActuacion(actuaciones.map((a) => a.codigo)),
      fechaSolicitud: HOY,
      tipo: '',
      tipoOtro: '',
      descripcion: '',
      estadoAtencion: 'pendiente',
      fechaAtencion: '',
      resultado: '',
      fechaEntrega: '',
      observaciones: '',
      documentos: [],
      personas: []
    }
  })
  const [paso, setPaso] = useState(1)
  const [verTodo, setVerTodo] = useState(() => ACTUACIONES.findIndex((a) => a.id === form.tipo) >= ACTUACIONES_VISIBLES)
  const [ver, setVer] = useState(false)
  const [parecida, setParecida] = useState(null)
  const [descartada, setDescartada] = useState(null)
  const formRef = useRef(form)
  const cerrado = useRef(false)
  formRef.current = form

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const autoguardar = () => {
    const f = formRef.current
    if (cerrado.current || !(f.tipo || f.descripcion || f.personas.length)) return
    actualizarMeta({
      borrador: {
        tipo: 'actuacion',
        id: f.id,
        ruta: '/actuaciones/nueva',
        datos: f,
        etiqueta: `${nombreDe(f) || et(ACTUACIONES, f.tipo)}, ${corto(f.fechaSolicitud)}`,
        guardadoEn: HOY
      }
    })
  }

  useEffect(() => {
    const t = setInterval(autoguardar, 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    setParecida(actuacionParecida(actuaciones, form))
  }, [form.tipo, form.fechaSolicitud, form.personas])

  const atendida = ['atendida', 'concluida'].includes(form.estadoAtencion)
  const concluida = form.estadoAtencion === 'concluida'

  const err = {}
  if (form.fechaSolicitud > HOY) err.fechaSolicitud = 'La fecha de solicitud no puede ser posterior a hoy.'
  if (!form.tipo) err.tipo = 'Elija qué trámite le piden.'
  if (form.tipo === 'otra' && !form.tipoOtro.trim()) err.tipoOtro = 'Escriba qué trámite es.'
  if (!form.descripcion.trim()) err.descripcion = 'Cuente en pocas palabras qué necesita la persona.'
  if (atendida && form.fechaAtencion) {
    if (form.fechaAtencion < form.fechaSolicitud) err.fechaAtencion = 'La atención no puede ser antes de la solicitud.'
    else if (form.fechaAtencion > HOY) err.fechaAtencion = 'La fecha de atención no puede ser posterior a hoy.'
  }
  if (concluida && !form.resultado.trim()) err.resultado = 'Para concluir, escriba qué se entregó o qué constancia se emitió.'
  if (concluida && form.fechaEntrega && form.fechaAtencion && form.fechaEntrega < form.fechaAtencion) err.fechaEntrega = 'La entrega no puede ser antes de la atención.'
  if (atendida && !form.fechaAtencion) err.fechaAtencion = err.fechaAtencion || 'Escriba la fecha en que se atendió el trámite.'
  if (concluida && !form.fechaEntrega) err.fechaEntrega = err.fechaEntrega || 'Escriba la fecha en que se entregó.'
  const mostrar = (k) => (ver ? err[k] : ['fechaSolicitud'].includes(k) ? err[k] : undefined)

  const siguiente = () => {
    if (paso === 1) {
      setVer(true)
      if (err.fechaSolicitud || err.tipo || err.tipoOtro || err.descripcion) return
    }
    setPaso(paso + 1)
  }

  const grabar = () => {
    cerrado.current = true
    const g = guardar('actuacion', form)
    actualizarMeta({ borrador: null })
    avisar({ tono: 'azul', icono: 'Check', titulo: `Trámite ${g.codigo} guardado en la tableta.`, texto: 'Se enviará cuando haya Internet.' })
    ir('/actuaciones')
  }

  const guardarBorrador = () => {
    setVer(true)
    if (err.fechaSolicitud) return
    grabar()
  }

  const guardarTramite = () => {
    setVer(true)
    if (Object.keys(err).length) return
    grabar()
  }

  const referencia = (form.documentos.find((d) => d.tipo === 'fisica') || {}).valor || ''
  const ponerReferencia = (v) => set('documentos', [...form.documentos.filter((d) => d.tipo !== 'fisica'), ...(v ? [{ tipo: 'fisica', valor: v }] : [])])
  const tarjetas = verTodo ? ACTUACIONES : ACTUACIONES.slice(0, ACTUACIONES_VISIBLES)
  const completo = registroDe('actuacion', form) === 'completo'
  const falta = textoFalta('actuacion', form)

  return (
    <div className="pila" onBlur={autoguardar}>
      <div className="fila">
        <h1>{id ? 'Editar trámite' : 'Nuevo trámite'}</h1>
        <span className="pista">Guardado automáticamente hace un momento</span>
      </div>
      <Nota id="24">
        <div className="fila">
          <span>Estado del registro:</span>
          {completo ? <Dist color="verde" icono="CircleCheckBig">Completo</Dist> : <MarcaBorrador tipo="actuacion" registro={form} />}
          <span>Estado de atención:</span>
          <MarcaEstadoAtencion estado={form.estadoAtencion} />
        </div>
      </Nota>
      <Pasos paso={paso} titulos={TITULOS} alIr={setPaso} />

      {paso === 1 && (
        <div className="pila">
          <Campo etiqueta="Código" pista="Se genera en la tableta y ya es definitivo.">
            {(cid) => <input id={cid} type="text" value={form.codigo} readOnly />}
          </Campo>
          <Campo etiqueta="Fecha de solicitud" error={mostrar('fechaSolicitud')}>
            {(cid) => <input id={cid} type="date" value={form.fechaSolicitud} onChange={(e) => set('fechaSolicitud', e.target.value)} />}
          </Campo>
          <Grupo etiqueta="¿Qué trámite le piden?" error={mostrar('tipo')}>
            <Nota id="20">
              <div className="tarjetas-op">
                {tarjetas.map((a, i) => (
                  <button key={a.id} type="button" className="tarjeta-op" aria-pressed={form.tipo === a.id} onClick={() => set('tipo', a.id)}>
                    <b>{a.etiqueta}</b>
                    {a.legal && (i === 0 ? <Nota id="22" etiqueta="span"><span>{a.legal}</span></Nota> : <span>{a.legal}</span>)}
                  </button>
                ))}
              </div>
            </Nota>
            {!verTodo && (
              <Nota id="21">
                <button type="button" className="btn" onClick={() => setVerTodo(true)}>
                  <Icono n="Plus" /> Ver más trámites
                </button>
              </Nota>
            )}
          </Grupo>
          {form.tipo === 'otra' && (
            <Campo etiqueta="¿Qué trámite es?" error={mostrar('tipoOtro')}>
              {(cid) => <input id={cid} type="text" value={form.tipoOtro} onChange={(e) => set('tipoOtro', e.target.value)} />}
            </Campo>
          )}
          <Campo etiqueta="¿Qué necesita la persona?" ayuda="Puede hablar en vez de escribir: toque el micrófono del teclado." error={mostrar('descripcion')}>
            {(cid) => <textarea id={cid} rows={3} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />}
          </Campo>
        </div>
      )}

      {paso === 2 && (
        <div className="pila">
          <Personas
            personas={form.personas}
            alCambiar={(p) => set('personas', p)}
            roles={ROLES_ACTUACION}
            etiquetaRol="Participación"
            banco={personasDe([...casos, ...actuaciones])}
            mensajeSinSolicitante="El trámite necesita al menos una persona que lo solicite."
          />
          {parecida && descartada !== parecida.id && (
            <Nota id="26">
              <Aviso
                tono="ambar"
                icono="TriangleAlert"
                titulo="Ya hay un trámite parecido registrado."
                acciones={
                  <>
                    <button className="btn" onClick={() => ir(`/actuaciones/${parecida.id}`)}>Es el mismo: abrirlo</button>
                    <button className="btn" onClick={() => setDescartada(parecida.id)}>Es otro: continuar</button>
                  </>
                }
              >
                <p>{parecida.codigo} · {parecida.tipo === 'otra' ? parecida.tipoOtro : et(ACTUACIONES, parecida.tipo)} · {largo(parecida.fechaSolicitud)}</p>
              </Aviso>
            </Nota>
          )}
        </div>
      )}

      {paso === 3 && (
        <div className="pila">
          <Nota id="23">
            <div className="pila-2">
              <Grupo etiqueta="Estado de atención">
                <Ops opciones={ESTADOS_ATENCION} valor={form.estadoAtencion} alElegir={(v) => set('estadoAtencion', v)} />
              </Grupo>
              <span className="pista">{ESTADOS_ATENCION.map((e) => `${e.etiqueta} = ${e.ayuda}.`).join(' ')}</span>
            </div>
          </Nota>
          {atendida && (
            <Nota id="25">
              <Campo etiqueta="Fecha de atención" cuando="Se pide desde que el trámite está Atendida" error={mostrar('fechaAtencion')}>
                {(cid) => <input id={cid} type="date" value={form.fechaAtencion} onChange={(e) => set('fechaAtencion', e.target.value)} />}
              </Campo>
            </Nota>
          )}
          {concluida && (
            <>
              <Campo etiqueta="¿Qué se entregó?" cuando="Se pide cuando el trámite está Concluida" ayuda="Puede hablar en vez de escribir: toque el micrófono del teclado." error={mostrar('resultado')}>
                {(cid) => <textarea id={cid} rows={3} value={form.resultado} onChange={(e) => set('resultado', e.target.value)} />}
              </Campo>
              <Campo etiqueta="Fecha de entrega" cuando="Se pide cuando el trámite está Concluida" error={mostrar('fechaEntrega')}>
                {(cid) => <input id={cid} type="date" value={form.fechaEntrega} onChange={(e) => set('fechaEntrega', e.target.value)} />}
              </Campo>
            </>
          )}
          <Campo etiqueta="Observaciones" opcional>
            {(cid) => <textarea id={cid} rows={2} value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} />}
          </Campo>
          <Grupo etiqueta="Documentos" opcional>
            {form.documentos.filter((d) => d.tipo === 'foto').map((d, i) => (
              <span key={i} className="fila">
                <Icono n="Camera" /> {d.valor}
              </span>
            ))}
            <div>
              <button type="button" className="btn" onClick={() => set('documentos', [...form.documentos, { tipo: 'foto', valor: 'Foto del documento (tomada con la tableta)' }])}>
                <Icono n="Camera" /> Tomar foto
              </button>
            </div>
            <Campo etiqueta="Referencia al documento físico" opcional>
              {(cid) => <input id={cid} type="text" value={referencia} placeholder="Solicitud en cuaderno 4, folio 3" onChange={(e) => ponerReferencia(e.target.value)} />}
            </Campo>
          </Grupo>
          {falta && (
            <Aviso tono="ambar" icono="Pencil" titulo="Se guardará como borrador.">
              <p>{falta}</p>
            </Aviso>
          )}
        </div>
      )}

      <div className="acciones">
        {paso === 1 ? (
          <button className="btn" onClick={() => ir('/actuaciones')}>Cancelar</button>
        ) : (
          <button className="btn" onClick={() => setPaso(paso - 1)}>
            <Icono n="ArrowLeft" /> Atrás
          </button>
        )}
        {paso < 3 && (
          <Nota id="27" etiqueta="span">
            <button className="btn" onClick={guardarBorrador}>Guardar como borrador</button>
          </Nota>
        )}
        {paso < 3 ? (
          <button className="btn btn-1" onClick={siguiente}>
            Siguiente <Icono n="ArrowRight" />
          </button>
        ) : (
          <button className="btn btn-1" onClick={guardarTramite}>
            <Icono n="Save" /> Guardar trámite
          </button>
        )}
      </div>
    </div>
  )
}
