import Icono from './Icono.jsx'
import { Casilla } from './Campo.jsx'
import Nota from './Nota.jsx'
import { COMUNIDADES } from '../lib/catalogos.js'

export default function Buscador({ texto, alTexto, etiquetaTexto = 'Buscar por nombre o DNI', grupos = [], soloBorradores, alBorradores, desde, hasta, alFecha }) {
  return (
    <div className="tarjeta pila">
      <Nota id="5" etiqueta="div">
        <div className="campo">
          <label className="campo-tit" htmlFor="buscar">{etiquetaTexto}</label>
          <div className="fila" style={{ gap: 'var(--e2)' }}>
            <Icono n="Search" t={24} />
            <input id="buscar" className="crece" type="search" value={texto} onChange={(e) => alTexto(e.target.value)} placeholder="Escriba un nombre, un DNI o un código" />
          </div>
        </div>
      </Nota>

      <Nota id="6" etiqueta="div">
        <div className="pila-2">
          {grupos.map((g) => (
            <div key={g.etiqueta} className="campo">
              <span className="campo-tit" style={{ fontSize: 'var(--t-sm)' }}>{g.etiqueta}</span>
              <div className="ops">
                {g.opciones.map((o) => (
                  <button key={o.id} type="button" className="op" aria-pressed={g.valor === o.id} onClick={() => g.alElegir(g.valor === o.id ? '' : o.id)} style={{ minHeight: 'var(--toque)' }}>
                    {o.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {alFecha && (
            <div className="campo">
              <span className="campo-tit" style={{ fontSize: 'var(--t-sm)' }}>Rango de fechas</span>
              <div className="fila">
                <input type="date" value={desde || ''} onChange={(e) => alFecha(e.target.value, hasta)} aria-label="Desde" style={{ width: 'auto' }} />
                <span>a</span>
                <input type="date" value={hasta || ''} onChange={(e) => alFecha(desde, e.target.value)} aria-label="Hasta" style={{ width: 'auto' }} />
                {(desde || hasta) && (
                  <button type="button" className="btn btn-plano" onClick={() => alFecha('', '')}>
                    <Icono n="X" /> Quitar fechas
                  </button>
                )}
              </div>
            </div>
          )}

          {alBorradores && <Casilla etiqueta="Mostrar solo borradores" valor={soloBorradores} alCambiar={alBorradores} />}
        </div>
      </Nota>
    </div>
  )
}

export const COMUNIDAD_OPS = COMUNIDADES.map((c) => ({ id: c, etiqueta: c }))
