import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import Icono from '../components/Icono.jsx'
import Ventana from '../components/Ventana.jsx'
import Campo from '../components/Campo.jsx'
import Nota from '../components/Nota.jsx'

export default function P00Pin() {
  const { meta, setDesbloqueado } = useApp()
  const [digitos, setDigitos] = useState('')
  const [error, setError] = useState('')
  const [abiertaOlvido, setAbiertaOlvido] = useState(false)
  const [codigoDesbloqueo, setCodigoDesbloqueo] = useState('')
  const [errorCodigo, setErrorCodigo] = useState('')

  const agregarDigito = (d) => {
    if (digitos.length < 4) {
      const nuevo = digitos + d
      setDigitos(nuevo)
      if (nuevo.length === 4) {
        validarPin(nuevo)
      }
    }
  }

  const validarPin = (pin) => {
    setError('')
    if (pin === meta.pin) {
      setDesbloqueado(true)
    } else {
      setDigitos('')
      setError('Ese PIN no es correcto. Intente de nuevo.')
    }
  }

  const borrarUltimo = () => {
    setDigitos(digitos.slice(0, -1))
    setError('')
  }

  const desbloquearCodigo = () => {
    if (codigoDesbloqueo.length === 6) {
      setAbiertaOlvido(false)
      setDesbloqueado(true)
    } else {
      setErrorCodigo('El código tiene 6 números.')
    }
  }

  return (
    <>
      <div className="centro">
        <div className="caja">
          <h1>Justicia Cercana</h1>
          <span className="pista">Juzgado de paz de Huayllay</span>
          <p>Escriba su PIN de 4 números.</p>

          <div className="puntos">
            <span className={`punto${digitos.length > 0 ? ' on' : ''}`}></span>
            <span className={`punto${digitos.length > 1 ? ' on' : ''}`}></span>
            <span className={`punto${digitos.length > 2 ? ' on' : ''}`}></span>
            <span className={`punto${digitos.length > 3 ? ' on' : ''}`}></span>
          </div>

          <Nota id="50">
            <div className="teclado">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} className="tecla" onClick={() => agregarDigito(String(n))}>
                  {n}
                </button>
              ))}
              <span />
              <button className="tecla" onClick={() => agregarDigito('0')}>
                0
              </button>
              <button className="tecla" onClick={borrarUltimo} aria-label="Borrar el último número">
                <Icono n="ArrowLeft" />
              </button>
            </div>
          </Nota>

          {error && (
            <span className="error">
              <Icono n="TriangleAlert" t={18} /> {error}
            </span>
          )}

          <Nota id="51">
            <div className="pista">
              <Icono n="WifiOff" t={16} /> Funciona sin Internet.
            </div>
          </Nota>

          <Nota id="52">
            <button className="btn btn-plano" onClick={() => setAbiertaOlvido(true)}>
              ¿Olvidó su PIN?
            </button>
          </Nota>
        </div>
      </div>

      {abiertaOlvido && (
        <Ventana
          titulo="¿Olvidó su PIN?"
          alCerrar={() => {
            setAbiertaOlvido(false)
            setErrorCodigo('')
            setCodigoDesbloqueo('')
          }}
          estrecha
          acciones={
            <>
              <button className="btn btn-plano" onClick={() => {
                setAbiertaOlvido(false)
                setErrorCodigo('')
                setCodigoDesbloqueo('')
              }}>
                Cerrar
              </button>
              <button className="btn btn-1" onClick={desbloquearCodigo}>
                Desbloquear
              </button>
            </>
          }
        >
          <p>Llame a la sede del Poder Judicial. Le darán un código para desbloquear la tableta.</p>
          <Campo etiqueta="Código de desbloqueo" error={errorCodigo}>
            {(id) => (
              <input
                id={id}
                type="text"
                inputMode="numeric"
                value={codigoDesbloqueo}
                onChange={(e) => {
                  setCodigoDesbloqueo(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setErrorCodigo('')
                }}
              />
            )}
          </Campo>
        </Ventana>
      )}
    </>
  )
}
