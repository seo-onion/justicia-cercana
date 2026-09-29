# WORKFLOW DE EJECUCIÓN: PROTOTIPO "JUSTICIA CERCANA"
## Examen Parcial CS2H01 – Interacción Humano-Computador (UTEC 2026-2)

> **Uso de este documento:** instrucciones para un agente que construirá (1) un prototipo web funcional con datos simulados, publicado en GitHub Pages, y (2) las capturas de pantalla con Playwright que servirán para el informe PDF.
> **Fuente de verdad:** `ExamenParcial_2026-2.pdf`. Si algo de este workflow contradice el PDF, manda el PDF. No agregar requisitos que el PDF no pida sin justificarlos con una necesidad del caso.

---

## 0. ORDEN DE PRIORIDAD

Si falta tiempo o contexto, ejecutar en este orden y no pasar al siguiente bloque hasta que el anterior funcione:

1. Los 4 flujos de la situación de uso (sección 6) funcionando de punta a punta.
2. Tareas principales de los 3 módulos (registrar, consultar, buscar, actualizar).
3. Trabajo sin conexión: guardado local, estados, envío y sus resultados.
4. Capturas con Playwright y manifiesto.
5. Matriz de justificación y modo anotado.
6. Evidencia automática (tamaños táctiles, contraste).
7. Plan de evaluación (DCU).

**Plan B obligatorio:** si una pantalla o un módulo no llega a funcionar, no se deja el hueco. Se entrega como pantalla estática (HTML con datos fijos) o boceto, en su lugar dentro del flujo y con su justificación, y el informe lo indica. La rúbrica valora la baja fidelidad; un módulo ausente baja la cobertura a 2 puntos.

---

## 1. ALCANCE, STACK Y RESTRICCIONES

### 1.1 Qué es el prototipo
- Frontend estático con datos simulados, **sin backend**, publicado en GitHub Pages.
- Debe **funcionar de verdad**, no solo verse: los formularios guardan, las listas se actualizan, la búsqueda filtra y el contador de pendientes sube y baja. El evaluador puede abrir el enlace y recorrerlo.
- El servidor del Poder Judicial, el envío, los conflictos y el cifrado son **simulados**. El informe lo declara en una sección de alcance.

### 1.2 Stack fijo
- Vite + React + CSS propio (sin librerías de componentes pesadas).
- Íconos: Lucide, empaquetados localmente (sin CDN).
- Fuentes empaquetadas localmente (sin Google Fonts en tiempo de ejecución).
- Persistencia: IndexedDB (librería `idb`) o localStorage.
- Enrutamiento con hash (`#/casos`, `#/casos/:id`) para evitar errores 404 en GitHub Pages.
- `base` de Vite configurado con el nombre del repositorio.
- Service worker (`vite-plugin-pwa`) para que la aplicación cargue sin Internet.
- Playwright (TypeScript) para capturas y auditorías; `@axe-core/playwright` para contraste.

### 1.3 Dispositivos
- **Principal:** tableta de 10", horizontal, viewport 1280×800, táctil.
- **Secundario:** computadora, viewport 1440×900 (pantalla P-10).

### 1.4 Restricciones de lenguaje
- **Etiqueta visible en lenguaje cotidiano; término legal solo como texto secundario** cuando el trámite lo requiera. Ejemplo: "Certificar una firma" como título, "Legalización de firma" en gris debajo.
- En tableta se dice "Toca", nunca "Clic". En computadora, "Haz clic".
- No usar "sincronizar", "modo local", "offline" ni "servidor" en la interfaz. Usar "Enviar al Poder Judicial", "Guardado en la tableta", "Sin Internet".
- Nombres, DNI y teléfonos de los datos semilla son **ficticios**.
- Archivos en UTF-8. Sin notación LaTeX: escribir "44×44 px".
- **Glosario con el vocabulario del enunciado** (va en el informe, no en la interfaz de la jueza): "Registros por enviar" = sincronización pendiente; "Enviar al Poder Judicial" = sincronizar; "Guardado en la tableta" = almacenado localmente. Así el jurado encuentra cada requisito con sus propias palabras.

---

## 2. RÚBRICA OFICIAL (COPIA FIEL DEL PDF)

| Criterio | 4 puntos | 3 puntos | 2 puntos | 0–1 punto |
| :--- | :--- | :--- | :--- | :--- |
| **Cobertura y funcionamiento de los módulos** (se valora prototipos de baja fidelidad o a mano alzada) | El prototipo permite completar de forma clara las tareas principales de los tres módulos. | Incluye los tres módulos, pero una tarea presenta dificultades o está incompleta. | Uno de los módulos o varias tareas están incompletos. | El prototipo está incompleto o no permite realizar las tareas planteadas. |
| **Principios de diseño y heurísticas** | Las decisiones de diseño aplican claramente principios y heurísticas de usabilidad. | La mayoría de las decisiones aplica principios o heurísticas pertinentes. | La aplicación es limitada o inconsistente. | No se identifican principios ni heurísticas en el diseño. |
| **Factores humanos y dispositivo** | La interfaz considera adecuadamente la experiencia del usuario, la interacción táctil y la pantalla de 10 pulgadas. | Considera la mayoría de estos factores, con algunas limitaciones. | Considera pocos factores o los incorpora de manera inconsistente. | No considera las necesidades del usuario ni las condiciones de uso. |
| **Funcionamiento sin conexión** | Permite trabajar sin Internet y comunica con claridad el guardado local y la sincronización pendiente. | Incluye el modo sin conexión, pero algún estado o mensaje no queda claro. | La respuesta ante la falta de conexión es parcial o confusa. | No contempla el trabajo sin conexión. |
| **Justificación de las decisiones** | Justifica cada decisión relacionándola con una necesidad del usuario, un principio, una heurística o un factor humano. | Justifica la mayoría de las decisiones, aunque algunas relaciones son generales. | Presenta justificaciones parciales o poco vinculadas con el diseño. | No justifica las decisiones del prototipo. |

**Requisito adicional del enunciado (no de la rúbrica):** cada justificación debe explicar qué principio, heurística o factor humano se consideró, qué necesidad del usuario atiende y **cómo facilita la interacción o previene errores**.

---

