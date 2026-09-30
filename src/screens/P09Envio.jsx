import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import { sello } from '../lib/fechas.js'
import Icono from '../components/Icono.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Ventana from '../components/Ventana.jsx'
import { Dist, MarcaEnvio } from '../components/Marcas.jsx'

const TIPO = { caso: 'Caso', actuacion: 'Trámite', actividad: 'Actividad' }
const nombre = (r) => r.codigo || r.titulo

const ESTADO = {
  enviado: { color: 'verde', icono: 'CircleCheckBig', texto: 'Enviado' },
  corte: { color: 'ambar', icono: 'Tablet', texto: 'En la tableta' },
  error: { color: 'ambar', icono: 'Tablet', texto: 'En la tableta' }
}

function Fila({ p, marca }) {
  return (
    <li className="item">
      <div className="crece">
        <div className="item-tit codigo">{nombre(p.registro)}</div>
        <div className="item-sub">{TIPO[p.tipo]}</div>
      </div>
      <div className="item-marcas">{marca}</div>
    </li>
  )
}

function Comparar({ conflicto, alCerrar }) {
  const { casos, actuaciones, actividades, guardar, avisar } = useApp()
  const lista = { caso: casos, actuacion: actuaciones, actividad: actividades }[conflicto.tipo]
  const [uso, setUso] = useState(() => Object.fromEntries(conflicto.cambios.map((c) => [c.campo, c.tomado])))

  const usar = (c, quien, valor) => {
    const registro = lista.find((r) => r.id === conflicto.id)
    if (!registro) return
    guardar(conflicto.tipo, { ...registro, [c.campo]: valor })
    setUso((u) => ({ ...u, [c.campo]: quien }))
    avisar({
      tono: 'azul',
      icono: 'Check',
      titulo: `Se volvió a la versión de la ${quien} en: ${c.etiqueta}.`,
      texto: 'Se enviará cuando haya Internet.'
    })
  }

  return (
    <Ventana titulo="Comparar los cambios" alCerrar={alCerrar} acciones={<button className="btn btn-1" onClick={alCerrar}>Cerrar</button>}>
      {conflicto.cambios.map((c) => {
        const versiones = {
          computadora: c.tomado === 'computadora' ? c.valorUsado : c.valorDescartado,
          tableta: c.tomado === 'tableta' ? c.valorUsado : c.valorDescartado
        }
        return (
          <Nota id="44" key={c.campo}>
            <div className="pila">
              <h3>{c.etiqueta}</h3>
              <div className="rejilla-2">
                {[['computadora', 'Versión de la computadora'], ['tableta', 'Versión de la tableta']].map(([quien, tit]) => (
                  <div className="tarjeta pila" key={quien}>
                    <b>{tit}</b>
                    {c.tomado === quien && <span className="item-sub">{sello(c.fecha)}</span>}
                    <p>{String(versiones[quien] || '') || '(vacío)'}</p>
                    {uso[c.campo] === quien ? (
                      <Dist color="verde" icono="Check">En uso</Dist>
                    ) : (
                      <button className="btn" onClick={() => usar(c, quien, versiones[quien])}>Usar esta</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Nota>
        )
      })}
      <p className="pista">La versión que no se usa queda guardada en el historial del registro.</p>
    </Ventana>
  )
}

export default function P09Envio() {
  const { envio, setEnvio, enviarTodo, pendientes, enLinea, meta } = useApp()
  const [comparando, setComparando] = useState(null)

  const volver = () => {
    setEnvio(null)
    ir('/')
  }

  const Volver = <button className="btn" onClick={volver}>Volver al inicio</button>

  let cuerpo
  if (!envio && pendientes.length) {
    cuerpo = (
      <>
        <Nota id="40">
          <div className="pila">
            <ul className="lista">
              {pendientes.map((p) => (
                <Fila key={p.registro.id} p={p} marca={<MarcaEnvio envio="local" />} />
              ))}
            </ul>
            {enLinea && (
              <div className="acciones">
                <button className="btn btn-1" onClick={() => enviarTodo()}>
                  <Icono n="Send" />
                  Enviar ahora
                </button>
              </div>
            )}
          </div>
        </Nota>
        {!enLinea && (
          <Nota id="46">
            <Aviso tono="gris" icono="WifiOff" titulo="Sin Internet.">
              <p>Se enviarán solos en cuanto haya Internet. Mientras tanto están seguros en la tableta.</p>
            </Aviso>
            <div className="acciones">
              <button className="btn btn-1" disabled>
                <Icono n="Send" />
                Enviar ahora
              </button>
            </div>
          </Nota>
        )}
      </>
    )
  } else if (!envio) {
    cuerpo = (
      <Aviso tono="verde" icono="CircleCheckBig" titulo="Todo enviado.">
        <p>No hay nada pendiente. Último envío: {sello(meta.ultimoEnvio)}.</p>
      </Aviso>
    )
  } else if (envio.fase === 'enviando') {
    const { hechos, total, actual } = envio
    const pct = total ? Math.round((hechos / total) * 100) : 0
    cuerpo = (
      <>
        <Nota id="41">
          <div className="pila">
            <h2>Enviando {Math.min(hechos + 1, total)} de {total}…</h2>
            <div className="progreso"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </Nota>
        <ul className="lista">
          {pendientes.map((p, i) => {
            const esActual = actual && actual.registro.id === p.registro.id
            const marca = i < hechos && !esActual
              ? <Dist color="verde" icono="CircleCheckBig">Enviado</Dist>
              : esActual
                ? <Dist color="azul" icono="CloudUpload">Enviando</Dist>
                : <Dist color="gris" icono="Clock">En espera</Dist>
            return <Fila key={p.registro.id} p={p} marca={marca} />
          })}
        </ul>
      </>
    )
  } else {
    const { desenlace, total, enviados, resultados, conflictos } = envio
    const reintentar = (
      <Nota id="45">
        <button className="btn btn-1" onClick={() => enviarTodo('sync-ok')}>
          <Icono n="RotateCw" />
          Reintentar
        </button>
      </Nota>
    )
    let aviso
    if (desenlace === 'parcial') {
      aviso = (
        <Aviso tono="ambar" icono="WifiOff" titulo={`Se enviaron ${enviados} de ${total}.`}>
          <p>Se cortó el Internet. Los otros {total - enviados} siguen seguros en la tableta.</p>
        </Aviso>
      )
    } else if (desenlace === 'error') {
      aviso = (
        <Aviso tono="rojo" icono="CircleX" titulo="El Poder Judicial no respondió.">
          <p>Sus {total} registros siguen seguros en la tableta. Intente más tarde.</p>
        </Aviso>
      )
    } else {
      aviso = (
        <Aviso tono="verde" icono="CircleCheckBig" titulo={`Se enviaron los ${total} registros.`}>
          <p>Todo está guardado en el Poder Judicial.</p>
        </Aviso>
      )
    }
    cuerpo = (
      <>
        <Nota id="42">{aviso}</Nota>
        {desenlace === 'conflicto' &&
          conflictos.map((c) => (
            <Nota id="43" key={c.id}>
              <Aviso
                tono="ambar"
                icono="TriangleAlert"
                titulo={`Se usó la versión de la computadora del ${sello(c.cambios[0].fecha)} en: ${c.cambios.map((x) => x.etiqueta).join(', ')}.`}
                acciones={<button className="btn" onClick={() => setComparando(c)}>Ver y cambiar</button>}
              >
                <p className="codigo">{c.codigo}</p>
              </Aviso>
            </Nota>
          ))}
        <ul className="lista">
          {resultados.map((r) => {
            const e = ESTADO[r.estado]
            return <Fila key={r.registro.id} p={r} marca={<Dist color={e.color} icono={e.icono}>{e.texto}</Dist>} />
          })}
        </ul>
        <div className="acciones">
          {Volver}
          {(desenlace === 'parcial' || desenlace === 'error') && reintentar}
        </div>
      </>
    )
  }

  return (
    <div className="pila">
      <h1>Enviar al Poder Judicial</h1>
      {cuerpo}
      {comparando && <Comparar conflicto={comparando} alCerrar={() => setComparando(null)} />}
    </div>
  )
}
