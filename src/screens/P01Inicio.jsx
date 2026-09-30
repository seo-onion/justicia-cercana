import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir, enlace } from '../lib/rutas.js'
import { HOY, corto, relativo, sumarDias } from '../lib/fechas.js'
import { atencion, ordenCasos } from '../lib/reglas.js'
import { CATEGORIAS, et } from '../lib/catalogos.js'
import Icono from '../components/Icono.jsx'
import Aviso from '../components/Aviso.jsx'
import Ventana from '../components/Ventana.jsx'
import Nota from '../components/Nota.jsx'
import { MarcaCategoria, MarcaEstadoActividad, MarcaAtencion, MarcaEstadoCaso } from '../components/Marcas.jsx'

const NOMBRE_TIPO = { caso: 'caso', tramite: 'trámite', actividad: 'actividad' }
const hora = (a) => a.horaInicio || 'Sin hora fija'
const porHora = (a, b) => (a.horaInicio || '99').localeCompare(b.horaInicio || '99')
const porFecha = (a, b) => a.fecha.localeCompare(b.fecha) || porHora(a, b)

export default function P01Inicio() {
  const { casos, actividades, meta, enLinea, diasSinEnviar, recuerdaEnviar, actualizarMeta } = useApp()
  const [confirmando, setConfirmando] = useState(false)

  const vigentes = actividades.filter((a) => a.estado !== 'cancelada')
  const hoy = vigentes.filter((a) => a.fecha === HOY).sort(porHora)
  const manana = vigentes.filter((a) => a.fecha === sumarDias(HOY, 1)).sort(porHora)
  const proximas = vigentes
    .filter((a) => a.fecha > sumarDias(HOY, 1) && a.fecha <= sumarDias(HOY, 7))
    .sort(porFecha)
    .slice(0, 5)
  const urgentes = ordenCasos(casos).filter((c) => atencion(c))
  const nombres = (c) => (c.personas || []).map((p) => p.nombre).join(', ')

  return (
    <div className="pila">
      {recuerdaEnviar && (
        <Nota id="60">
          <Aviso
            tono="ambar"
            icono="CloudUpload"
            titulo={`Lleva ${diasSinEnviar} días sin enviar sus registros.`}
            acciones={enLinea && <button className="btn btn-1" onClick={() => ir('/envio?auto=1')}>Enviar ahora</button>}
          >
            <p>Si la tableta se pierde o se daña, lo no enviado se perdería. Envíelos cuando tenga Internet.</p>
          </Aviso>
        </Nota>
      )}

      {meta.borrador && (
        <Nota id="61">
          <Aviso
            tono="azul"
            icono="Pencil"
            titulo={`Tenía un ${NOMBRE_TIPO[meta.borrador.tipo]} sin terminar (${meta.borrador.etiqueta}). ¿Desea continuar?`}
            acciones={
              <>
                <button className="btn btn-1" onClick={() => ir(meta.borrador.ruta)}>Continuar</button>
                <button className="btn" onClick={() => setConfirmando(true)}>Descartar</button>
              </>
            }
          />
        </Nota>
      )}

      <Nota id="62">
        <div className="tarjeta">
          <h2>Hoy</h2>
          {hoy.length ? (
            <div className="lista">
              {hoy.map((a) => (
                <button key={a.id} className="item" onClick={() => ir('/agenda')}>
                  <span className="item-tit">{hora(a)} · {a.titulo}</span>
                  <span className="item-sub">{a.lugar}</span>
                  <span className="item-marcas">
                    <MarcaCategoria categoria={a.categoria} />
                    <MarcaEstadoActividad estado={a.estado} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="vacio">Hoy no tiene actividades.</p>
          )}
        </div>
      </Nota>

      <div className="rejilla-2">
        <div className="tarjeta">
          <h2>Casos que requieren atención</h2>
          {urgentes.length ? (
            <div className="lista">
              {urgentes.slice(0, 4).map((c, i) => {
                const fila = (
                  <button key={c.id} className="item" onClick={() => ir(`/casos/${c.id}`)}>
                    <span className="item-tit"><span className="codigo">{c.codigo}</span> · {nombres(c)}</span>
                    <span className="item-marcas">
                      <MarcaAtencion motivo={atencion(c).motivo} />
                      <MarcaEstadoCaso estado={c.estado} />
                    </span>
                  </button>
                )
                return i === 0 ? <Nota key={c.id} id="63">{fila}</Nota> : fila
              })}
              {urgentes.length > 4 && <a href={enlace('/casos')}>y {urgentes.length - 4} más</a>}
            </div>
          ) : (
            <p className="vacio">Ningún caso necesita atención.</p>
          )}
        </div>

        <Nota id="66">
          <div className="tarjeta">
            <h2>Próximos 7 días</h2>
            {manana.length > 0 && (
              <Nota id="64">
                <Aviso
                  tono="ambar"
                  icono="CalendarClock"
                  titulo={`Mañana ${hora(manana[0])} · ${et(CATEGORIAS, manana[0].categoria)} · ${manana[0].titulo}`}
                >
                  {manana.length > 1 && <p>y {manana.length - 1} más mañana</p>}
                </Aviso>
              </Nota>
            )}
            {proximas.length ? (
              <div className="lista">
                {proximas.map((a) => (
                  <button key={a.id} className="item" onClick={() => ir('/agenda')}>
                    <span className="item-tit">{relativo(a.fecha)} · {corto(a.fecha)} · {hora(a)} · {a.titulo}</span>
                    <span className="item-marcas"><MarcaCategoria categoria={a.categoria} /></span>
                  </button>
                ))}
              </div>
            ) : (
              !manana.length && <p className="vacio">No hay actividades en los próximos 7 días.</p>
            )}
          </div>
        </Nota>
      </div>

      <Nota id="65">
        <div className="rejilla-3">
          <button className="btn btn-gr" onClick={() => ir('/casos/nuevo')}><Icono n="Plus" /> Nuevo caso</button>
          <button className="btn btn-gr" onClick={() => ir('/actuaciones/nueva')}><Icono n="Plus" /> Nueva actuación</button>
          <button className="btn btn-gr" onClick={() => ir('/agenda/nueva')}><Icono n="Plus" /> Nueva actividad</button>
        </div>
      </Nota>

      {confirmando && (
        <Ventana
          titulo="¿Descartar lo que había escrito?"
          estrecha
          alCerrar={() => setConfirmando(false)}
          acciones={
            <>
              <button className="btn" onClick={() => setConfirmando(false)}>No, conservarlo</button>
              <button className="btn btn-peligro" onClick={() => { actualizarMeta({ borrador: null }); setConfirmando(false) }}>Sí, descartarlo</button>
            </>
          }
        >
          <p>Lo que escribió se borrará y no se puede recuperar.</p>
        </Ventana>
      )}
    </div>
  )
}