## 3. SISTEMA VISUAL Y ESTADOS GLOBALES

### 3.1 Semántica de colores (única para toda la aplicación)
El color **nunca** va solo: siempre acompañado de ícono y texto.

| Color | Significado único | Ejemplos |
| :--- | :--- | :--- |
| Azul | Información neutra, acción principal | Botón "Guardar", "Con Internet" |
| Gris | Estado normal sin alerta o inactivo | "Sin Internet", actividad cancelada |
| Ámbar | Falta enviar / requiere atención pronto | "3 por enviar", "Guardado en la tableta", caso con cita hoy |
| Verde | Enviado o terminado con éxito | "Todo enviado", "Enviado", caso concluido |
| Rojo | Error que requiere una acción de la jueza | Error de validación, envío fallido, conflicto |

"Sin Internet" es gris, **nunca rojo**: es el estado normal en campo y no debe generar alarma.

### 3.2 Barra de estado (2 indicadores + último envío), fija arriba en todas las pantallas
| Indicador | Estado | Ícono (Lucide) | Texto |
| :--- | :--- | :--- | :--- |
| Conexión | Con Internet | `wifi` (azul) | "Con Internet" |
| Conexión | Sin Internet | `wifi-off` (gris) | "Sin Internet · puede seguir trabajando" |
| Datos | Nada pendiente | `cloud-check` (verde) | "Todo enviado" |
| Datos | Pendientes | `cloud-upload` (ámbar) | "3 registros por enviar" |
| Último envío | — | `clock` | "Último envío: 12/05, 18:40" |

Cuando hay registros por enviar y hay Internet, la barra muestra un **botón visible [Enviar ahora]** (azul, ícono + texto). Tocar el resto de la barra también abre P-09, pero nunca es la única vía: no hay acciones que dependan de descubrir que la barra se puede tocar. Las 4 combinaciones (con o sin Internet × todo enviado o con pendientes) deben existir y capturarse.

### 3.3 Distintivo por registro
Presente en **cada fila y cada detalle** de casos (P-02, P-04), actuaciones (P-05, P-06) y actividades (P-07, P-08):
- `tablet` ámbar + "En la tableta" (guardado, falta enviar)
- `cloud-check` verde + "Enviado"
- `alert-triangle` rojo + "Revisar" (conflicto o error de envío)

### 3.4 Confirmación de guardado
Siempre indica **dónde** quedó: "Caso JZ04-TAB01-202605-0013 guardado en la tableta. Se enviará cuando haya Internet." Ícono `check` azul con distintivo ámbar "En la tableta" (no verde, para no confundir con "enviado").

### 3.5 Guardado automático y recuperación
- Todo formulario guarda automáticamente cada campo al salir de él (y cada 3 s mientras se escribe), con un texto discreto: "Guardado automáticamente hace un momento".
- Al reabrir la aplicación con un formulario sin terminar: "Tenía un caso sin terminar (Juan Quispe, 12/05). ¿Desea continuar?" con botones [Continuar] [Descartar]. Descartar pide confirmación.
- Recordatorio en Inicio si pasan 3 días o más sin enviar: "Lleva 5 días sin enviar sus registros. Si la tableta se pierde o daña, lo no enviado se perdería. Envíelos cuando tenga Internet."

### 3.6 Campos obligatorios y opcionales
- **Sin asteriscos**: es una convención que un usuario con poca experiencia digital no conoce.
- Cada campo opcional lleva **"(opcional)"** en texto junto a la etiqueta. Los obligatorios no llevan marca (son la mayoría).
- Los condicionales muestran una línea bajo la etiqueta que dice cuándo se piden: "Se pide cuando el trámite está Concluido".
- Justificación: H2 (lenguaje del mundo real) y H6 (reconocer antes que recordar).

### 3.7 Borrador / Completo en los tres módulos (misma regla, H4)
- Todo caso, actuación y actividad tiene **estado del registro: Borrador / Completo**, separado de su estado propio (En trámite, Pendiente, Programada, etc.).
- Es automático: queda "Completo" cuando cumple sus mínimos. Siempre se puede guardar antes; lo guardado queda como Borrador.
- Mínimos para "Completo":
  - Caso: tipo de conflicto, descripción, estado y al menos una parte solicitante con sus campos obligatorios.
  - Actuación: todos los obligatorios y condicionales de su tabla, y al menos un solicitante.
  - Actividad: título, categoría, fecha, lugar y estado.
- En las listas, el borrador se marca con texto: "Borrador · falta: personas". P-02, P-05 y P-07 tienen la casilla "Mostrar solo borradores".
- Los borradores también se envían al Poder Judicial (marcados como borrador), para no perder datos.

### 3.8 Dictado por voz
- **La aplicación no tiene botón de micrófono propio.** La Web Speech API envía el audio a un servidor en la mayoría de navegadores y fallaría sin Internet, contradiciendo la comunicación clara del estado sin conexión.
- Los campos de texto largo muestran una ayuda: "Puede hablar en vez de escribir: toque el micrófono del teclado."
- Informe: la tableta se configura con el teclado Gboard y el paquete de español descargado, que permite dictar sin Internet. Es configuración del dispositivo, no del prototipo.

### 3.9 Batería baja
- Al 20 %: aviso "Batería baja (18 %). Lo que registró ya está guardado en la tableta." Si hay Internet y pendientes, incluye [Enviar ahora].
- Al 10 %: aviso más visible con la misma información.
- Usa la Battery Status API donde exista; en el prototipo se simula con el parámetro `battery=`.
- Justificación: en zonas rurales la energía es tan escasa como la conexión; el aviso reduce la ansiedad por pérdida de datos (H1).

### 3.10 Tamaño de letra
- En el menú: "Tamaño de letra" con [Normal] [Grande] [Muy grande] (base 18, 21 y 24 px). Se recuerda entre sesiones.
- El diseño no debe romperse en "Muy grande". Justificación: usuarios mayores con presbicia.

### 3.11 Orientación
- La aplicación se usa **solo en horizontal**. Instalada, se fija con `orientation: landscape` en el manifiesto; en el navegador, si se gira a vertical, se muestra "Gire la tableta para usarla de lado" con una ilustración.
- Justificación: el menú lateral, los formularios de 3 pasos y la vista semanal necesitan ancho; un solo diseño evita que la jueza tenga que reaprender la ubicación de las cosas (H4); la tableta suele usarse apoyada en una mesa.

