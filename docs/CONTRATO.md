# Contrato para construir pantallas

Lee esto completo antes de escribir. **La base ya existe y NO se toca.** Solo creas o reescribes los
archivos de pantalla que tu tarea te asigne, dentro de `src/screens/`.

## Regla de oro: minimalismo

El evaluador premia un prototipo que **hace** más de lo que **dice**. Por lo tanto:

- Cero texto decorativo. Ningún párrafo explicativo que no exija el enunciado.
- Cero funcionalidad extra. Si no está pedido abajo, no existe.
- Ningún `<div>` que solo sirva para adornar. Reutiliza las clases CSS que ya están.
- Microcopia corta y en lenguaje cotidiano. Verbo + objeto: "Guardar caso", no "Proceder a guardar el caso".
- Español con tildes y eñes correctas en TODO texto visible. Los identificadores de código van sin tildes.
- En tableta se dice **"Toca"**, nunca "Clic". Prohibido en la interfaz: "sincronizar", "offline",
  "modo local", "servidor", "backend", "IndexedDB". Se dice "Enviar al Poder Judicial",
  "Guardado en la tableta", "Sin Internet".

## Stack y estilo de código

React 18 + JSX, sin TypeScript, sin librerías extra. Imports con extensión (`./x.jsx`).
Cero comentarios en el código: el código se explica solo. Componentes de función, hooks de React.
Nombres de variables en español, igual que la base.

## Estado global: `useApp()`

```js
import { useApp } from '../state/AppContext.jsx'
const {
  casos, actuaciones, actividades,   // arrays de registros
  meta,                              // { pin, ultimoEnvio, introVista, tamanoLetra, borrador, variante }
  servidor,                          // { casos, actuaciones, actividades, ultimoEnvioTableta }  (solo P-10)
  enLinea,                           // bool
  pendientes,                        // [{ tipo, tienda, registro }]  registros con envio === 'local'
  diasSinEnviar, recuerdaEnviar,     // number, bool
  envio, setEnvio, enviarTodo,       // motor de P-09
  guardar,                           // guardar('caso'|'actuacion'|'actividad', registro) -> registro sellado
  actualizarMeta,                    // actualizarMeta({ borrador: {...} })
  avisar,                            // avisar({ tono, icono, titulo, texto, accion:'enviar'|null, fijo })
  bateria, desbloqueado, setDesbloqueado
} = useApp()
```

`guardar()` sella solo: pone `envio:'local'`, `actualizadoEn`, y recalcula `registro:'borrador'|'completo'`.
Devuelve el registro guardado. **Nunca escribas `envio` ni `registro` a mano.**

## Navegación (hash)

```js
import { ir, enlace, useRuta } from '../lib/rutas.js'
ir('/casos/c-0010')            // navegar
<a href={enlace('/casos')}>    // enlace real
const { partes, q } = useRuta() // partes = ['casos','c-0010']; q = URLSearchParams
```

Rutas: `/` `/casos` `/casos/nuevo` `/casos/:id` `/casos/:id/editar` `/actuaciones` `/actuaciones/nueva`
`/actuaciones/:id` `/agenda` `/agenda/nueva` `/agenda/:id` `/envio` `/ayuda` `/pc`

## Fechas (hoy está congelado)

```js
import { HOY, corto, largo, sello, relativo, dias, sumarDias, semanaDe, mesDe,
         nombreMes, nombreDiaC, lunesDe, esPasada, minutos, conHora } from '../lib/fechas.js'
```
`HOY === '2026-05-12'` (martes). `corto('2026-05-19') === '19/05'`. `largo()` -> `'19/05/2026'`.
`sello('2026-05-12T18:40') === '12/05, 18:40'`. `relativo()` -> `'hoy' | 'mañana' | 'en 3 días' | 'hace 5 días'`.

## Reglas de negocio (ya implementadas, úsalas)

