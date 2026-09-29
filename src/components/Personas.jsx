import { useState } from 'react'
import Campo, { Grupo, Ops, Casilla } from './Campo.jsx'
import Icono from './Icono.jsx'
import Ventana from './Ventana.jsx'
import Nota from './Nota.jsx'
import { COMUNIDADES, DOCUMENTOS } from '../lib/catalogos.js'
import { buscarParecida } from '../lib/reglas.js'
import { uid } from '../lib/ids.js'

const vacia = (roles) => ({ id: '', nombre: '', tipoDoc: '', numDoc: '', telefono: '', sinTelefono: false, comunidad: '', otraComunidad: '', direccion: '', rol: roles[0] === 'Solicitante' ? '' : '' })

const pideDoc = (t) => ['dni', 'ce', 'otro'].includes(t)

export default function Personas({ personas, alCambiar, roles, etiquetaRol = 'Rol', banco = [], mensajeSinSolicitante }) {
  const [edicion, setEdicion] = useState(null)
  const [errores, setErrores] = useState({})
  const [parecida, setParecida] = useState(null)

  const abrir = (p = null) => {
    setErrores({})
    setEdicion(p ? { ...p, otraComunidad: COMUNIDADES.includes(p.comunidad) ? '' : p.comunidad } : vacia(roles))
  }

  const set = (k, v) => setEdicion((e) => ({ ...e, [k]: v }))

  const comunidadFinal = (e) => (e.comunidad === 'Otra' ? e.otraComunidad : e.comunidad)

  const validar = (e) => {
    const x = {}
    if (String(e.nombre || '').trim().split(/\s+/).length < 2) x.nombre = 'Escriba el nombre y al menos un apellido.'
    if (pideDoc(e.tipoDoc) && e.tipoDoc === 'dni' && String(e.numDoc).length !== 8)
      x.numDoc = "El DNI tiene 8 números. Revíselo o elija 'No lo tiene a la mano'."
    if (pideDoc(e.tipoDoc) && e.tipoDoc !== 'dni' && !String(e.numDoc).trim()) x.numDoc = 'Escriba el número del documento.'
    if (!e.sinTelefono && e.telefono && String(e.telefono).length !== 9) x.telefono = 'El celular tiene 9 números.'
    if (!comunidadFinal(e)) x.comunidad = 'Indique la comunidad donde vive.'
    if (!e.rol) x.rol = `Elija ${etiquetaRol === 'Rol' ? 'qué papel tiene esta persona en el caso' : 'cómo participa esta persona en el trámite'}.`
    return x
  }

  const confirmar = (e, saltarDuplicado = false) => {
    const persona = { ...e, comunidad: comunidadFinal(e), id: e.id || uid('p') }
    delete persona.otraComunidad
    if (!saltarDuplicado) {
      const excluir = personas.map((p) => p.id)
      const hallada = buscarParecida(banco, persona, excluir)
      if (hallada && hallada.id !== persona.id) {
        setParecida({ hallada, persona })
        return
      }
    }
    const existe = personas.some((p) => p.id === persona.id)
    alCambiar(existe ? personas.map((p) => (p.id === persona.id ? persona : p)) : [...personas, persona])
    setEdicion(null)
    setParecida(null)
  }

  const guardar = () => {
    const x = validar(edicion)
    setErrores(x)
    if (Object.keys(x).length) return
    confirmar(edicion)
  }

  const usarDatos = () => {
    const { hallada, persona } = parecida
    confirmar({ ...persona, nombre: hallada.nombre, tipoDoc: hallada.tipoDoc, numDoc: hallada.numDoc, telefono: hallada.telefono, sinTelefono: hallada.sinTelefono, comunidad: hallada.comunidad, otraComunidad: '', direccion: hallada.direccion || persona.direccion }, true)
  }

  const quitar = (id) => alCambiar(personas.filter((p) => p.id !== id))

  const sinSolicitante = !personas.some((p) => p.rol === 'Solicitante')

  return (
    <div className="pila">
      {personas.length === 0 && <p className="vacio">Todavía no agregó personas.</p>}
      {personas.map((p, i) => (
        <div key={p.id} className="tarjeta">
          <div className="fila-sep">
            <div className="pila-2">
              <span className="item-tit">{i + 1}. {p.nombre}</span>
              <span className="item-sub">
                {p.rol} &middot; {p.comunidad}
                {p.tipoDoc === 'dni' && p.numDoc ? ` · DNI ${p.numDoc}` : ''}
                {p.tipoDoc === 'no-mano' ? ' · No lo tiene a la mano' : ''}
                {p.tipoDoc === 'no-tiene' ? ' · No tiene documento' : ''}
                {p.telefono ? ` · ${p.telefono}` : ''}
              </span>
            </div>
            <div className="fila">
              <button type="button" className="btn" onClick={() => abrir(p)}>
                <Icono n="Pencil" /> Editar
              </button>
              <button type="button" className="btn btn-peligro" onClick={() => quitar(p.id)} aria-label={`Quitar a ${p.nombre}`}>
                <Icono n="Trash2" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {sinSolicitante && personas.length > 0 && (
        <span className="error" role="alert">
          <Icono n="TriangleAlert" t={18} /> {mensajeSinSolicitante}
        </span>
      )}

      <Nota id="8" etiqueta="div">
        <button type="button" className="btn" onClick={() => abrir()}>
          <Icono n="Plus" /> Agregar persona
        </button>
      </Nota>

      {edicion && (
        <Ventana
          titulo={edicion.id ? 'Datos de la persona' : 'Agregar persona'}
          alCerrar={() => setEdicion(null)}
          acciones={
            <>
              <button type="button" className="btn" onClick={() => setEdicion(null)}>Cancelar</button>
              <button type="button" className="btn btn-1" onClick={guardar}>
                <Icono n="Check" /> Guardar persona
              </button>
            </>
          }
        >
          <Campo etiqueta="Nombres y apellidos" error={errores.nombre}>
            {(id) => <input id={id} type="text" value={edicion.nombre} onChange={(e) => set('nombre', e.target.value)} aria-invalid={!!errores.nombre} autoComplete="off" />}
          </Campo>

          <Grupo etiqueta="Tipo de documento" opcional>
            <Ops opciones={DOCUMENTOS} valor={edicion.tipoDoc} alElegir={(v) => { set('tipoDoc', v); if (!pideDoc(v)) set('numDoc', '') }} />
          </Grupo>

          {pideDoc(edicion.tipoDoc) && (
            <Campo etiqueta="Número de documento" cuando="Se pide porque eligió un tipo de documento." error={errores.numDoc}>
              {(id) => <input id={id} type="text" inputMode="numeric" value={edicion.numDoc} onChange={(e) => set('numDoc', e.target.value.replace(/\D/g, ''))} aria-invalid={!!errores.numDoc} />}
            </Campo>
          )}

          <Nota id="7" etiqueta="div">
            <Campo etiqueta="Teléfono o contacto" opcional error={errores.telefono}>
              {(id) => (
                <div className="pila-2">
                  <input id={id} type="text" inputMode="numeric" value={edicion.telefono} onChange={(e) => set('telefono', e.target.value.replace(/\D/g, ''))} disabled={edicion.sinTelefono} aria-invalid={!!errores.telefono} />
                  <Casilla etiqueta="No tiene" valor={edicion.sinTelefono} alCambiar={(v) => { set('sinTelefono', v); if (v) set('telefono', '') }} />
                </div>
              )}
            </Campo>
          </Nota>

          <Grupo etiqueta="Comunidad o localidad" error={errores.comunidad}>
            <Ops opciones={[...COMUNIDADES.map((c) => ({ id: c, etiqueta: c })), { id: 'Otra', etiqueta: 'Otra' }]} valor={edicion.comunidad} alElegir={(v) => set('comunidad', v)} />
            {edicion.comunidad === 'Otra' && (
              <input type="text" placeholder="Escriba la comunidad" value={edicion.otraComunidad} onChange={(e) => set('otraComunidad', e.target.value)} style={{ marginTop: 'var(--e2)' }} />
            )}
          </Grupo>

          <Campo etiqueta="Dirección o referencia" opcional>
            {(id) => <input id={id} type="text" value={edicion.direccion} onChange={(e) => set('direccion', e.target.value)} />}
          </Campo>

          <Grupo etiqueta={etiquetaRol} error={errores.rol}>
            <Ops opciones={roles.map((r) => ({ id: r, etiqueta: r }))} valor={edicion.rol} alElegir={(v) => set('rol', v)} />
          </Grupo>
        </Ventana>
      )}

      {parecida && (
        <Ventana
          titulo="Ya hay una persona parecida registrada"
          alCerrar={() => setParecida(null)}
          estrecha
          acciones={
            <>
              <button type="button" className="btn" onClick={() => confirmar(parecida.persona, true)}>Es otra persona: continuar</button>
              <button type="button" className="btn btn-1" onClick={usarDatos}>Es la misma persona: usar sus datos</button>
            </>
          }
        >
          <div className="aviso aviso-ambar">
            <Icono n="Users" t={24} />
            <div className="crece">
              <b>{parecida.hallada.nombre}</b>
              <p>
                {parecida.hallada.comunidad}
                {parecida.hallada.numDoc ? ` · DNI ${parecida.hallada.numDoc}` : ''}
                {parecida.hallada.telefono ? ` · ${parecida.hallada.telefono}` : ''}
              </p>
              <p className="pista">Registrada en {parecida.hallada.origenCodigo}</p>
            </div>
          </div>
        </Ventana>
      )}
    </div>
  )
}
