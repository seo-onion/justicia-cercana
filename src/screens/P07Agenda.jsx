import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { HOY, largo, corto, sumarDias, semanaDe, mesDe, nombreMes, aDate, aISO } from '../lib/fechas.js'
import { filtraTexto } from '../lib/reglas.js'
import { CATEGORIAS, ESTADOS_ACTIVIDAD } from '../lib/catalogos.js'
import Icono from '../components/Icono.jsx'
import { Ops } from '../components/Campo.jsx'
import Ventana from '../components/Ventana.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Buscador from '../components/Buscador.jsx'
import { MarcaEnvio, MarcaEstadoActividad, MarcaCategoria, MarcaBorrador } from '../components/Marcas.jsx'

const VISTAS = [{ id: 'mes', etiqueta: 'Mes' }, { id: 'semana', etiqueta: 'Semana' }, { id: 'dia', etiqueta: 'Día' }]
const CAB = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const COLOR = { azul: 'var(--azul)', verde: 'var(--verde)', ambar: 'var(--ambar)', gris: 'var(--gris)' }
const RECORDATORIO = { no: 'Sin recordatorio', 'mismo-dia': 'Se avisa el mismo día', '1-dia': 'Se avisa 1 día antes' }
const catDe = (a) => CATEGORIAS.find((c) => c.id === a.categoria) || CATEGORIAS[3]
const porHora = (a, b) => (a.horaInicio || '99:99').localeCompare(b.horaInicio || '99:99')
const horaDe = (a) => a.horaInicio || 'Sin hora fija'

const mover = (vista, dia, n) => {
  if (vista === 'dia') return sumarDias(dia, n)
  if (vista === 'semana') return sumarDias(dia, 7 * n)
  const f = aDate(dia)
  f.setDate(1)
  f.setMonth(f.getMonth() + n)
  return aISO(f)
}