### 3.12 Idioma
- Interfaz en español. **Limitación reconocida:** muchos jueces de paz y las partes hablan quechua o aimara.
- Mitigación dentro del diseño: lenguaje simple, ícono en cada acción y resumen legible antes de guardar para leerlo en voz alta a las partes.
- Línea futura: interfaz y ayudas en quechua y aimara, validadas con usuarios.

---

## 4. INVENTARIO DE PANTALLAS

### Estructura común (tableta)
- Barra de estado arriba (3.2).
- Navegación lateral izquierda fija con 4 opciones, ícono + texto: Inicio, Casos, Actuaciones, Agenda. Botón "Ayuda" abajo del menú.
- Acción principal de cada pantalla siempre en la **misma posición**: abajo a la derecha, donde termina el recorrido de lectura del formulario. Se justifica por consistencia (H4) y por aparecer donde acaba la tarea. No se argumenta el alcance del pulgar: la tableta de 10" suele estar apoyada en una mesa.
- Formularios largos divididos en **3 pasos** con indicador "Paso 2 de 3" y botones [Atrás] [Siguiente]. Se puede guardar en cualquier paso; si no se cumplen los mínimos, queda como Borrador (3.7).
- Texto base 18 px (ajustable, 3.10); títulos 24 px o más. Objetivos táctiles de **48×48 px como mínimo**, con separación de 8 px o más.
- Sin gestos ocultos: ninguna acción depende de deslizar ni de mantener presionado.

### P-00 · Ingreso con PIN
- PIN numérico de 4 dígitos con teclado numérico grande en pantalla. Funciona sin Internet (se valida contra el valor guardado en la tableta). PIN de demostración: 1234.
- Sin patrón gestual (difícil de recordar y ejecutar para usuarios poco familiarizados).
- "¿Olvidó su PIN?" → explica: "Llame a la sede del Poder Judicial. Le darán un código para desbloquear la tableta." Campo para ingresar ese código (simulado).
- Bloqueo automático tras 5 minutos sin uso; botón "Bloquear" en el menú.
- Informe (diseño, no implementado): cifrado de los datos locales y borrado remoto de la tableta al conectarse si se reporta perdida. Se declara que lo no enviado se pierde si la tableta se pierde; por eso existe el recordatorio de 3.5.

### P-00b · Introducción inicial y ayuda
- Primera vez: 3 pantallas cortas con ilustración: (1) "Registre casos, trámites y citas", (2) "Funciona sin Internet: todo se guarda en la tableta", (3) "Cuando tenga Internet, toque el botón Enviar ahora". Botón [Saltar] visible.
- Cada campo con duda frecuente tiene un ícono `help-circle` que muestra una explicación de una línea con un ejemplo.

### P-01 · Inicio
Bloques en este orden:
1. Recordatorio de envío si corresponde (3.5) y recuperación de borrador si existe.
2. **Hoy:** actividades del día.
3. **Casos que requieren atención**, con motivo visible en texto: "Cita vencida", "Cita hoy", "15 días sin avance".
4. **Próximos 7 días:** actividades próximas. Aviso destacado si hay algo mañana: "Mañana 9:00 · Audiencia · Caso JZ04-...".
5. Accesos grandes: [Nuevo caso] [Nueva actuación] [Nueva actividad].

### P-02 · Casos: lista y búsqueda
- Búsqueda por nombre o DNI (un solo campo) y filtros visibles como botones: Comunidad, Estado (En trámite / En conciliación / Concluido), Rango de fechas. Casilla "Mostrar solo borradores".
- Cada fila: código, nombres de las partes, tipo de conflicto, estado (ícono + texto), motivo de atención si aplica, marca "Borrador · falta: …" si aplica, distintivo por registro (3.3).
- Orden por defecto: primero los que requieren atención.

### P-03 · Caso: nuevo o edición (3 pasos)
- Paso 1 "El problema": datos del caso. Paso 2 "Las personas": partes. Paso 3 "Próxima cita y guardar": próxima fecha opcional y resumen antes de guardar.
- Código generado sin conexión: `JZ[juzgado]-TAB[tableta]-[AAAAMM]-[correlativo]`, por ejemplo `JZ04-TAB01-202605-0013`. El prefijo de tableta evita choques con otras tabletas y con la web; el código es definitivo.
- Detección de duplicados de personas (regla 5.3).
- Si se ingresa "Próxima fecha de atención", al guardar se crea una actividad vinculada en la agenda y se informa: "También se agendó: Audiencia, 19/05, 10:00".

**Campos del caso**

| Campo | Obligatoriedad | Control | Validación | Mensaje |
| :--- | :--- | :--- | :--- | :--- |
| Código | Automático | Texto solo lectura | Formato definido arriba | — |
| Fecha de registro | Automático, editable | Fecha prellenada con hoy | No posterior a hoy | "La fecha no puede ser posterior a hoy." |
| Tipo de conflicto | Obligatorio | Botones grandes (catálogo 5.1) | Si elige "Otro", describirlo | "Elija de qué trata el problema." / "Escriba de qué trata." |
| Descripción del motivo | Obligatorio | Texto amplio | No vacío | "Cuente brevemente qué pasó." |
| Estado | Obligatorio, prellenado "En trámite" | Botones segmentados | Pasar a "Concluido" exige resultado o acuerdo | "Para cerrar el caso, escriba el acuerdo o resultado." |
| Observaciones | Opcional | Texto amplio | — | — |

La fecha de registro es editable porque el reloj de una tableta sin conexión puede estar desfasado.

**Campos de cada parte** (se pueden agregar varias; se sugieren dos para un conflicto)

