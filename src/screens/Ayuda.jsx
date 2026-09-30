import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import Icono from '../components/Icono.jsx'
import { MarcaEnvio } from '../components/Marcas.jsx'
import Nota from '../components/Nota.jsx'

export default function Ayuda() {
  const { actualizarMeta } = useApp()

  const verIntroduccion = () => {
    actualizarMeta({ introVista: false })
    ir('/')
  }

  return (
    <div className="lienzo pila">
      <h1>Ayuda</h1>

      <div className="rejilla-2">
        <div className="tarjeta">
          <h3>¿Cómo se guarda mi trabajo?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icono n="Tablet" t={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Todo lo que escribe se guarda en la tableta al instante, con o sin Internet.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icono n="CloudUpload" t={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Los registros que faltan enviar salen en la barra de arriba.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <Icono n="CircleCheckBig" t={20} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>Cuando hay Internet se envían solos al Poder Judicial.</span>
            </div>
          </div>
        </div>

        <div className="tarjeta">
          <h3>¿Qué significa cada marca?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <MarcaEnvio envio="local" />
              <span>Está guardado en la tableta, falta enviarlo.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <MarcaEnvio envio="enviado" />
              <span>Ya llegó al Poder Judicial.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <MarcaEnvio envio="revisar" />
              <span>Hubo un problema al enviarlo. Ábralo para revisarlo.</span>
            </div>
          </div>
        </div>
      </div>

      <Nota id="55">
        <div className="tarjeta">
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Icono n="Smartphone" t={20} style={{ flexShrink: 0 }} />
            <h3 style={{ margin: 0, flex: 1 }}>Escribir hablando</h3>
          </div>
          <p style={{ margin: '0 0 8px 0' }}>En los campos largos puede hablar en vez de escribir: toque el micrófono del teclado de la tableta.</p>
          <span className="pista">Funciona sin Internet porque el teclado tiene el paquete de español descargado.</span>
        </div>
      </Nota>

      <div className="tarjeta">
        <h3>Volver a ver la introducción</h3>
        <button className="btn btn-1" onClick={verIntroduccion}>
          Ver la introducción
        </button>
      </div>
    </div>
  )
}
