import { useId, useState } from 'react'
import Icono from './Icono.jsx'

export function Ayuda({ texto }) {
  const [abierta, setAbierta] = useState(false)
  return (
    <>
      <button type="button" className="btn btn-plano"  aria-label="Qué va aquí" aria-expanded={abierta} onClick={() => setAbierta((a) => !a)}>
        <Icono n="CircleHelp" t={20} />
      </button>
      {abierta && <span className="pista">{texto}</span>}
    </>
  )
}

export default function Campo({ etiqueta, opcional = false, cuando, ayuda, pista, error, children, id }) {
  const auto = useId()
  const cid = id || auto
  return (
    <div className="campo">
      <label className="campo-tit" htmlFor={cid}>
        {etiqueta} {opcional && <span className="opc">(opcional)</span>}
        {ayuda && <Ayuda texto={ayuda} />}
      </label>
      {cuando && <span className="cuando">{cuando}</span>}
      {typeof children === 'function' ? children(cid) : children}
      {pista && !error && <span className="pista">{pista}</span>}
      {error && (
        <span className="error" role="alert">
          <Icono n="TriangleAlert" t={18} /> {error}
        </span>
      )}
    </div>
  )
}

export function Grupo({ etiqueta, opcional = false, cuando, ayuda, error, children }) {
  return (
    <div className="campo" role="group">
      <span className="campo-tit">
        {etiqueta} {opcional && <span className="opc">(opcional)</span>}
        {ayuda && <Ayuda texto={ayuda} />}
      </span>
      {cuando && <span className="cuando">{cuando}</span>}
      {children}
      {error && (
        <span className="error" role="alert">
          <Icono n="TriangleAlert" t={18} /> {error}
        </span>
      )}
    </div>
  )
}

export function Ops({ opciones, valor, alElegir, columna = false }) {
  return (
    <div className="ops" style={columna ? { flexDirection: 'column', alignItems: 'stretch' } : undefined}>
      {opciones.map((o) => (
        <button key={o.id} type="button" className="op" aria-pressed={valor === o.id} onClick={() => alElegir(o.id)}>
          {o.icono && <Icono n={o.icono} />}
          {o.etiqueta}
        </button>
      ))}
    </div>
  )
}

export function Casilla({ etiqueta, valor, alCambiar }) {
  return (
    <label className="casilla">
      <input type="checkbox" checked={!!valor} onChange={(e) => alCambiar(e.target.checked)} />
      {etiqueta}
    </label>
  )
}