| Campo | Obligatoriedad | Control | Validación | Mensaje |
| :--- | :--- | :--- | :--- | :--- |
| Nombres y apellidos | Obligatorio | Texto | Al menos nombre y un apellido | "Escriba el nombre y al menos un apellido." |
| Tipo de documento | Opcional | Botones: DNI / Carné de extranjería / Otro / No tiene / No lo tiene a la mano | — | — |
| Número de documento | Condicional (si eligió un tipo) | Teclado numérico | DNI: 8 números | "El DNI tiene 8 números. Revíselo o elija 'No lo tiene a la mano'." |
| Teléfono o contacto | Opcional | Teclado numérico + casilla "No tiene" | Celular: 9 números | "El celular tiene 9 números." |
| Comunidad o localidad | Obligatorio | Lista de comunidades frecuentes + "Otra" | — | "Indique la comunidad donde vive." |
| Dirección o referencia | Opcional | Texto | — | — |
| Rol | Obligatorio | Botones: Solicitante / Invitado / Testigo | Al menos un solicitante por caso | "El caso necesita al menos una persona que lo solicite." |

La comunidad es obligatoria (y la dirección no) porque se usa para buscar y para detectar duplicados, y casi siempre se conoce.

### P-04 · Caso: detalle y registro de avance
- Cabecera: código, estado, distintivo por registro, motivo de atención si aplica.
- Partes con su rol, historial cronológico de avances, próxima cita, resultado o acuerdo, evidencias.
- Botones: [Registrar avance] (principal) [Editar datos].
- **Edición:** los campos modificados se resaltan con borde y la etiqueta "Modificado"; botón [Deshacer cambios]; al guardar: "Se guardaron 2 cambios en la tableta: Estado, Observaciones."
- **Registrar avance** (ventana sobre el detalle):

| Campo | Obligatoriedad | Control | Validación | Mensaje |
| :--- | :--- | :--- | :--- | :--- |
| Fecha del avance | Obligatorio, prellenado hoy | Fecha | No posterior a hoy | "La fecha no puede ser posterior a hoy." |
| Qué se hizo | Obligatorio | Texto amplio | No vacío | "Cuente qué se hizo hoy en el caso." |
| Nuevo estado | Opcional (mantiene el actual) | Botones segmentados | — | — |
| Próxima fecha de atención | Opcional | Fecha y hora | No anterior a hoy; crea actividad en agenda | "La próxima cita no puede ser en una fecha pasada." |
| Resultado o acuerdo | Condicional (si el estado pasa a Concluido) | Texto amplio | No vacío | "Para cerrar el caso, escriba el acuerdo o resultado." |
| Evidencias | Opcional | [Tomar foto] y/o referencia física (texto: "Acta en cuaderno 3, folio 12") | — | — |

**Criterios de "Requiere atención"** (mostrados en texto en la lista y en Inicio):
- Cita vencida: la próxima fecha ya pasó y no hay un avance registrado después.
- Cita hoy.
- 15 días o más sin avances en estado En trámite o En conciliación (umbral configurable; se justifica en el informe).

**Estados del caso:** En trámite / En conciliación / Concluido. "En conciliación" se agrega porque la conciliación es la vía principal del juez de paz (Ley 29824) y distingue los casos con diálogo entre partes en curso. Verificar el término con la ley antes de entregar.

### P-05 · Actuaciones: lista y búsqueda
- Búsqueda por nombre o DNI y filtros: Comunidad, Tipo de actuación, Estado de atención (Pendiente / Atendida / Concluida), Rango de fechas. Casilla "Mostrar solo borradores".
- Cada fila: código, tipo en lenguaje cotidiano, solicitante, estado de atención, marca "Borrador" si aplica, distintivo por registro.

### P-06 · Actuación: nueva o edición (3 pasos)
- Paso 1 "¿Qué trámite?": tipo y asunto. Se muestran primero **4 tarjetas** y el botón [Ver más trámites] muestra el resto: con tarjetas descriptivas el problema real es la carga de lectura, no solo el tiempo de decisión. Paso 2 "Las personas": participantes. Paso 3 "Resultado": estado, fechas, resultado y documentos.
- **Dos dimensiones separadas:**
  - Estado de atención: **Pendiente / Atendida / Concluida** (exigido por el PDF).
  - Estado del registro: **Borrador / Completo**, con la misma regla que los otros módulos (3.7). Siempre se puede [Guardar como borrador].
- Código: `NOT-TAB[tableta]-[AAAAMM]-[correlativo]`, por ejemplo `NOT-TAB01-202605-0007`.

**Campos de la actuación**

| Campo | Obligatoriedad | Control | Validación | Mensaje |
| :--- | :--- | :--- | :--- | :--- |
| Código | Automático | Solo lectura | Formato definido | — |
| Fecha de solicitud | Obligatorio, prellenado hoy | Fecha | No posterior a hoy | "La fecha de solicitud no puede ser posterior a hoy." |
| Tipo de actuación | Obligatorio | Tarjetas con descripción (catálogo 5.2) | — | "Elija qué trámite le piden." |
| Descripción o asunto | Obligatorio | Texto amplio | No vacío | "Cuente en pocas palabras qué necesita la persona." |
| Estado de atención | Obligatorio, prellenado "Pendiente" | Botones segmentados | — | — |
| Fecha de atención | Condicional (desde "Atendida") | Fecha | Igual o posterior a la solicitud y no posterior a hoy | "La atención no puede ser antes de la solicitud." |
| Resultado | Condicional (para "Concluida") | Texto amplio | No vacío | "Para concluir, escriba qué se entregó o qué constancia se emitió." |
| Fecha de entrega o conclusión | Condicional (para "Concluida") | Fecha | Igual o posterior a la atención | "La entrega no puede ser antes de la atención." |
| Observaciones | Opcional | Texto | — | — |
| Documentos | Opcional | [Tomar foto] y/o referencia a documento físico | — | — |

**Campos de cada participante:** iguales a los de las partes del caso (P-03), con **Participación**: Solicitante / Declarante / Testigo. Al menos un solicitante: "El trámite necesita al menos una persona que lo solicite."

Explicación visible de estados: Pendiente = "la persona lo pidió, aún no se atiende"; Atendida = "ya se atendió, falta entregar"; Concluida = "ya se entregó".

