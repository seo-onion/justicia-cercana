import { test, expect } from '@playwright/test'
import { abrir, capturar, guardarManifiesto, tocar, escribir, quieto, q } from './ayudas'

const R = {
  cobertura: 'Cobertura y funcionamiento de los módulos',
  principios: 'Principios de diseño y heurísticas',
  humanos: 'Factores humanos y dispositivo',
  sinConexion: 'Funcionamiento sin conexión',
  justifica: 'Justificación de las decisiones'
}

test.describe.configure({ mode: 'serial' })

test.afterAll(() => guardarManifiesto())

test('pantallas base P-00 a P-10', async ({ page }) => {
  await page.goto(`${q({ reset: 1, pin: 'pedir' })}`)
  await quieto(page, 600)
  await capturar(page, { archivo: 'P-00_ingreso-pin.png', pantalla: 'P-00', flujo: 'Pantallas base', paso: 'Ingreso', demuestra: 'PIN numérico de 4 dígitos con teclado grande, funciona sin Internet', criterio: R.humanos })

  await tocar(page, '¿Olvidó su PIN?')
  await capturar(page, { archivo: 'P-00b_olvido-pin.png', pantalla: 'P-00', flujo: 'Pantallas base', paso: 'Olvidó el PIN', demuestra: 'Recuperación explicada en lenguaje cotidiano, sin bloqueo del trabajo', criterio: R.principios })

  await page.goto(`${q({ reset: 1, intro: 1 })}`)
  await quieto(page, 600)
  await capturar(page, { archivo: 'P-00c_intro-1.png', pantalla: 'P-00b', flujo: 'Pantallas base', paso: 'Introducción 1 de 3', demuestra: 'Introducción de tres pantallas con botón Saltar visible', criterio: R.principios })
  await tocar(page, 'Siguiente')
  await capturar(page, { archivo: 'P-00d_intro-2.png', pantalla: 'P-00b', flujo: 'Pantallas base', paso: 'Introducción 2 de 3', demuestra: 'Se explica el trabajo sin Internet antes de usar la aplicación', criterio: R.sinConexion })
  await tocar(page, 'Siguiente')
  await capturar(page, { archivo: 'P-00e_intro-3.png', pantalla: 'P-00b', flujo: 'Pantallas base', paso: 'Introducción 3 de 3', demuestra: 'Se enseña el botón Enviar ahora antes de necesitarlo', criterio: R.sinConexion })

  const base: [string, string, string, string, string][] = [
    ['/', 'P-01_inicio.png', 'P-01', 'Inicio con hoy, casos que requieren atención y próximos 7 días', R.cobertura],
    ['/casos', 'P-02_casos-lista.png', 'P-02', 'Lista de casos con búsqueda, filtros y marcas por registro', R.cobertura],
    ['/casos/nuevo', 'P-03_caso-nuevo.png', 'P-03', 'Formulario de caso en 3 pasos, paso 1', R.cobertura],
    ['/casos/c-0010', 'P-04_caso-detalle.png', 'P-04', 'Detalle del caso con historial de avances y acciones', R.cobertura],
    ['/actuaciones', 'P-05_actuaciones-lista.png', 'P-05', 'Lista de trámites con estados de atención y borradores', R.cobertura],
    ['/actuaciones/nueva', 'P-06_actuacion-nueva.png', 'P-06', 'Catálogo de trámites en tarjetas, 4 primero y Ver más', R.principios],
    ['/agenda', 'P-07_agenda-semana.png', 'P-07', 'Agenda en vista semana con categorías y estados', R.cobertura],
    ['/agenda/nueva', 'P-08_actividad-nueva.png', 'P-08', 'Formulario de actividad con todos sus campos', R.cobertura],
    ['/ayuda', 'Ayuda_ayuda.png', 'Ayuda', 'Ayuda con el significado de cada marca y el dictado del teclado', R.principios]
  ]
  for (const [ruta, archivo, pantalla, demuestra, criterio] of base) {
    await abrir(page, ruta, { reset: 1 })
    await capturar(page, { archivo, pantalla, flujo: 'Pantallas base', paso: 'Estado normal', demuestra, criterio })
  }

  await abrir(page, '/envio', { reset: 1, seed: 'mixto' })
  await capturar(page, { archivo: 'P-09_envio-pendientes.png', pantalla: 'P-09', flujo: 'Pantallas base', paso: 'Antes de enviar', demuestra: 'Lista de registros por enviar y botón Enviar ahora', criterio: R.sinConexion })

  await page.setViewportSize({ width: 1440, height: 900 })
  await abrir(page, '/pc', { reset: 1 })
  await capturar(page, { archivo: 'P-10_computadora.png', pantalla: 'P-10', flujo: 'Pantallas base', paso: 'Vista en computadora', demuestra: 'Misma aplicación en 1440x900 con tablas y aviso del último envío de la tableta', criterio: R.humanos })
  await page.setViewportSize({ width: 1280, height: 800 })
})

