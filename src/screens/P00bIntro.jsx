import { useState } from 'react'
import { useApp } from '../state/AppContext.jsx'
import { ir } from '../lib/rutas.js'
import Nota from '../components/Nota.jsx'

export default function P00bIntro({ alTerminar }) {
  const { actualizarMeta } = useApp()
  const [paso, setPaso] = useState(0)

  const terminar = () => {
    actualizarMeta({ introVista: true })
    alTerminar()
  }

  const saltar = () => {
    actualizarMeta({ introVista: true })
    ir('/')
  }

  const pasos_data = [
    {
      titulo: 'Registre casos, trámites y citas',
      texto: 'Todo en un solo lugar, como en su cuaderno.',
      ilustracion: (
        <svg width="160" height="160" viewBox="0 0 160 160">
          <rect x="30" y="20" width="100" height="120" stroke="#1b4f9c" strokeWidth="2" fill="none" rx="4" />
          <line x1="40" y1="50" x2="120" y2="50" stroke="#1b4f9c" strokeWidth="2" />
          <line x1="40" y1="80" x2="120" y2="80" stroke="#1b4f9c" strokeWidth="2" />
          <line x1="40" y1="110" x2="120" y2="110" stroke="#1b4f9c" strokeWidth="2" />
        </svg>
      )
    },
    {
      titulo: 'Funciona sin Internet',
      texto: 'Todo se guarda en la tableta apenas lo escribe.',
      ilustracion: (
        <svg width="160" height="160" viewBox="0 0 160 160">
          <rect x="30" y="40" width="100" height="80" stroke="#1b4f9c" strokeWidth="2" fill="none" rx="4" />
          <circle cx="80" cy="80" r="30" stroke="#1b4f9c" strokeWidth="2" fill="none" />
          <line x1="60" y1="60" x2="100" y2="100" stroke="#1b4f9c" strokeWidth="2" />
          <line x1="100" y1="60" x2="60" y2="100" stroke="#1b4f9c" strokeWidth="2" />
        </svg>
      )
    },
    {
      titulo: 'Cuando tenga Internet, toque Enviar ahora',
      texto: 'Sus registros llegan al Poder Judicial.',
      ilustracion: (
        <svg width="160" height="160" viewBox="0 0 160 160">
          <rect x="30" y="50" width="100" height="70" stroke="#1b4f9c" strokeWidth="2" fill="none" rx="4" />
          <line x1="80" y1="130" x2="80" y2="70" stroke="#1b4f9c" strokeWidth="2" />
          <polygon points="80,50 65,70 95,70" stroke="#1b4f9c" strokeWidth="2" fill="none" />
        </svg>
      )
    }
  ]

  const sig = () => {
    if (paso < 2) {
      setPaso(paso + 1)
    } else {
      terminar()
    }
  }

  return (
    <div className="centro">
      <div className="caja">
        {paso === 1 && (
          <Nota id="53">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {pasos_data[paso].ilustracion}
            </div>
            <h1>{pasos_data[paso].titulo}</h1>
          </Nota>
        )}
        {paso !== 1 && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {pasos_data[paso].ilustracion}
          </div>
        )}
        {paso !== 1 && <h1>{pasos_data[paso].titulo}</h1>}
        <p>{pasos_data[paso].texto}</p>

        <div className="puntos" style={{ marginBottom: 32 }}>
          <span className={`punto${paso === 0 ? ' on' : ''}`}></span>
          <span className={`punto${paso === 1 ? ' on' : ''}`}></span>
          <span className={`punto${paso === 2 ? ' on' : ''}`}></span>
        </div>

        <div className="acciones">
          <Nota id="54">
            <button className="btn btn-plano" onClick={saltar}>
              Saltar
            </button>
          </Nota>
          <button className="btn btn-1" onClick={sig}>
            {paso === 2 ? 'Empezar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