### P-07 · Agenda (Mes, Semana, Día)
- Selector grande de vista: [Mes] [Semana] [Día]. Botón [Hoy].
- Categorías con **color + ícono + texto**: Audiencia (`gavel`), Reunión (`users`), Visita a comunidad (`map-pin`), Otra (`calendar`).
- Estado de cada actividad con ícono + texto: Programada (`clock`), Realizada (`check-circle`), Cancelada (`x-circle`, texto tachado en gris).
- Vista mes: cada día muestra hasta 3 actividades y "+2 más"; tocar el día abre la vista día.
- Búsqueda por título, comunidad o persona vinculada; filtros por categoría y estado.
- Aviso de próximas: franja superior "Mañana: 2 actividades" y distintivo en Inicio. Los recordatorios se muestran dentro de la aplicación (no con la API de notificaciones del navegador).
- Distintivo por registro en cada actividad, marca "Borrador" si aplica y casilla "Mostrar solo borradores".

### P-08 · Actividad: nueva o edición

| Campo | Obligatoriedad | Control | Validación | Mensaje |
| :--- | :--- | :--- | :--- | :--- |
| Título | Obligatorio | Texto con sugerencias ("Audiencia de conciliación", "Visita a...") | No vacío | "Escriba un nombre para la actividad." |
| Categoría | Obligatorio | Botones con ícono | — | "Elija el tipo de actividad." |
| Fecha | Obligatorio | Calendario grande | Si es pasada: aviso no bloqueante | "Está agendando en una fecha que ya pasó. ¿Es correcto?" |
| Hora de inicio | Opcional (casilla "Sin hora fija") | Selector de hora con botones grandes | — | — |
| Hora de término | Condicional (si hay hora de inicio) | Selector de hora | Posterior a la de inicio | "La hora de término debe ser después de la de inicio." |
| Lugar o comunidad | Obligatorio | Lista de comunidades + "Otro lugar" | — | "Indique dónde será." |
| Descripción o motivo | Opcional | Texto amplio | — | — |
| Estado | Obligatorio, prellenado "Programada" | Botones segmentados | "Realizada" en fecha futura: aviso | "Marcó como realizada una actividad que aún no ocurre. ¿Es correcto?" |
| Vínculo | Opcional | Buscar caso o actuación | — | — |
| Recordatorio | Opcional, prellenado "1 día antes" | Botones: No / El mismo día / 1 día antes | — | — |

- Cruce de horario: aviso no bloqueante que muestra la otra actividad: "A esa hora ya tiene: Visita a Huayllay. ¿Agendar igual?"
- Las actividades creadas desde un caso muestran "Creada desde el caso JZ04-..." con enlace.

### P-09 · Envío al Poder Judicial
- **Comportamiento:** al detectar Internet, la aplicación **envía automáticamente** y muestra el progreso; también existe el botón [Enviar ahora]. Se elige envío automático porque a un usuario poco familiarizado se le puede olvidar hacerlo manualmente; el resultado siempre se confirma.
- La tableta puede enviar desde **cualquier lugar con Internet** (sede o comunidad), no solo desde la sede.
- **Progreso:** "Enviando 2 de 4…", barra con porcentaje y lista de registros con estado individual.
- **Resultados** (cada uno es una pantalla capturable):
  - Éxito total: "Se enviaron los 4 registros. Todo está guardado en el Poder Judicial." Barra de estado pasa a "Todo enviado".
  - Fallo parcial por corte: "Se enviaron 2 de 4. Se cortó el Internet. Los otros 2 siguen seguros en la tableta." [Reintentar].
  - Error del servidor: "El Poder Judicial no respondió. Sus 4 registros siguen seguros en la tableta. Intente más tarde." [Reintentar].
  - Conflicto: se aplica **automáticamente el cambio más reciente** en cada campo y se informa: "Se usó la versión de la computadora del 14/05 en: Observaciones." El botón secundario [Ver y cambiar] abre la comparación por campo. La versión descartada queda en el historial del registro y se puede recuperar. Así no se exige una decisión compleja a una usuaria con poca experiencia digital y se evitan pasos innecesarios.

### P-10 · Vista en computadora (1440×900)
- Es la **misma aplicación** con diseño adaptado a pantalla ancha: menú lateral, tablas con más columnas, estados al pasar el mouse, "Haz clic".
- Muestra los datos que ya llegaron al Poder Judicial (JSON simulado).
- Se pueden **consultar, crear y editar** casos, actuaciones y actividades (por eso pueden existir conflictos en P-09).
- Aviso informativo con lo que el servidor sí puede saber: "La tableta envió datos por última vez el 12/05 a las 18:40. Lo que registró después aún no aparece aquí." Nunca afirmar cuántos registros tiene pendientes la tableta.
- Puede usarse desde la sede o desde una computadora con Internet en la comunidad.

---

## 5. CATÁLOGOS (VERIFICAR ANTES DE ENTREGAR)

### 5.1 Tipos de conflicto (botones, lista cerrada)
Etiquetas cotidianas; revisar contra las competencias del juez de paz en la Ley 29824:
- Pensión de alimentos
- Deudas y pagos
- Daños a cultivos, animales o cosas
- Problemas entre vecinos (paso, agua, ruidos, límites)
- Insultos o peleas leves
- Otro (escribir cuál)

### 5.2 Tipos de actuación notarial (tarjetas con descripción)
Verificar contra el artículo de competencias notariales de la Ley 29824. No incluir trámites que no figuren en la ley. Etiqueta cotidiana y término legal en gris. En P-06 se muestran primero los 4 primeros de esta lista (configurables) y [Ver más trámites]:
- "Certificar una firma" (legalización de firma)
- "Certificar una copia de documento" (copia certificada)
- "Constancia de que vive en un lugar" (constancia domiciliaria)
- "Constancia de que una persona sigue con vida" (constancia de supervivencia)
- "Constancia de que ocupa un terreno" (constancia de posesión)
- "Constancia de que viven juntos" (constancia de convivencia)
- "Documento de venta o traspaso de un bien" (transferencia de bienes, dentro de los montos que permite la ley)
- Otra (escribir cuál)

### 5.3 Regla común de duplicados (personas y registros)
- Comparación en la base de la tableta: DNI si existe; si no, nombre similar + misma comunidad. Para actuaciones además: mismo tipo y fecha de solicitud dentro de 7 días.
- **Advierte sin bloquear:** muestra el registro parecido con sus datos y pregunta: [Es la misma persona: usar sus datos] [Es otra persona: continuar].
- Sin Internet solo se detectan duplicados dentro de la tableta; los duplicados con otros registros del Poder Judicial se revisan al enviar.

