# Justicia Cercana

Prototipo funcional para el juzgado de paz de Huayllay: registro de casos, trámites notariales y
agenda, pensado para una tableta de 10 pulgadas que trabaja sin Internet.

Examen Parcial de CS2H01 · Interacción Humano-Computador · UTEC 2026-2.
Sebastian Antonio Hernandez Miñano, Andre Contreras Valera, Isaac Percy Gamero del Aguila.

**Prototipo publicado:** https://seo-onion.github.io/justicia-cercana/
**Informe:** [`informe/informe.pdf`](informe/informe.pdf)

## Cómo probarlo

- PIN de ingreso: **1234**.
- Para volver a los datos de ejemplo, agregue `?reset=1` al final de la dirección.
- Para probarlo sin Internet: abra el enlace una vez, apague el wifi y vuelva a abrirlo.
- El dispositivo previsto es una tableta de 10 pulgadas en horizontal, 1280 por 800 píxeles.
  En `docs/EMULACION.md` está cómo dejar el Device Toolbar de Chrome con ese dispositivo exacto.

## Parámetros de demostración

La interfaz de la jueza no tiene controles de depuración; todo se maneja por la dirección.

| Parámetro | Efecto |
| :--- | :--- |
| `reset=1` | Restablece los datos de ejemplo |
| `seed=base\|mixto\|atrasado` | Conjunto de datos: todo enviado, con pendientes, o con días sin enviar |
| `today=2026-05-12` | Congela la fecha de «hoy» |
| `net=offline` | Fuerza el estado sin Internet en la interfaz |
| `scenario=sync-ok\|sync-partial\|sync-error\|conflict` | Resultado del envío |
| `annotate=1` | Muestra los marcadores de la matriz de justificación |
| `battery=15` | Simula el nivel de batería |
| `font=large\|xlarge` | Fuerza el tamaño de letra |
| `pin=skip` | Omite el PIN |
| `freeze=1` | Los avisos no desaparecen y el progreso se detiene |
| `intro=1` | Vuelve a mostrar la introducción inicial |

## Comandos

```
npm install
npm run dev         # servidor de desarrollo
npm run build       # construye dist/
npm run capturas    # genera las capturas y informe/captures.json
npm run auditoria   # mide objetivos táctiles y contraste con axe-core
npm run informe     # compila informe/informe.pdf
python3 scripts/generar_informe.py   # regenera las tablas y figuras del informe
```

Las auditorías fallan si algún control baja de 48 por 48 píxeles, si dos quedan a menos de 8 píxeles
de separación, o si axe-core encuentra un incumplimiento WCAG AA. La medición táctil se repite con
los tres tamaños de letra.

## Estructura

```
src/lib/        datos, reglas de negocio, catálogos, servidor simulado
src/state/      estado global de la aplicación
src/components/ componentes compartidos
src/screens/    pantallas P-00 a P-10
tests/          capturas y auditorías con Playwright
informe/        informe.tex, bocetos a mano, capturas y datos de las auditorías
docs/           contrato de construcción y emulación del dispositivo
```

## Alcance

Funciona de verdad: el guardado local, los códigos generados sin conexión, la detección de
conexión, la carga sin Internet, las búsquedas, los filtros, las validaciones, la detección de
repetidos, el guardado automático con recuperación y el cálculo de casos que requieren atención.

Está simulado: el servidor del Poder Judicial, el envío y sus resultados, los conflictos, el cifrado
local, el desbloqueo por código y el nivel de batería. Todos los nombres y documentos son ficticios.
