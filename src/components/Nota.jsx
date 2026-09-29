import { params } from '../lib/params.js'

export default function Nota({ id, children, etiqueta = 'div' }) {
  if (!params.annotate) return <>{children}</>
  const E = etiqueta
  return (
    <E className="ancla">
      <span className="nota">{id}</span>
      {children}
    </E>
  )
}