---

## 6. LOS 4 FLUJOS DE LA SITUACIÓN DE USO + FLUJO COMPLEMENTARIO

Cada paso produce al menos una captura (sección 8). Datos semilla restablecidos y fecha congelada en **martes 12/05/2026** antes de cada flujo.

### Flujo 1 · Registrar un conflicto vecinal entre dos personas (corte de conexión a mitad)
1. Toca PIN (P-00). Inicio (P-01) con barra: "Con Internet" · "Todo enviado".
2. Toca [Nuevo caso] (P-03). Paso 1: elige "Problemas entre vecinos" y escribe la descripción (en la tableta real podría dictarla con el micrófono del teclado).
3. **Se corta el Internet** (corte real con Playwright). Aviso: "Se perdió el Internet. Lo que escribe se sigue guardando en la tableta." Barra: "Sin Internet".
4. Paso 2: agrega Parte 1 (Solicitante, "Juan Quispe Mamani", DNI "No lo tiene a la mano", comunidad "Huayllay").
5. Agrega Parte 2 (Invitada, "María Condori Huamán"). **Advertencia de duplicado:** ya existe en una actuación anterior. Toca [Es la misma persona: usar sus datos].
6. Error de validación demostrado: intenta seguir sin rol en la Parte 2 → mensaje en lenguaje simple.
7. Paso 3: fija Próxima fecha de atención 19/05, 10:00. Revisa el resumen y toca [Guardar caso].
8. Confirmación: "Caso JZ04-TAB01-202605-0013 guardado en la tableta" + "También se agendó: Audiencia, 19/05, 10:00". Barra: "2 registros por enviar".

### Flujo 2 · Atender una actuación notarial (con cierre inesperado y recuperación)
1. Toca [Nueva actuación] (P-06). Paso 1: elige "Constancia de que ocupa un terreno" y escribe el asunto.
2. Paso 2: agrega al solicitante. Sin duplicados.
3. **La aplicación se cierra** (Playwright recarga la página). Al volver a entrar: "Tenía una actuación sin terminar. ¿Desea continuar?" → [Continuar].
4. Paso 3: estado "Atendida", fecha de atención hoy. Intenta marcar "Concluida" sin resultado → mensaje de campo condicional.
5. Completa Resultado y Fecha de entrega → "Concluida". El registro pasa de Borrador a Completo.
6. Confirmación en la tableta. Barra: "3 registros por enviar".

### Flujo 3 · Revisar las actividades de la semana
1. Desde Inicio ve el aviso "Mañana: 2 actividades" (reconocimiento de tareas próximas).
2. Toca Agenda (P-07) → vista [Semana]. Se ven categorías con color + ícono + texto y estados.
3. Toca el miércoles → vista [Día] con detalle; toca una actividad para ver su detalle y su vínculo al caso.

### Flujo 4 · Agendar una reunión y enviar todo
1. Toca [Nueva actividad] (P-08): "Reunión con autoridades comunales", categoría Reunión, jueves, 15:00–16:00, Huayllay.
2. Aviso de cruce de horario con otra actividad → ajusta la hora.
3. Guarda. Barra: "4 registros por enviar".
4. **Vuelve el Internet** (en la comunidad o en la sede). Envío automático: progreso "Enviando 2 de 4…".
5. Éxito: "Se enviaron los 4 registros". Barra: "Con Internet" · "Todo enviado". Distintivos pasan a "Enviado".
6. Variantes capturadas por separado (parámetro `scenario`): fallo parcial, error del servidor, conflicto.

### Flujo complementario A · Actualizar el avance de un caso (tarea del Módulo 1)
1. Casos (P-02): busca por "Quispe", filtra por Estado "En conciliación".
2. Abre un caso marcado "Cita vencida" (P-04).
3. Toca [Registrar avance]: describe la reunión, cambia el estado a "Concluido" → exige el acuerdo → lo escribe y adjunta foto del acta.
4. Edición de datos: cambia Observaciones → campo resaltado "Modificado" → [Deshacer] → vuelve a cambiar → "Se guardó 1 cambio en la tableta: Observaciones".

### Flujo complementario B · Computadora (P-10)
1. Abre la aplicación en 1440×900 con datos ya enviados. Aviso de último envío de la tableta.
2. Edita un caso desde la computadora (origen del conflicto de P-09).

---

## 7. MODO DEMOSTRACIÓN Y SIMULACIÓN

### 7.1 Conectividad
- Escuchar los eventos `online`/`offline` del navegador: Playwright corta la conexión de verdad con `context.setOffline(true)` y la barra reacciona.
- Service worker: la aplicación carga sin Internet tras la primera visita.

### 7.2 Servidor simulado
- Capa `api` falsa con latencia configurable y resultado determinado por escenario, **sin aleatoriedad**: `sync-ok`, `sync-partial`, `sync-error`, `conflict`.

### 7.3 Parámetros de URL (la interfaz de la jueza no muestra controles de depuración)
| Parámetro | Efecto |
| :--- | :--- |
| `demo=1` | Activa el modo demostración |
| `reset=1` | Restablece los datos semilla |
| `seed=base` | Elige el conjunto de datos semilla |
| `today=2026-05-12` | Congela la fecha de "hoy" |
| `net=offline` | Fuerza el estado sin Internet en la interfaz |
| `scenario=sync-ok\|sync-partial\|sync-error\|conflict` | Resultado del envío |
| `freeze=1` | Los avisos temporales no desaparecen y la barra de progreso se detiene en 50 % |
| `annotate=1` | Muestra marcadores numerados de la matriz de justificación |
| `battery=15` | Simula el nivel de batería (activa los avisos de 3.9) |
| `font=large` | Fuerza el tamaño de letra Grande (`xlarge` para Muy grande) |
| `pin=skip` | Omite el PIN (solo para capturas que no son de P-00) |

