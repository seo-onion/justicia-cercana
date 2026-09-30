import Icono from './Icono.jsx'

export default function Pasos({ paso, total = 3, titulos, alIr }) {
  return (
    <div className="pila-2">
      <div className="pasos">
        <span className="paso-n">Paso {paso} de {total}: {titulos[paso - 1]}</span>
        <span className="paso-barra"><i style={{ width: `${(paso / total) * 100}%` }} /></span>
      </div>
      <div className="fila">
        {titulos.map((t, i) => (
          <button key={t} type="button" className="btn btn-plano" style={{ fontSize: 'var(--t-sm)', color: i + 1 === paso ? 'var(--azul)' : 'var(--texto-2)', fontWeight: i + 1 === paso ? 700 : 400 }} onClick={() => alIr(i + 1)}>
            {i + 1 < paso && <Icono n="Check" t={16} />} {t}
          </button>
        ))}
      </div>
    </div>
  )
}
