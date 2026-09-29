import Icono from '../components/Icono.jsx'

export default function Orientacion() {
  return (
    <div className="centro">
      <div className="caja" style={{ alignItems: 'center', textAlign: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden="true">
          <rect x="34" y="12" width="52" height="86" rx="7" fill="none" stroke="#1b4f9c" strokeWidth="4" />
          <path d="M22 104 A48 48 0 0 1 22 62" fill="none" stroke="#8a5200" strokeWidth="4" strokeLinecap="round" />
          <path d="M16 70 l6 -8 8 6" fill="none" stroke="#8a5200" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1>Gire la tableta para usarla de lado</h1>
        <p>Esta aplicación se usa apoyada en la mesa, en posición horizontal.</p>
      </div>
    </div>
  )
}