```js
import { faltaCaso, faltaActuacion, faltaActividad, textoFalta, registroDe,
         atencion, ordenCasos, personasDe, buscarParecida, actuacionParecida,
         cruceHorario, filtraTexto, enRango, esPasada, ultimoAvance, personaCompleta } from '../lib/reglas.js'
```
- `textoFalta('caso', caso)` -> `'Borrador · falta: personas'` o `''`.
- `atencion(caso)` -> `{ motivo: 'Cita vencida' | 'Cita hoy' | '22 días sin avance', orden }` o `null`.
- `ordenCasos(casos)` -> ordenados, primero los que requieren atención.
- `cruceHorario(actividades, act)` -> la actividad que choca, o `undefined`.
- `filtraTexto(registro, texto)` -> busca en código, descripción, título, lugar y en nombre/DNI/comunidad de las personas.
- `enRango(iso, desde, hasta)` -> bool.

## Catálogos

```js
import { CONFLICTOS, ACTUACIONES, ACTUACIONES_VISIBLES, COMUNIDADES, DOCUMENTOS,
         ROLES_CASO, ROLES_ACTUACION, ESTADOS_CASO, ESTADOS_ATENCION, CATEGORIAS,
         ESTADOS_ACTIVIDAD, SUGERENCIAS_ACTIVIDAD, DIAS_SIN_AVANCE, et } from '../lib/catalogos.js'
```
Cada elemento es `{ id, etiqueta, ... }`. `et(ESTADOS_CASO, 'tramite') === 'En trámite'`.
`ACTUACIONES` trae además `legal` (término legal, se muestra en gris debajo de la etiqueta).

## Códigos

```js
import { codigoCaso, codigoActuacion, uid } from '../lib/ids.js'
codigoCaso(casos.map(c => c.codigo))        // -> 'JZ04-TAB01-202605-0013'
codigoActuacion(actuaciones.map(a => a.codigo)) // -> 'NOT-TAB01-202605-0007'
uid('av')                                    // id único para sub-registros
```

## Componentes compartidos (úsalos, no reinventes)

```js
import Icono from '../components/Icono.jsx'
import Campo, { Grupo, Ops, Casilla, Ayuda } from '../components/Campo.jsx'
import Ventana from '../components/Ventana.jsx'
import Aviso from '../components/Aviso.jsx'
import Nota from '../components/Nota.jsx'
import Personas from '../components/Personas.jsx'
import Pasos from '../components/Pasos.jsx'
import Buscador from '../components/Buscador.jsx'
import { Dist, MarcaEnvio, MarcaEstadoCaso, MarcaEstadoAtencion, MarcaEstadoActividad,
         MarcaCategoria, MarcaAtencion, MarcaBorrador } from '../components/Marcas.jsx'
```

- `<Icono n="Send" t={20} />` — nombres válidos están en el mapa de `Icono.jsx`. Si el que quieres no está, agrégalo ahí importándolo de `lucide-react`.
- `<Campo etiqueta="Descripción del motivo" opcional cuando="Se pide cuando el trámite está Concluido" ayuda="…" error={err.x}>{(id) => <textarea id={id} … />}</Campo>`
  — `opcional` pinta "(opcional)"; `cuando` pinta la línea de campo condicional; `error` pinta el mensaje en rojo con ícono.
- `<Grupo etiqueta="Estado" error={…}><Ops opciones={ESTADOS_CASO} valor={v} alElegir={set} /></Grupo>` — para botones grandes y segmentados.
- `<Casilla etiqueta="No tiene" valor={v} alCambiar={set} />`
- `<Ventana titulo="…" alCerrar={fn} estrecha acciones={<>…</>}>…</Ventana>` — modal.
- `<Personas personas={p} alCambiar={set} roles={ROLES_CASO} etiquetaRol="Rol" banco={banco} mensajeSinSolicitante="El caso necesita al menos una persona que lo solicite." />`
  donde `banco = personasDe([...casos, ...actuaciones])`. Ya trae validaciones, duplicados y su ventana.
