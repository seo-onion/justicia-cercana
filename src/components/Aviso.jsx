import Icono from './Icono.jsx'

export default function Aviso({ tono = 'azul', icono, titulo, children, acciones, id, alCerrar }) {
  return (
    <div className={`aviso aviso-${tono}`} role="status">
      {icono && <Icono n={icono} t={24} />}
      <div className="crece">
        {titulo && <b>{titulo}</b>}
        {children}
        {acciones && <div className="fila">{acciones}</div>}
      </div>
      {alCerrar && (
        <button className="btn btn-plano" onClick={() => alCerrar(id)} aria-label="Cerrar aviso">
          <Icono n="X" />
        </button>
      )}
    </div>
  )
}
