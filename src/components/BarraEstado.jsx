import { useApp } from '../state/AppContext.jsx'
import Icono from './Icono.jsx'
import Nota from './Nota.jsx'
import { sello } from '../lib/fechas.js'
import { ir } from '../lib/rutas.js'

export default function BarraEstado() {
  const { enLinea, pendientes, meta } = useApp()
  const n = pendientes.length

  return (
    <div className="barra">
      <button className="barra-zona" onClick={() => ir('/envio')} aria-label="Ver el estado de los registros por enviar">
        <Nota id="1" etiqueta="span">
          <span className="marca">
            <Icono n={enLinea ? 'Wifi' : 'WifiOff'} t={22} color={enLinea ? 'var(--azul)' : 'var(--gris)'} />
            <strong style={{ color: enLinea ? 'var(--azul)' : 'var(--gris)' }}>
              {enLinea ? 'Con Internet' : 'Sin Internet'}
            </strong>
            {!enLinea && <span style={{ color: 'var(--gris)' }}>&middot; puede seguir trabajando</span>}
          </span>
        </Nota>
        <Nota id="2" etiqueta="span">
          <span className="marca">
            <Icono n={n ? 'CloudUpload' : 'CircleCheckBig'} t={22} color={n ? 'var(--ambar)' : 'var(--verde)'} />
            <strong style={{ color: n ? 'var(--ambar)' : 'var(--verde)' }}>
              {n ? `${n} ${n === 1 ? 'registro' : 'registros'} por enviar` : 'Todo enviado'}
            </strong>
          </span>
        </Nota>
        <span className="marca" style={{ color: 'var(--texto-2)' }}>
          <Icono n="Clock" t={20} />
          Último envío: {sello(meta?.ultimoEnvio) || 'nunca'}
        </span>
      </button>
      {n > 0 && enLinea && (
        <Nota id="3" etiqueta="span">
          <button className="btn btn-1" onClick={() => ir('/envio?auto=1')}>
            <Icono n="Send" /> Enviar ahora
          </button>
        </Nota>
      )}
    </div>
  )
}