### 7.4 Datos semilla (JSON, ficticios)
- Casos en los 3 estados; al menos uno por cada criterio de "Requiere atención".
- Actuaciones en los 3 estados de atención, con al menos un borrador.
- Una persona repetida para provocar la advertencia de duplicado.
- Una semana de agenda con las 4 categorías y los 3 estados, con 2 actividades "mañana" y un cruce de horario provocable.
- Mezcla de registros "Enviado" y "En la tableta".
- Datos del "servidor" para P-10 y un caso editado en la computadora para el conflicto.

---

## 8. CAPTURAS CON PLAYWRIGHT

### 8.1 Configuración
- Tableta: viewport 1280×800, `hasTouch: true`, `deviceScaleFactor: 2`. Computadora: 1440×900.
- Fecha congelada (`page.clock` o `today=`), animaciones desactivadas (`reducedMotion: 'reduce'` + CSS), esperar interfaz estable antes de cada captura.
- `reset=1` antes de cada flujo.

### 8.2 Manifiesto de capturas (`captures.json`)
Cada entrada: nombre de archivo (`F1-08_confirmacion-guardado.png`), pantalla (P-xx), flujo y paso, URL o acciones que la producen, qué demuestra, criterio de la rúbrica que cubre. El informe se arma a partir de este manifiesto.

### 8.3 Capturas obligatorias
- Cada pantalla P-00 a P-10 en su estado normal.
- Cada paso de los flujos 1–4 y complementarios A–B.
- Barra de estado en las 4 combinaciones.
- Error de validación en lenguaje simple; advertencia de duplicado; campos "Modificado" con [Deshacer].
- Confirmación de guardado en la tableta; aviso de corte a mitad de formulario; recuperación de borrador; recordatorio de días sin enviar.
- Progreso del envío; éxito; fallo parcial; error del servidor; conflicto resuelto automáticamente y su vista [Ver y cambiar].
- Agenda en Mes, Semana y Día; aviso de próximas; aviso de cruce de horario.
- P-10 en computadora.
- Botón [Enviar ahora] visible en la barra.
- Etiquetas "(opcional)" y líneas de campos condicionales.
- Borrador en lista con "falta: …" en los tres módulos.
- Ayuda de dictado del teclado en un campo largo.
- Aviso de batería baja (20 % y 10 %).
- Una pantalla de formulario en tamaño de letra Grande.
- Mensaje "Gire la tableta" con viewport 800×1280.
- Versión anotada (`annotate=1`) de P-01, P-03, P-06, P-07, P-09.

---

## 9. EVIDENCIA AUTOMÁTICA DE FACTORES HUMANOS

- **Objetivos táctiles:** script de Playwright que mide todos los botones y controles de cada pantalla (mínimo 48×48 px y separación de 8 px o más, igual que la sección 4; WCAG 2.5.5 con 44×44 px se cita solo como referencia de piso), repite la medición con letra Grande y genera una tabla. Corregir los que fallen antes de capturar.
- **Contraste:** axe-core en cada pantalla; reportar resultados WCAG AA. Corregir antes de capturar.
- Ambas tablas van al informe como evidencia verificable.

---

## 10. MATRIZ DE JUSTIFICACIÓN

- **Una fila por elemento concreto** de cada pantalla (mínimo 3 filas por pantalla clave). Nada de principios en abstracto.
- El ID de cada fila coincide con el marcador numérico del modo anotado.

| ID | Pantalla | Elemento | Necesidad de la jueza | Principio de Norman | Heurística de Nielsen | Factor humano | Cómo facilita la interacción o previene errores |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 7 | P-03 | Etiqueta "(opcional)" junto a Teléfono | No conoce la convención del asterisco y duda si puede dejar un campo vacío | Signifier | H2 Lenguaje del mundo real; H6 Reconocer antes que recordar | Poca experiencia digital | Continúa sin el dato sin temer que el registro no se guarde; evita que invente un teléfono para "llenar" el campo |
| 12 | P-09 | Conflicto resuelto automáticamente con aviso | Reduce trámites mientras las partes esperan y no domina comparaciones complejas | Feedback | H1 Visibilidad del estado; H3 Control y libertad ([Ver y cambiar]) | Carga de memoria de trabajo | Evita una decisión campo por campo propensa a errores y deja la opción de revertir |

**Regla de calidad:** el efecto de la última columna debe seguirse directamente del elemento. Si no hay relación causal clara, la fila se rehace.

### Referencias a usar (solo donde sean pertinentes)
- **Norman:** affordance, signifier, mapping, feedback, constraints y **modelo conceptual** (metáfora del cuaderno de registro que la jueza ya usa: casos, trámites y agenda como secciones de su cuaderno).
- **Nielsen:** H1 visibilidad del estado; H2 lenguaje del mundo real; H3 control y libertad (Deshacer, Atrás); H4 consistencia (misma ubicación de acciones y mismos colores); H5 prevención de errores (validaciones, duplicados, cruce de horario); H6 reconocer antes que recordar (catálogos, sugerencias); H7 flexibilidad (dictado del teclado, accesos rápidos, tamaño de letra); H8 minimalismo; H9 ayudar a reconocer y recuperarse de errores (mensajes simples con la solución); H10 ayuda (introducción y ayuda por campo).
- **Factores humanos:** Ley de Fitts (objetivos de 48×48 px; se usa para justificar el tamaño, no el alcance del pulgar); Ley de Hick (menú de 4 opciones; en el catálogo de trámites se muestran 4 primero porque, con tarjetas descriptivas, el problema real es la carga de lectura); carga de memoria de trabajo (3 pasos por formulario, resumen antes de guardar); legibilidad al aire libre (contraste alto, 18 px); tableta de 10" apoyada en una mesa (acción principal en posición fija y consistente); teclado en pantalla (el campo activo se desplaza por encima del teclado); poca experiencia digital (sin gestos ocultos, lenguaje cotidiano); pantalla que la jueza muestra a los ciudadanos (resumen legible antes de guardar para que las partes confirmen sus datos); energía limitada (aviso de batería baja); presbicia (tamaño de letra ajustable); orientación fija horizontal; idioma (limitación reconocida: quechua y aimara).

---

## 11. ESTRUCTURA DEL INFORME PDF

