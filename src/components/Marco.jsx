import BarraEstado from './BarraEstado.jsx'
import Nav from './Nav.jsx'
import Aviso from './Aviso.jsx'
import Icono from './Icono.jsx'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'

export default function Marco({ children }) {
  const { avisos, cerrarAviso } = useApp()
  return (
    <div className="app">
      <BarraEstado />
      {avisos.length > 0 && (
        <div className="pila-2" style={{ padding: 'var(--e3) var(--e4) 0' }}>
          {avisos.map((a) => (
            <Aviso
              key={a.id}
              id={a.id}
              tono={a.tono || 'azul'}
              icono={a.icono}
              titulo={a.titulo}
              alCerrar={cerrarAviso}
              acciones={a.accion === 'enviar' ? <button className="btn btn-1" onClick={() => ir('/envio?auto=1')}><Icono n="Send" /> Enviar ahora</button> : null}
            >
              {a.texto && <p>{a.texto}</p>}
            </Aviso>
          ))}
        </div>
      )}
      <div className="marco">
        <Nav />
        <main className="lienzo">{children}</main>
      </div>
    </div>
  )
}