- `<Pasos paso={paso} titulos={['El problema','Las personas','Próxima cita y guardar']} alIr={setPaso} />`
- `<Buscador texto={t} alTexto={setT} grupos={[{etiqueta:'Estado', valor, alElegir, opciones}]} soloBorradores={b} alBorradores={setB} desde={d} hasta={h} alFecha={(a,b)=>{}} />`
- `<Nota id="12" etiqueta="div">…</Nota>` — marcador numerado de la matriz de justificación; solo se ve con `?annotate=1`. Los IDs 1 a 8 ya están usados en la base. Usa los que te asigne tu tarea.

## Clases CSS disponibles (no escribas CSS nuevo)

Estructura: `.lienzo` (ya lo pone el marco) `.pila` `.pila-2` `.fila` `.fila-sep` `.crece` `.rejilla-2` `.rejilla-3`
Superficies: `.tarjeta` `.vacio`
Botones: `.btn` `.btn-1` (principal azul) `.btn-peligro` `.btn-plano` `.btn-gr` (acceso grande) `.acciones` (fila abajo a la derecha)
Opciones: `.ops` `.op[aria-pressed]` `.tarjetas-op` `.tarjeta-op[aria-pressed]` (con `<b>` y `<span>` dentro)
Listas: `.lista` `.item` `.item-tit` `.item-sub` `.item-marcas` `.codigo`
Avisos: `.aviso` + `.aviso-azul|ambar|verde|rojo|gris`
Distintivos: `.dist` + `.dist-azul|ambar|verde|rojo|gris`
Tabla (solo P-10): `table.tabla`
Agenda: `.mes` `.mes-cab` `.mes-dia` (`.fuera` `.hoy`) `.pildora` `.semana` `.semana-col` `.semana-cab` `.act` `.act-hora` `.act-tit`
Pantalla completa: `.centro` `.caja` `.teclado` `.tecla` `.puntos` `.punto`
Progreso: `.progreso > i` ; Campos modificados: `.modificado` ; Oculto para lectores: `.sr`

Si de verdad necesitas un ajuste puntual, usa `style={{}}` inline. **No crees archivos CSS.**

## Reglas de interfaz obligatorias (las evalúa la rúbrica)

1. **Acción principal siempre abajo a la derecha**, dentro de `<div className="acciones">`.
2. **Objetivos táctiles mínimo 48×48 px con 8 px de separación.** Las clases ya lo cumplen; no reduzcas
   alturas con `style`. Cualquier botón de solo ícono necesita `aria-label`.
3. **El color nunca va solo**: siempre ícono + texto. Nunca uses rojo para "Sin Internet".
4. **Sin asteriscos** en campos obligatorios. Los opcionales llevan `opcional` (sale "(opcional)").
   Los condicionales llevan `cuando="Se pide cuando…"`.
5. **Sin gestos ocultos**: nada de deslizar ni mantener presionado. Todo con botón visible.
6. **Formularios largos en 3 pasos** con `<Pasos>`; se puede guardar en cualquier paso (queda Borrador).
7. **Guardado automático** en formularios: cada 3 s y al salir de un campo, guarda en
   `actualizarMeta({ borrador: { tipo, id, ruta, datos, etiqueta, guardadoEn } })` y muestra el texto discreto
   "Guardado automáticamente hace un momento". Al guardar de verdad, limpia con `actualizarMeta({ borrador: null })`.
8. **Confirmación de guardado** siempre dice dónde quedó. Usa `avisar()`:
   ```js
   avisar({ tono: 'azul', icono: 'Check', titulo: `Caso ${codigo} guardado en la tableta.`,
            texto: 'Se enviará cuando haya Internet.' })
   ```
9. **Campos de texto largo** llevan `ayuda` o pista con: "Puede hablar en vez de escribir: toque el
   micrófono del teclado." **Nunca** un botón de micrófono propio.
10. El diseño no se rompe con `?font=xlarge`. Evita anchos fijos en px.

## Cómo verificar tu trabajo

```
npm run build        # tiene que pasar sin errores ni warnings de import
```
No hace falta que corras Playwright; de eso se encarga el orquestador.