export default function P07Agenda() {
  const { actividades, casos, actuaciones } = useApp()
  const [vista, setVista] = useState('semana')
  const [dia, setDia] = useState(HOY)
  const [texto, setTexto] = useState('')
  const [categoria, setCategoria] = useState('')
  const [estado, setEstado] = useState('')
  const [soloBorradores, setSoloBorradores] = useState(false)
  const [selId, setSelId] = useState(null)

  const vinculado = (a) => a.vinculo && [...casos, ...actuaciones].find((r) => r.id === a.vinculo.id)
  const visibles = actividades.filter((a) => {
    if (categoria && a.categoria !== categoria) return false
    if (estado && a.estado !== estado) return false
    if (soloBorradores && a.registro !== 'borrador') return false
    if (!texto.trim()) return true
    const v = vinculado(a)
    return filtraTexto(a, texto) || (a.vinculo && filtraTexto({ codigo: a.vinculo.codigo }, texto)) || (v && filtraTexto({ personas: v.personas }, texto))
  })
  const delDia = (d) => visibles.filter((a) => a.fecha === d).sort(porHora)
  const manana = actividades.filter((a) => a.fecha === sumarDias(HOY, 1) && a.estado !== 'cancelada').sort(porHora)
  const sel = actividades.find((a) => a.id === selId)
  const unidad = { mes: 'Mes', semana: 'Semana', dia: 'Día' }[vista]
  const semana = semanaDe(dia)
  const rotulo = vista === 'mes' ? nombreMes(dia) : vista === 'semana' ? `Del ${corto(semana[0])} al ${corto(semana[6])}` : `${DIAS[aDate(dia).getDay()]} ${largo(dia)}`
  const abrirDia = (d) => { setDia(d); setVista('dia') }
  let primeraMarcada = false

  const irAlVinculo = () => ir(sel.vinculo.tipo === 'caso' ? `/casos/${sel.vinculo.id}` : `/actuaciones/${sel.vinculo.id}`)

  return (
    <div className="pila">
      <h1>Agenda</h1>

      {manana.length > 0 && (
        <Nota id="31">
          <Aviso tono="ambar" icono="CalendarClock" titulo={`Mañana: ${manana.length} ${manana.length === 1 ? 'actividad' : 'actividades'}`}>
            {manana.map((a) => <div key={a.id}>{horaDe(a)} · {a.titulo}</div>)}
          </Aviso>
        </Nota>
      )}

      <Buscador
        texto={texto} alTexto={setTexto} etiquetaTexto="Buscar por título, comunidad o persona"
        grupos={[
          { etiqueta: 'Categoría', valor: categoria, alElegir: setCategoria, opciones: CATEGORIAS },
          { etiqueta: 'Estado', valor: estado, alElegir: setEstado, opciones: ESTADOS_ACTIVIDAD }
        ]}
        soloBorradores={soloBorradores} alBorradores={setSoloBorradores}
      />

      <div className="fila-sep">
        <div className="fila">
          <Nota id="30"><Ops opciones={VISTAS} valor={vista} alElegir={setVista} /></Nota>
          <button className="btn" onClick={() => setDia(HOY)}>Hoy</button>
        </div>
        <b>{rotulo}</b>
        <div className="fila">
          <button className="btn" aria-label={`${unidad} anterior`} onClick={() => setDia(mover(vista, dia, -1))}><Icono n="ChevronLeft" /></button>
          <button className="btn" aria-label={`${unidad} siguiente`} onClick={() => setDia(mover(vista, dia, 1))}><Icono n="ChevronRight" /></button>
        </div>
      </div>

      {vista === 'mes' && (
        <Nota id="33">
          <div className="mes">
            {CAB.map((c) => <div key={c} className="mes-cab">{c}</div>)}
            {mesDe(dia).map((d) => {
              const l = delDia(d)
              return (
                <button key={d} className={`mes-dia${d.slice(0, 7) !== dia.slice(0, 7) ? ' fuera' : ''}${d === HOY ? ' hoy' : ''}`} onClick={() => abrirDia(d)}>
                  <b>{Number(d.slice(8))}</b>
                  {l.slice(0, 3).map((a) => (
                    <span key={a.id} className={`pildora dist-${catDe(a).color}`}>
                      <Icono n={catDe(a).icono} t={14} /> {a.titulo.length > 20 ? `${a.titulo.slice(0, 19)}…` : a.titulo}
                    </span>
                  ))}
                  {l.length > 3 && <span>+{l.length - 3} más</span>}
                </button>
              )
            })}
          </div>
        </Nota>
      )}

      {vista === 'semana' && (
        <div className="semana">
          {semana.map((d, i) => (
            <div key={d} className="semana-col">
              <div className={`semana-cab${d === HOY ? ' hoy' : ''}`}>{CAB[i]} {Number(d.slice(8))}</div>
              {delDia(d).map((a) => {
                const boton = (
                  <button key={a.id} className="act" style={{ borderLeftColor: COLOR[catDe(a).color] }} onClick={() => setSelId(a.id)}>
                    <span className="act-hora">{horaDe(a)}</span>
                    <span className="act-tit">{a.titulo}</span>
                    <MarcaCategoria categoria={a.categoria} />
                    <MarcaEstadoActividad estado={a.estado} />
                    <MarcaEnvio envio={a.envio} />
                  </button>
                )
                if (primeraMarcada) return boton
                primeraMarcada = true
                return <Nota key={a.id} id="32">{boton}</Nota>
              })}
            </div>
          ))}
        </div>
      )}

      {vista === 'dia' && (
        delDia(dia).length ? (
          <div className="lista">
            {delDia(dia).map((a) => (
              <button key={a.id} className="item" onClick={() => setSelId(a.id)}>
                <span className="item-tit">{horaDe(a)} · {a.titulo}</span>
                <span className="item-sub">{a.lugar}</span>
                <span className="item-marcas">
                  <MarcaCategoria categoria={a.categoria} />
                  <MarcaEstadoActividad estado={a.estado} />
                  <MarcaBorrador tipo="actividad" registro={a} />
                  <MarcaEnvio envio={a.envio} />
                </span>
              </button>
            ))}
          </div>
        ) : <p className="vacio">No hay actividades este día.</p>
      )}

      {sel && (
        <Ventana titulo={sel.titulo} alCerrar={() => setSelId(null)} acciones={
          <>
            <button className="btn" onClick={() => setSelId(null)}>Cerrar</button>
            <button className="btn btn-1" onClick={() => ir(`/agenda/${sel.id}`)}>Editar</button>
          </>
        }>
          <p>{largo(sel.fecha)} · {sel.horaInicio ? `${sel.horaInicio}${sel.horaFin ? ` a ${sel.horaFin}` : ''}` : 'Sin hora fija'}</p>
          <p>{sel.lugar}</p>
          {sel.descripcion && <p>{sel.descripcion}</p>}
          <div className="fila">
            <MarcaCategoria categoria={sel.categoria} />
            <MarcaEstadoActividad estado={sel.estado} />
            <MarcaEnvio envio={sel.envio} />
          </div>
          <p>{RECORDATORIO[sel.recordatorio] || RECORDATORIO.no}</p>
          {sel.vinculo && (
            <Nota id="34">
              <button className="btn btn-plano" onClick={irAlVinculo}>
                <Icono n="Link2" /> {sel.vinculo.tipo === 'caso' ? 'Creada desde el caso' : 'Vinculada al trámite'} {sel.vinculo.codigo}
              </button>
            </Nota>
          )}
        </Ventana>
      )}

      <div className="acciones">
        <button className="btn btn-1" onClick={() => ir('/agenda/nueva')}><Icono n="Plus" /> Nueva actividad</button>
      </div>
    </div>
  )
}
