import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { HOY, corto } from '../lib/fechas.js'
import { CONFLICTOS, ESTADOS_CASO, ROLES_CASO, et } from '../lib/catalogos.js'
import { personasDe, textoFalta } from '../lib/reglas.js'
import { codigoCaso, uid } from '../lib/ids.js'
import Campo, { Grupo, Ops } from '../components/Campo.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Pasos from '../components/Pasos.jsx'
import Personas from '../components/Personas.jsx'
import Icono from '../components/Icono.jsx'

const TITULOS = ['El problema', 'Las personas', 'Próxima cita y guardar']

const deCaso = (c) => ({ ...c, proximaFecha: (c.proximaFecha || '').slice(0, 10), proximaHora: (c.proximaFecha || '').slice(11, 16) })

export default function P03CasoForm({ id }) {
  const { casos, actuaciones, meta, enLinea, guardar, actualizarMeta, avisar } = useApp()
  const [form, setForm] = useState(() => {
    const existente = id && casos.find((c) => c.id === id)
    if (existente) return deCaso(existente)
    if (meta.borrador?.tipo === 'caso') return meta.borrador.datos
    return {
      id: uid('c'),
      codigo: codigoCaso(casos.map((c) => c.codigo)),
      fechaRegistro: HOY,
      tipoConflicto: '',
      tipoConflictoOtro: '',
      descripcion: '',
      estado: 'tramite',
      resultado: '',
      observaciones: '',
      proximaFecha: '',
      proximaHora: '',
      personas: [],
      avances: []
    }
  })
  const [paso, setPaso] = useState(1)
  const [err, setErr] = useState({})
  const [autoguardado, setAutoguardado] = useState(false)
  const ultimo = useRef(form)
  ultimo.current = form
  const previo = useRef(enLinea)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    const t = setInterval(() => {
      const f = ultimo.current
      if (!(f.tipoConflicto || f.descripcion.trim() || f.observaciones.trim() || f.personas.length)) return
      actualizarMeta({
        borrador: {
          tipo: 'caso',
          id: f.id,
          ruta: '/casos/nuevo',
          datos: f,
          etiqueta: `${f.personas[0]?.nombre || 'Caso sin nombre'}, ${corto(f.fechaRegistro)}`,
          guardadoEn: HOY
        }
      })
      setAutoguardado(true)
    }, 3000)
    return () => clearInterval(t)
  }, [actualizarMeta])

  useEffect(() => {
    if (previo.current && !enLinea)
      avisar({ tono: 'gris', icono: 'WifiOff', titulo: 'Se perdió el Internet.', texto: 'Lo que escribe se sigue guardando en la tableta.' })
    previo.current = enLinea
  }, [enLinea, avisar])

  const validar = () => {
    const e = {}
    if (form.fechaRegistro > HOY) e.fechaRegistro = 'La fecha no puede ser posterior a hoy.'
    if (!form.tipoConflicto) e.tipoConflicto = 'Elija de qué trata el problema.'
    if (form.tipoConflicto === 'otro' && !form.tipoConflictoOtro.trim()) e.tipoConflictoOtro = 'Escriba de qué trata.'
    if (!form.descripcion.trim()) e.descripcion = 'Cuente brevemente qué pasó.'
    if (form.estado === 'concluido' && !form.resultado.trim()) e.resultado = 'Para cerrar el caso, escriba el acuerdo o resultado.'
    setErr(e)
    return !Object.keys(e).length
  }

  const siguiente = () => {
    if (paso === 1 && !validar()) return
    setPaso(paso + 1)
  }

  const guardarCaso = (destino) => {
    const { proximaHora, ...resto } = form
    const guardado = guardar('caso', { ...resto, proximaFecha: form.proximaFecha ? `${form.proximaFecha}${proximaHora ? `T${proximaHora}` : ''}` : '' })
    actualizarMeta({ borrador: null })
    if (form.proximaFecha) {
      guardar('actividad', {
        id: uid('t'),
        titulo: 'Audiencia',
        categoria: 'audiencia',
        fecha: form.proximaFecha,
        horaInicio: proximaHora,
        sinHoraFija: !proximaHora,
        horaFin: '',
        lugar: form.personas.find((p) => p.rol === 'Solicitante')?.comunidad || '',
        estado: 'programada',
        vinculo: { tipo: 'caso', id: guardado.id, codigo: guardado.codigo },
        recordatorio: '1-dia',
        creadaDesdeCaso: true
      })
    }
    avisar({ tono: 'azul', icono: 'Check', titulo: `Caso ${guardado.codigo} guardado en la tableta.`, texto: 'Se enviará cuando haya Internet.' })
    if (form.proximaFecha)
      avisar({ tono: 'azul', icono: 'Calendar', titulo: `También se agendó: Audiencia, ${corto(form.proximaFecha)}${proximaHora ? `, ${proximaHora}` : ''}` })
    ir(destino ?? `/casos/${guardado.id}`)
  }

  const falta = textoFalta('caso', form)
  const tipoTexto = form.tipoConflicto === 'otro' ? form.tipoConflictoOtro || 'Otro' : et(CONFLICTOS, form.tipoConflicto)

  return (
    <div className="pila">
      <div className="fila">
        <h1>{id ? 'Editar caso' : 'Nuevo caso'}</h1>
        {autoguardado && <span className="pista">Guardado automáticamente hace un momento</span>}
      </div>
      <Nota id="13">
        <Pasos paso={paso} titulos={TITULOS} alIr={(p) => (p > 1 && paso === 1 && !validar() ? null : setPaso(p))} />
      </Nota>

      {paso === 1 && (
        <div className="pila">
          <Nota id="12">
            <Campo etiqueta="Código del caso" pista="Se genera en la tableta y ya es definitivo.">
              {(i) => <input id={i} readOnly value={form.codigo} />}
            </Campo>
          </Nota>
          <Campo etiqueta="Fecha de registro" error={err.fechaRegistro}>
            {(i) => <input id={i} type="date" value={form.fechaRegistro} onChange={(e) => set('fechaRegistro', e.target.value)} />}
          </Campo>
          <Grupo etiqueta="¿De qué trata el problema?" error={err.tipoConflicto}>
            <Ops opciones={CONFLICTOS} valor={form.tipoConflicto} alElegir={(v) => set('tipoConflicto', v)} />
          </Grupo>
          {form.tipoConflicto === 'otro' && (
            <Campo etiqueta="¿De qué trata?" error={err.tipoConflictoOtro}>
              {(i) => <input id={i} value={form.tipoConflictoOtro} onChange={(e) => set('tipoConflictoOtro', e.target.value)} />}
            </Campo>
          )}
          <Campo etiqueta="¿Qué pasó?" ayuda="Puede hablar en vez de escribir: toque el micrófono del teclado." error={err.descripcion}>
            {(i) => <textarea id={i} rows={4} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} />}
          </Campo>
          <Grupo etiqueta="Estado del caso">
            <Ops opciones={ESTADOS_CASO} valor={form.estado} alElegir={(v) => set('estado', v)} />
          </Grupo>
          {form.estado === 'concluido' && (
            <Campo etiqueta="Acuerdo o resultado" cuando="Se pide cuando el caso está Concluido" error={err.resultado}>
              {(i) => <textarea id={i} rows={3} value={form.resultado} onChange={(e) => set('resultado', e.target.value)} />}
            </Campo>
          )}
          <Campo etiqueta="Observaciones" opcional>
            {(i) => <textarea id={i} rows={3} value={form.observaciones} onChange={(e) => set('observaciones', e.target.value)} />}
          </Campo>
        </div>
      )}

      {paso === 2 && (
        <div className="pila">
          <Personas
            personas={form.personas}
            alCambiar={(p) => set('personas', p)}
            roles={ROLES_CASO}
            etiquetaRol="Rol"
            banco={personasDe([...casos, ...actuaciones])}
            mensajeSinSolicitante="El caso necesita al menos una persona que lo solicite."
          />
          <p className="pista">Un conflicto suele tener dos personas: quien solicita y quien es invitado.</p>
        </div>
      )}

      {paso === 3 && (
        <div className="pila">
          <Campo etiqueta="Próxima fecha de atención" opcional cuando="Si la pone, se agenda sola en la Agenda.">
            {(i) => (
              <div className="fila">
                <input id={i} type="date" value={form.proximaFecha} onChange={(e) => set('proximaFecha', e.target.value)} style={{ width: 'auto' }} />
                <input type="time" aria-label="Hora" value={form.proximaHora} onChange={(e) => set('proximaHora', e.target.value)} style={{ width: 'auto' }} />
              </div>
            )}
          </Campo>
          <Nota id="14">
            <div className="tarjeta pila-2">
              <h2>Revise antes de guardar</h2>
              <p><b>Problema:</b> {tipoTexto || 'Sin elegir'}</p>
              <p><b>Qué pasó:</b> {form.descripcion || 'Sin contar'}</p>
              <p><b>Estado:</b> {et(ESTADOS_CASO, form.estado)}</p>
              <p><b>Personas:</b></p>
              {form.personas.length === 0 && <p>Sin personas registradas</p>}
              {form.personas.map((p) => (
                <p key={p.id}>{p.nombre}, {p.rol}, de {p.comunidad}</p>
              ))}
              <p><b>Próxima cita:</b> {form.proximaFecha ? `${corto(form.proximaFecha)}${form.proximaHora ? `, ${form.proximaHora}` : ''}` : 'Sin cita fijada'}</p>
            </div>
          </Nota>
          {falta && <Aviso tono="ambar" icono="Pencil" titulo="Se guardará como borrador.">{falta}</Aviso>}
        </div>
      )}

      <div className="acciones">
        {paso === 1 ? (
          <button className="btn" onClick={() => ir('/casos')}>Cancelar</button>
        ) : (
          <button className="btn" onClick={() => setPaso(paso - 1)}>Atrás</button>
        )}
        {paso < 3 && (
          paso === 1 ? (
            <Nota id="15" etiqueta="span">
              <button className="btn" onClick={() => guardarCaso('/casos')}>Guardar y salir</button>
            </Nota>
          ) : (
            <button className="btn" onClick={() => guardarCaso('/casos')}>Guardar y salir</button>
          )
        )}
        {paso < 3 ? (
          <button className="btn btn-1" onClick={siguiente}>Siguiente <Icono n="ArrowRight" /></button>
        ) : (
          <button className="btn btn-1" onClick={() => guardarCaso()}>Guardar caso</button>
        )}
      </div>
    </div>
  )
}