1. Carátula: curso, integrantes, título, **enlace de GitHub Pages y código QR**, instrucciones de uso (PIN 1234, cómo restablecer datos, cómo probar sin Internet).
2. Resumen del caso y del usuario.
3. Modelo conceptual y estrategia sin conexión: barra de estado, semántica de colores, distintivos por registro, guardado automático, Borrador/Completo, códigos generados en la tableta y **glosario de equivalencias con el enunciado** (1.4).
4. Módulo 1 – Casos: capturas P-02 a P-04, tablas de campos, criterios de "Requiere atención", justificación de "En conciliación".
5. Módulo 2 – Actuaciones: capturas P-05 y P-06, tablas de campos, catálogo, estados de atención vs. borrador, duplicados.
6. Módulo 3 – Agenda: capturas P-07 y P-08, vistas, categorías, estados, recordatorios, integración con casos.
7. Envío y computadora: capturas P-09 y P-10, resultados posibles, conflictos, envío automático.
8. Los 4 flujos de la situación de uso y los complementarios, como secuencias de capturas con leyenda (pantalla, paso, qué demuestra).
9. Matriz de justificación con capturas anotadas.
10. Evidencia de factores humanos: tabla de objetivos táctiles y reporte de contraste.
11. Alcance: qué está simulado (servidor, envío, conflictos, cifrado, desbloqueo por código, nivel de batería) y qué funciona de verdad (guardado local, detección de conexión, carga sin Internet). El dictado depende del teclado del sistema.
12. Limitaciones y trabajo futuro: idioma (quechua y aimara), solo orientación horizontal, pruebas con usuarios reales pendientes, pantallas entregadas por Plan B si las hubo.
13. Plan de evaluación propuesto (DCU): prueba con 5 jueces de paz, tareas de la situación de uso, métricas de éxito por tarea, tiempo por tarea y SUS. Sin conclusiones no probadas.

---

## 12. LISTA DE VERIFICACIÓN FINAL

Marcar solo si se comprobó en la aplicación publicada, no en este documento.

**Entrega y publicación**
- [ ] La aplicación está publicada en GitHub Pages y las rutas funcionan al recargar (hash + base del repositorio).
- [ ] Carga sin Internet tras la primera visita (service worker, fuentes e íconos locales).
- [ ] El informe incluye enlace, QR, instrucciones de uso y sección de alcance.

**Módulo 1**
- [ ] Registrar caso con varias partes, rol y patrón "No tiene / No lo tiene a la mano".
- [ ] Buscar y filtrar por nombre, DNI, comunidad, estado y fechas.
- [ ] Criterios de "Requiere atención" visibles en texto.
- [ ] Registrar avance con próxima fecha, resultado o acuerdo y evidencias.
- [ ] Edición con campos resaltados, Deshacer y confirmación de cambios.
- [ ] Estados En trámite / En conciliación / Concluido, con "En conciliación" justificado.

**Módulo 2**
- [ ] Estado de atención Pendiente / Atendida / Concluida separado de Borrador / Completo.
- [ ] Campos de descripción, observaciones, participantes (solicitante, declarante, testigo), resultado, fecha de entrega y documentos.
- [ ] Obligatoriedad Condicional aplicada a fecha de atención, resultado y fecha de entrega.
- [ ] Advertencia de duplicado sin bloquear.
- [ ] Catálogo en lenguaje cotidiano, verificado contra la Ley 29824.
- [ ] Buscar y filtrar por nombre, DNI, comunidad, tipo, estado y fechas.

**Módulo 3**
- [ ] Vistas Mes, Semana y Día.
- [ ] Crear actividad con todos los campos de la tabla, incluido el estado Programada / Realizada / Cancelada.
- [ ] Categorías con color + ícono + texto.
- [ ] Validación de horas, aviso de fecha pasada y cruce de horario.
- [ ] Aviso de tareas próximas y recordatorios dentro de la aplicación.
- [ ] La próxima fecha de un caso crea una actividad vinculada.
- [ ] Búsqueda por título, comunidad o persona.

**Sin conexión y envío**
- [ ] Barra de estado con 2 indicadores + último envío, en las 4 combinaciones; "Sin Internet" en gris.
- [ ] Distintivo por registro en casos, actuaciones y actividades (lista y detalle).
- [ ] Confirmación de guardado indica "en la tableta".
- [ ] Guardado automático, recuperación de borrador y recordatorio de días sin enviar.
- [ ] Envío automático con progreso; éxito, fallo parcial, error del servidor y conflicto resuelto automáticamente con [Ver y cambiar].
- [ ] P-10 no afirma cuántos registros tiene pendientes la tableta.
- [ ] PIN sin Internet, "¿Olvidó su PIN?" y bloqueo automático.

**Diseño y justificación**
- [ ] Semántica de colores única aplicada en todas las pantallas.
- [ ] Introducción inicial y ayuda por campo.
- [ ] Ninguna acción depende de gestos ocultos.
- [ ] Matriz con una fila por elemento concreto, incluyendo "Factor humano" y "Cómo facilita o previene errores", con IDs que coinciden con el modo anotado.
- [ ] Tabla de objetivos táctiles sin fallos (48×48 px, también con letra Grande) y reporte de contraste AA sin fallos.
- [ ] Campos opcionales marcados con "(opcional)" en texto, sin asteriscos; condicionales con su línea explicativa.
- [ ] Borrador / Completo en los tres módulos, con "falta: …" y filtro de borradores.
- [ ] Sin botón propio de micrófono; ayuda para usar el dictado del teclado.
- [ ] Botón [Enviar ahora] visible en la barra cuando hay pendientes e Internet.
- [ ] Aviso de batería baja, tamaño de letra ajustable y mensaje de orientación vertical.
- [ ] Glosario de equivalencias con el enunciado y limitación de idioma en el informe.
- [ ] Plan B aplicado: ninguna pantalla falta; las no terminadas están como estáticas o bocetos, señaladas en el informe.

**Capturas**
- [ ] `captures.json` completo y cada captura obligatoria de 8.3 generada.
- [ ] Los 4 flujos incluyen el corte real de conexión a mitad de tarea.
- [ ] Todas las capturas usan la fecha congelada y datos semilla restablecidos.

**Calidad**
- [ ] Archivos en UTF-8, sin LaTeX, en la interfaz se dice "Toca" (tableta) y sin jerga técnica.
- [ ] Todos los nombres y documentos de los datos son ficticios.