test('barra de estado en sus 4 combinaciones', async ({ page }) => {
  const casos: [Record<string, string | number>, string, string][] = [
    [{ reset: 1, seed: 'base' }, 'BARRA-1_con-internet-todo-enviado.png', 'Con Internet y sin nada pendiente'],
    [{ reset: 1, seed: 'mixto' }, 'BARRA-2_con-internet-pendientes.png', 'Con Internet y con registros por enviar: aparece el botón Enviar ahora'],
    [{ reset: 1, seed: 'base', net: 'offline' }, 'BARRA-3_sin-internet-todo-enviado.png', 'Sin Internet en gris y sin nada pendiente'],
    [{ reset: 1, seed: 'mixto', net: 'offline' }, 'BARRA-4_sin-internet-pendientes.png', 'Sin Internet en gris y con registros por enviar']
  ]
  for (const [extra, archivo, demuestra] of casos) {
    await abrir(page, '/', extra)
    await capturar(page, { archivo, pantalla: 'P-01', flujo: 'Barra de estado', paso: demuestra.split(':')[0], demuestra, criterio: R.sinConexion })
  }
})

test('flujo 1 · registrar un conflicto vecinal con corte de conexión', async ({ page, context }) => {
  await context.setOffline(false)
  await abrir(page, '/', { reset: 1, seed: 'base' })
  await capturar(page, { archivo: 'F1-01_inicio.png', pantalla: 'P-01', flujo: 'Flujo 1', paso: '1. Inicio con Internet y todo enviado', demuestra: 'Punto de partida: barra en Con Internet y Todo enviado', criterio: R.sinConexion })

  await tocar(page, 'Nuevo caso')
  await capturar(page, { archivo: 'F1-02_caso-paso1.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '2. Paso 1, el problema', demuestra: 'Código generado en la tableta y catálogo de tipos de problema en botones grandes', criterio: R.cobertura })

  await tocar(page, /Problemas entre vecinos/)
  await escribir(page, /Qué pasó/, 'Dos vecinos discuten porque uno cerró la acequia que lleva el agua a la chacra de abajo. Piden que se les escuche.')
  await capturar(page, { archivo: 'F1-03_caso-paso1-lleno.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '2. Paso 1 completo', demuestra: 'Descripción con la ayuda para dictar desde el teclado, sin micrófono propio', criterio: R.humanos })

  await context.setOffline(true)
  await quieto(page, 900)
  await capturar(page, { archivo: 'F1-04_corte-internet.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '3. Se corta el Internet a mitad del formulario', demuestra: 'Aviso de corte sin alarma y barra en Sin Internet, en gris; el trabajo continúa', criterio: R.sinConexion })

  await tocar(page, 'Siguiente')
  await tocar(page, 'Agregar persona')
  await escribir(page, /Nombres y apellidos/, 'Juan Quispe Mamani')
  await tocar(page, 'No lo tiene a la mano')
  await tocar(page, 'Huayllay')
  await tocar(page, 'Solicitante')
  await capturar(page, { archivo: 'F1-05_persona-1.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '4. Primera parte, sin documento a la mano', demuestra: 'Opción No lo tiene a la mano en vez de obligar un DNI inventado', criterio: R.principios })
  await tocar(page, 'Guardar persona')

  await tocar(page, 'Agregar persona')
  await escribir(page, /Nombres y apellidos/, 'María Condori Huamán')
  await tocar(page, 'Huayllay')
  await tocar(page, 'Guardar persona')
  await capturar(page, { archivo: 'F1-06_error-rol.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '6. Error de validación en lenguaje simple', demuestra: 'Mensaje que dice qué falta y cómo resolverlo, sin jerga', criterio: R.principios })

  await tocar(page, 'Invitado')
  await tocar(page, 'Guardar persona')
  await capturar(page, { archivo: 'F1-07_duplicado.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '5. Advertencia de persona duplicada', demuestra: 'Advierte sin bloquear y deja elegir entre usar sus datos o continuar', criterio: R.principios })
  await tocar(page, 'Es la misma persona: usar sus datos')
  await capturar(page, { archivo: 'F1-08_personas.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '5. Las dos partes con su rol', demuestra: 'Las partes quedan con rol y comunidad visibles', criterio: R.cobertura })

  await tocar(page, 'Siguiente')
  const fecha = page.getByLabel(/Próxima fecha de atención/).first()
  await fecha.fill('2026-05-19')
  const hora = page.locator('input[type="time"]').first()
  if (await hora.count()) await hora.fill('10:00')
  await quieto(page, 300)
  await capturar(page, { archivo: 'F1-09_resumen.png', pantalla: 'P-03', flujo: 'Flujo 1', paso: '7. Resumen antes de guardar', demuestra: 'Resumen legible para leerlo en voz alta a las partes antes de guardar', criterio: R.humanos })

  await tocar(page, 'Guardar caso')
  await quieto(page, 700)
  await capturar(page, { archivo: 'F1-10_confirmacion-guardado.png', pantalla: 'P-04', flujo: 'Flujo 1', paso: '8. Confirmación de guardado', demuestra: 'La confirmación dice dónde quedó el caso y que también se agendó la cita', criterio: R.sinConexion })

  await abrir(page, '/')
  await capturar(page, { archivo: 'F1-11_barra-pendientes.png', pantalla: 'P-01', flujo: 'Flujo 1', paso: '8. Registros por enviar', demuestra: 'El contador de la barra sube solo tras guardar sin Internet', criterio: R.sinConexion })
  await context.setOffline(false)
})

test('flujo 2 · atender un trámite con cierre inesperado y recuperación', async ({ page }) => {
  await abrir(page, '/actuaciones/nueva', { reset: 1, seed: 'base' })
  await capturar(page, { archivo: 'F2-01_tramite-paso1.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '1. Catálogo de trámites', demuestra: 'Cuatro trámites primero, con término legal en gris, y Ver más trámites', criterio: R.principios })

  await tocar(page, 'Ver más trámites')
  await capturar(page, { archivo: 'F2-02_ver-mas.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '1. Catálogo completo', demuestra: 'El resto del catálogo aparece sin salir del paso', criterio: R.principios })

  await tocar(page, /Constancia de que ocupa un terreno/)
  await escribir(page, /Qué necesita la persona/, 'Necesita una constancia de que ocupa el terreno donde vive desde hace ocho años, para un trámite en la municipalidad.')
  await tocar(page, 'Siguiente')
  await tocar(page, 'Agregar persona')
  await escribir(page, /Nombres y apellidos/, 'Eulogia Bautista Quispe')
  await tocar(page, 'DNI')
  await escribir(page, /Número de documento/, '46021784')
  await tocar(page, 'Vicco')
  await tocar(page, 'Solicitante')
  await tocar(page, 'Guardar persona')
  await quieto(page, 3400)
  await capturar(page, { archivo: 'F2-03_guardado-automatico.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '2. Guardado automático', demuestra: 'El texto discreto avisa que lo escrito ya está guardado en la tableta', criterio: R.sinConexion })

  await page.goto(`${q()}#/actuaciones/nueva`)
  await quieto(page, 900)
  await abrir(page, '/')
  await capturar(page, { archivo: 'F2-04_recuperacion.png', pantalla: 'P-01', flujo: 'Flujo 2', paso: '3. La aplicación se cerró y se recupera', demuestra: 'Al volver, ofrece continuar el trámite sin terminar en vez de perderlo', criterio: R.sinConexion })

  await tocar(page, 'Continuar')
  await quieto(page, 600)
  const paso3 = page.getByRole('button', { name: 'Resultado' }).first()
  if (await paso3.count()) await paso3.click()
  await quieto(page, 400)
  await tocar(page, 'Concluida')
  await capturar(page, { archivo: 'F2-05_condicionales.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '4. Campos condicionales', demuestra: 'Al pasar a Concluida aparecen los campos que se piden, con su línea explicativa', criterio: R.principios })

  await tocar(page, 'Guardar trámite')
  await capturar(page, { archivo: 'F2-06_error-condicional.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '4. Error de campo condicional', demuestra: 'No deja concluir sin decir qué se entregó, y lo explica en una frase', criterio: R.principios })

  await escribir(page, /Qué se entregó/, 'Se entregó la constancia de posesión firmada y sellada por el juzgado.')
  await escribir(page, /Fecha de atención/, '2026-05-12')
  await escribir(page, /Fecha de entrega/, '2026-05-12')
  await quieto(page, 400)
  await capturar(page, { archivo: 'F2-07_completo.png', pantalla: 'P-06', flujo: 'Flujo 2', paso: '5. De Borrador a Completo', demuestra: 'El estado del registro pasa a Completo, separado del estado de atención', criterio: R.cobertura })

  await tocar(page, 'Guardar trámite')
  await quieto(page, 700)
  await capturar(page, { archivo: 'F2-08_confirmacion.png', pantalla: 'P-05', flujo: 'Flujo 2', paso: '6. Confirmación en la tableta', demuestra: 'La confirmación dice dónde quedó y la barra sube su contador', criterio: R.sinConexion })
})

test('flujo 3 · revisar las actividades de la semana', async ({ page }) => {
  await abrir(page, '/', { reset: 1, seed: 'base' })
  await capturar(page, { archivo: 'F3-01_aviso-manana.png', pantalla: 'P-01', flujo: 'Flujo 3', paso: '1. Aviso de lo de mañana', demuestra: 'El aviso de mañana aparece sin que la jueza tenga que ir a buscarlo', criterio: R.principios })

  await abrir(page, '/agenda')
  await capturar(page, { archivo: 'F3-02_agenda-semana.png', pantalla: 'P-07', flujo: 'Flujo 3', paso: '2. Vista semana', demuestra: 'Categorías con color, ícono y texto; estados de cada actividad', criterio: R.principios })

  await tocar(page, 'Mes')
  await capturar(page, { archivo: 'F3-03_agenda-mes.png', pantalla: 'P-07', flujo: 'Flujo 3', paso: '2. Vista mes', demuestra: 'Vista mes con hasta 3 actividades por día y el resto contado', criterio: R.cobertura })

  await tocar(page, 'Día')
  await capturar(page, { archivo: 'F3-04_agenda-dia.png', pantalla: 'P-07', flujo: 'Flujo 3', paso: '3. Vista día', demuestra: 'Vista día con el detalle de cada actividad', criterio: R.cobertura })

  const act = page.locator('.item, .act').first()
  if (await act.count()) {
    await act.click()
    await quieto(page, 400)
    await capturar(page, { archivo: 'F3-05_actividad-detalle.png', pantalla: 'P-07', flujo: 'Flujo 3', paso: '3. Detalle con su vínculo al caso', demuestra: 'La actividad muestra desde qué caso se creó y lleva a él', criterio: R.cobertura })
  }
})

test('flujo 4 · agendar una reunión y enviar todo', async ({ page, context }) => {
  await abrir(page, '/agenda/nueva', { reset: 1, seed: 'mixto' })
  await context.setOffline(true)
  await quieto(page, 800)
  await escribir(page, /Qué actividad es/, 'Reunión con autoridades comunales')
  await tocar(page, 'Reunión')
  const f = page.locator('input[type="date"]').first()
  await f.fill('2026-05-14')
  const horas = page.locator('input[type="time"]')
  if (await horas.count()) {
    await horas.nth(0).fill('15:00')
    if ((await horas.count()) > 1) await horas.nth(1).fill('16:00')
  }
  await quieto(page, 600)
  await capturar(page, { archivo: 'F4-01_cruce-horario.png', pantalla: 'P-08', flujo: 'Flujo 4', paso: '2. Aviso de cruce de horario', demuestra: 'Avisa qué actividad choca a esa hora, sin bloquear', criterio: R.principios })

  if (await horas.count()) {
    await horas.nth(0).fill('17:00')
    if ((await horas.count()) > 1) await horas.nth(1).fill('18:00')
  }
  await tocar(page, 'Huayllay')
  await quieto(page, 400)
  await tocar(page, 'Guardar actividad')
  await quieto(page, 700)
  await capturar(page, { archivo: 'F4-02_guardada.png', pantalla: 'P-07', flujo: 'Flujo 4', paso: '3. Actividad guardada en la tableta', demuestra: 'Confirmación de guardado local y contador de la barra', criterio: R.sinConexion })

  await context.setOffline(false)
  await quieto(page, 900)
  await abrir(page, '/envio', { seed: 'mixto' })
  await capturar(page, { archivo: 'F4-03_vuelve-internet.png', pantalla: 'P-09', flujo: 'Flujo 4', paso: '4. Vuelve el Internet', demuestra: 'Con Internet aparece el botón Enviar ahora en la barra y en la pantalla', criterio: R.sinConexion })
})

test('variantes del envío al Poder Judicial', async ({ page }) => {
  await abrir(page, '/envio', { reset: 1, seed: 'mixto', scenario: 'sync-ok', freeze: 1 })
  await tocar(page, 'Enviar ahora')
  await quieto(page, 900)
  await capturar(page, { archivo: 'P-09a_progreso.png', pantalla: 'P-09', flujo: 'Envío', paso: 'Progreso', demuestra: 'Progreso con el número de registros y el estado de cada uno', criterio: R.sinConexion })

  const escenarios: [string, string, string][] = [
    ['sync-ok', 'P-09b_exito.png', 'Se enviaron los 4 registros y la barra pasa a Todo enviado'],
    ['sync-partial', 'P-09c_fallo-parcial.png', 'Se cortó el Internet a mitad: dice cuántos llegaron y que el resto sigue seguro'],
    ['sync-error', 'P-09d_error-servidor.png', 'El Poder Judicial no respondió: los registros siguen seguros en la tableta'],
    ['conflict', 'P-09e_conflicto.png', 'El conflicto se resuelve solo con el cambio más reciente y se informa qué campo cambió']
  ]
  for (const [scenario, archivo, demuestra] of escenarios) {
    await abrir(page, '/envio', { reset: 1, seed: 'mixto', scenario })
    await tocar(page, 'Enviar ahora')
    await quieto(page, 3200)
    await capturar(page, { archivo, pantalla: 'P-09', flujo: 'Envío', paso: scenario, demuestra, criterio: R.sinConexion })
  }

  const ver = page.getByRole('button', { name: 'Ver y cambiar' }).first()
  if (await ver.count()) {
    await ver.click()
    await quieto(page, 500)
    await capturar(page, { archivo: 'P-09f_ver-y-cambiar.png', pantalla: 'P-09', flujo: 'Envío', paso: 'Comparación por campo', demuestra: 'La comparación campo por campo queda disponible, pero no es obligatoria', criterio: R.principios })
  }
})

test('flujo A · actualizar el avance de un caso', async ({ page }) => {
  await abrir(page, '/casos', { reset: 1, seed: 'base' })
  await escribir(page, /Buscar por/, 'Quispe')
  await quieto(page, 500)
  await capturar(page, { archivo: 'FA-01_busqueda.png', pantalla: 'P-02', flujo: 'Flujo A', paso: '1. Búsqueda y filtros', demuestra: 'Un solo campo busca por nombre o DNI; los filtros son botones visibles', criterio: R.cobertura })

  const fila = page.locator('.item').first()
  await fila.click()
  await quieto(page, 600)
  await capturar(page, { archivo: 'FA-02_detalle-cita-vencida.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '2. Caso con cita vencida', demuestra: 'El motivo de atención se explica en texto, no solo con color', criterio: R.principios })

  await tocar(page, 'Registrar avance')
  await escribir(page, /Qué se hizo hoy/, 'Se reunieron las dos partes en el local comunal y llegaron a un acuerdo sobre el turno de riego.')
  await tocar(page, 'Concluido')
  await quieto(page, 400)
  await capturar(page, { archivo: 'FA-03_avance-condicional.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '3. Al concluir se pide el acuerdo', demuestra: 'El campo condicional aparece con su línea explicativa al pasar a Concluido', criterio: R.principios })

  await escribir(page, /Acuerdo o resultado/, 'Acuerdan turnarse el agua: martes y viernes para la chacra de abajo. Se firma el acta.')
  const foto = page.getByRole('button', { name: 'Tomar foto' }).first()
  if (await foto.count()) await foto.click()
  await quieto(page, 300)
  await capturar(page, { archivo: 'FA-04_evidencia.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '3. Evidencia del acta', demuestra: 'La evidencia admite foto o referencia al cuaderno físico', criterio: R.humanos })
  await tocar(page, 'Guardar avance')
  await quieto(page, 800)

  await tocar(page, 'Editar datos')
  const obs = page.getByLabel(/Observaciones/).first()
  await obs.fill('Las partes quedaron conformes. Se archiva el caso.')
  await obs.blur().catch(() => {})
  await quieto(page, 500)
  await capturar(page, { archivo: 'FA-05_modificado.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '4. Campo modificado con Deshacer', demuestra: 'El campo cambiado se resalta y se puede deshacer antes de guardar', criterio: R.principios })

  await tocar(page, 'Deshacer cambios')
  await quieto(page, 400)
  await capturar(page, { archivo: 'FA-06_deshecho.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '4. Deshecho', demuestra: 'Deshacer devuelve el valor original sin perder el resto del trabajo', criterio: R.principios })

  await obs.fill('Las partes quedaron conformes. Se archiva el caso.')
  await obs.blur().catch(() => {})
  await tocar(page, 'Guardar cambios')
  await quieto(page, 700)
  await capturar(page, { archivo: 'FA-07_cambios-guardados.png', pantalla: 'P-04', flujo: 'Flujo A', paso: '4. Confirmación de cambios', demuestra: 'La confirmación dice cuántos cambios se guardaron y en qué campos', criterio: R.sinConexion })
})

test('flujo B · computadora del Poder Judicial', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await abrir(page, '/pc', { reset: 1, seed: 'base' })
  await capturar(page, { archivo: 'FB-01_pc-casos.png', pantalla: 'P-10', flujo: 'Flujo B', paso: '1. Datos que ya llegaron', demuestra: 'Aviso del último envío de la tableta, sin afirmar cuántos registros quedan pendientes', criterio: R.sinConexion })

  const editar = page.getByRole('button', { name: 'Editar' }).first()
  if (await editar.count()) {
    await editar.click()
    await quieto(page, 500)
    await capturar(page, { archivo: 'FB-02_pc-editar.png', pantalla: 'P-10', flujo: 'Flujo B', paso: '2. Edición desde la computadora', demuestra: 'Desde la computadora se puede editar, y de ahí nacen los conflictos de P-09', criterio: R.cobertura })
  }
  await page.setViewportSize({ width: 1280, height: 800 })
})

test('estados especiales y versiones anotadas', async ({ page }) => {
  await abrir(page, '/', { reset: 1, seed: 'atrasado' })
  await capturar(page, { archivo: 'X-01_recordatorio-dias.png', pantalla: 'P-01', flujo: 'Estados especiales', paso: 'Días sin enviar', demuestra: 'Recordatorio con el riesgo explicado en una frase, no una alarma', criterio: R.sinConexion })

  await abrir(page, '/', { reset: 1, seed: 'mixto', battery: 18 })
  await capturar(page, { archivo: 'X-02_bateria-20.png', pantalla: 'P-01', flujo: 'Estados especiales', paso: 'Batería al 20 %', demuestra: 'Aviso de batería que recuerda que lo registrado ya está guardado', criterio: R.humanos })

  await abrir(page, '/', { reset: 1, seed: 'mixto', battery: 9 })
  await capturar(page, { archivo: 'X-03_bateria-10.png', pantalla: 'P-01', flujo: 'Estados especiales', paso: 'Batería al 10 %', demuestra: 'El mismo aviso, más visible, con la opción de enviar si hay Internet', criterio: R.humanos })

  await abrir(page, '/casos/nuevo', { reset: 1, font: 'large' })
  await capturar(page, { archivo: 'X-04_letra-grande.png', pantalla: 'P-03', flujo: 'Estados especiales', paso: 'Letra grande', demuestra: 'El formulario no se rompe con la letra grande', criterio: R.humanos })

  await abrir(page, '/casos/nuevo', { reset: 1, font: 'xlarge' })
  await capturar(page, { archivo: 'X-05_letra-muy-grande.png', pantalla: 'P-03', flujo: 'Estados especiales', paso: 'Letra muy grande', demuestra: 'Sigue usándose con la letra muy grande, para presbicia', criterio: R.humanos })

  await page.setViewportSize({ width: 800, height: 1280 })
  await abrir(page, '/', { reset: 1 })
  await capturar(page, { archivo: 'X-06_orientacion.png', pantalla: 'Orientación', flujo: 'Estados especiales', paso: 'Tableta en vertical', demuestra: 'Mensaje para girar la tableta, con ilustración, en vez de un diseño roto', criterio: R.humanos })
  await page.setViewportSize({ width: 1280, height: 800 })

  const anotadas: [string, string, string][] = [
    ['/', 'A-01_anotada-inicio.png', 'P-01'],
    ['/casos/nuevo', 'A-02_anotada-caso.png', 'P-03'],
    ['/actuaciones/nueva', 'A-03_anotada-actuacion.png', 'P-06'],
    ['/agenda', 'A-04_anotada-agenda.png', 'P-07'],
    ['/envio', 'A-05_anotada-envio.png', 'P-09']
  ]
  for (const [ruta, archivo, pantalla] of anotadas) {
    await abrir(page, ruta, { reset: 1, seed: 'mixto', annotate: 1 })
    await capturar(page, { archivo, pantalla, flujo: 'Modo anotado', paso: 'Marcadores de la matriz', demuestra: 'Cada marcador numerado corresponde a una fila de la matriz de justificación', criterio: R.justifica })
  }
})
