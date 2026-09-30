import { useEffect, useRef, useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { HOY, corto, minutos } from '../lib/fechas.js'
import { cruceHorario, filtraTexto, esPasada } from '../lib/reglas.js'
import { CATEGORIAS, ESTADOS_ACTIVIDAD, SUGERENCIAS_ACTIVIDAD, COMUNIDADES } from '../lib/catalogos.js'
import { uid } from '../lib/ids.js'
import Campo, { Grupo, Ops, Casilla } from '../components/Campo.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Icono from '../components/Icono.jsx'

const LUGARES = [...COMUNIDADES.map((c) => ({ id: c, etiqueta: c })), { id: 'otro', etiqueta: 'Otro lugar' }]
const RECORDATORIOS = [{ id: 'no', etiqueta: 'No' }, { id: 'mismo-dia', etiqueta: 'El mismo día' }, { id: '1-dia', etiqueta: '1 día antes' }]
const VACIA = { titulo: '', categoria: '', fecha: HOY, horaInicio: '', horaFin: '', sinHoraFija: false, lugar: '', descripcion: '', estado: 'programada', vinculo: null, recordatorio: '1-dia', creadaDesdeCaso: false }

export default function P08ActividadForm({ id }) {
  const { actividades, casos, actuaciones, guardar, actualizarMeta, avisar } = useApp()
  const [form, setForm] = useState(() => actividades.find((a) => a.id === id) || { ...VACIA, id: uid('ac') })
  const [otro, setOtro] = useState(() => !!form.lugar && !COMUNIDADES.includes(form.lugar))
  const [err, setErr] = useState({})
  const [busca, setBusca] = useState('')
  const [cruce, setCruce] = useState()
  const [oculto, setOculto] = useState(false)
  const ultimo = useRef(form)
  ultimo.current = form
  const poner = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    setCruce(cruceHorario(actividades, form))
    setOculto(false)
  }, [form.fecha, form.horaInicio, form.horaFin])

  useEffect(() => {
    const t = setInterval(() => {
      const f = ultimo.current
      if (f.titulo || f.lugar || f.descripcion) {
        actualizarMeta({ borrador: { tipo: 'actividad', id: f.id, ruta: '/agenda/nueva', datos: f, etiqueta: `${f.titulo}, ${corto(f.fecha)}`, guardadoEn: HOY } })
      }
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const sinHora = (v) => setForm((f) => ({ ...f, sinHoraFija: v, ...(v ? { horaInicio: '', horaFin: '' } : {}) }))
  const elegirLugar = (v) => {
    setOtro(v === 'otro')
    poner('lugar')(v === 'otro' ? '' : v)
  }

  const candidatos = [...casos.map((c) => ({ tipo: 'caso', ...c })), ...actuaciones.map((a) => ({ tipo: 'actuacion', ...a }))]
  const resultados = busca.trim() ? candidatos.filter((r) => r.codigo.toLowerCase().includes(busca.trim().toLowerCase()) || filtraTexto({ personas: r.personas }, busca)).slice(0, 5) : []

  const guardarActividad = () => {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Escriba un nombre para la actividad.'
    if (!form.categoria) e.categoria = 'Elija el tipo de actividad.'
    if (!form.fecha) e.fecha = 'Elija la fecha.'
    if (form.horaInicio && form.horaFin && minutos(form.horaFin) <= minutos(form.horaInicio)) e.horaFin = 'La hora de término debe ser después de la de inicio.'
    if (!form.lugar.trim()) e.lugar = 'Indique dónde será.'
    setErr(e)
    if (Object.keys(e).length) return
    const g = guardar('actividad', form)
    actualizarMeta({ borrador: null })
    avisar({ tono: 'azul', icono: 'Check', titulo: 'Actividad guardada en la tableta.', texto: `${g.titulo}, ${corto(g.fecha)}. Se enviará cuando haya Internet.` })
    ir('/agenda')
  }

  return (
    <div className="pila">
      <div className="fila-sep">
        <h1>{id ? 'Editar actividad' : 'Nueva actividad'}</h1>
        <span className="pista">Guardado automáticamente hace un momento</span>
      </div>

      <Campo etiqueta="¿Qué actividad es?" error={err.titulo}>
        {(cid) => (
          <>
            <input id={cid} value={form.titulo} onChange={(e) => poner('titulo')(e.target.value)} />
            <div className="ops">
              {SUGERENCIAS_ACTIVIDAD.map((s) => <button key={s} type="button" className="op" onClick={() => poner('titulo')(s)}>{s}</button>)}
            </div>
          </>
        )}
      </Campo>

      <Nota id="35">
        <Grupo etiqueta="Tipo de actividad" error={err.categoria}>
          <Ops opciones={CATEGORIAS} valor={form.categoria} alElegir={poner('categoria')} />
        </Grupo>
      </Nota>

      <Campo etiqueta="Fecha" error={err.fecha}>
        {(cid) => <input id={cid} type="date" value={form.fecha} onChange={(e) => poner('fecha')(e.target.value)} />}
      </Campo>
      {form.fecha && esPasada(form.fecha) && (
        <Nota id="38">
          <Aviso tono="ambar" icono="TriangleAlert">Está agendando en una fecha que ya pasó. ¿Es correcto?</Aviso>
        </Nota>
      )}

      <Campo etiqueta="Hora de inicio" opcional>
        {(cid) => (
          <>
            <input id={cid} type="time" value={form.horaInicio} disabled={form.sinHoraFija} onChange={(e) => poner('horaInicio')(e.target.value)} />
            <Casilla etiqueta="Sin hora fija" valor={form.sinHoraFija} alCambiar={sinHora} />
          </>
        )}
      </Campo>

      {form.horaInicio && (
        <Nota id="36">
          <Campo etiqueta="Hora de término" cuando="Se pide cuando puso una hora de inicio" error={err.horaFin}>
            {(cid) => <input id={cid} type="time" value={form.horaFin} onChange={(e) => poner('horaFin')(e.target.value)} />}
          </Campo>
        </Nota>
      )}

      {cruce && !oculto && (
        <Nota id="37">
          <Aviso tono="ambar" icono="Clock" titulo={`A esa hora ya tiene: ${cruce.titulo}.`} acciones={<button className="btn" onClick={() => setOculto(true)}>Agendar igual</button>}>
            {cruce.horaInicio}{cruce.horaFin ? ` a ${cruce.horaFin}` : ''} · {cruce.lugar}
          </Aviso>
        </Nota>
      )}

      <Grupo etiqueta="¿Dónde será?" error={err.lugar}>
        <Ops opciones={LUGARES} valor={otro ? 'otro' : form.lugar} alElegir={elegirLugar} />
        {otro && <input aria-label="Otro lugar" value={form.lugar} onChange={(e) => poner('lugar')(e.target.value)} />}
      </Grupo>

      <Campo etiqueta="Motivo" opcional ayuda="Puede hablar en vez de escribir: toque el micrófono del teclado.">
        {(cid) => <textarea id={cid} rows={3} value={form.descripcion} onChange={(e) => poner('descripcion')(e.target.value)} />}
      </Campo>

      <Grupo etiqueta="Estado">
        <Ops opciones={ESTADOS_ACTIVIDAD} valor={form.estado} alElegir={poner('estado')} />
      </Grupo>
      {form.estado === 'realizada' && form.fecha > HOY && (
        <Aviso tono="ambar" icono="TriangleAlert">Marcó como realizada una actividad que aún no ocurre. ¿Es correcto?</Aviso>
      )}

      <Campo etiqueta="Vincular a un caso o trámite" opcional>
        {(cid) =>
          form.vinculo ? (
            <div className="fila">
              <span><Icono n="Link2" /> {form.vinculo.codigo}</span>
              <button type="button" className="btn" onClick={() => poner('vinculo')(null)}>Quitar vínculo</button>
            </div>
          ) : (
            <>
              <input id={cid} type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Escriba un código o un nombre" />
              {resultados.length > 0 && (
                <div className="lista">
                  {resultados.map((r) => (
                    <button key={r.id} type="button" className="item" onClick={() => { poner('vinculo')({ tipo: r.tipo, id: r.id, codigo: r.codigo }); setBusca('') }}>
                      <span className="item-tit">{r.codigo}</span>
                      <span className="item-sub">{(r.personas || []).map((p) => p.nombre).join(', ')}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )
        }
      </Campo>

      <Nota id="39">
        <Grupo etiqueta="Recordatorio" opcional>
          <Ops opciones={RECORDATORIOS} valor={form.recordatorio} alElegir={poner('recordatorio')} />
        </Grupo>
      </Nota>

      <div className="acciones">
        <button className="btn" onClick={() => ir('/agenda')}>Cancelar</button>
        <button className="btn btn-1" onClick={guardarActividad}>Guardar actividad</button>
      </div>
    </div>
  )
}
