import { useEffect } from 'react'
import Icono from './Icono.jsx'

export default function Ventana({ titulo, alCerrar, children, acciones, estrecha = false }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && alCerrar?.()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [alCerrar])

  return (
    <div className="telon" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className={`ventana${estrecha ? ' ventana-sm' : ''}`}>
        <div className="fila-sep">
          <h2>{titulo}</h2>
          {alCerrar && (
            <button className="btn btn-plano" onClick={alCerrar} aria-label="Cerrar">
              <Icono n="X" t={24} />
            </button>
          )}
        </div>
        {children}
        {acciones && <div className="acciones">{acciones}</div>}
      </div>
    </div>
  )
}
