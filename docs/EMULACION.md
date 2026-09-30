# Emulación del dispositivo en Chrome DevTools

El prototipo se diseña y se revisa en el dispositivo real del caso: **tableta de 10 pulgadas en
horizontal**. Para que lo que se ve en el navegador sea exactamente eso, el perfil de Chrome que usa
esta sesión trae dos dispositivos registrados en el **Device Toolbar** (el botón de "Toggle device
toolbar", `Ctrl+Shift+M` dentro de DevTools).

## Dispositivos registrados

| Dispositivo en el menú | Ancho x alto | DPR | Táctil | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `Tableta 10" juzgado de paz` | 1280 x 800 (horizontal) · 800 x 1280 (vertical) | 2 | sí | Dispositivo principal. La vista vertical sirve para capturar el mensaje "Gire la tableta". |
| `Computadora del juzgado 1440x900` | 1440 x 900 | 1 | no | Pantalla P-10, la vista en computadora. |

Quedan escritos en el perfil del navegador, en la clave `custom-emulated-device-list` de
`~/.cache/chrome-devtools-mcp/chrome-profile/Default/Preferences`, junto con
`emulation.show-device-mode: true` y la tableta ya preseleccionada en `emulation.device-mode-value`.

## Cómo usarlo a mano

1. Abre `http://localhost:5173/justicia-cercana/?demo=1&pin=skip`.
2. Abre DevTools con `F12`.
3. Toca el botón **Toggle device toolbar** (`Ctrl+Shift+M`). Ya viene activado.
4. En el desplegable de dispositivos elige **Tableta 10" juzgado de paz**. La orientación horizontal
   ya viene puesta; el botón de rotar sirve para comprobar el mensaje de orientación.

## Cómo queda aplicado por herramienta

La sesión aplica la misma emulación por el protocolo de DevTools, sin depender de que el panel esté
abierto:

```
viewport: 1280 x 800
deviceScaleFactor: 2
hasTouch: true
isMobile: false
isLandscape: true
userAgent: Mozilla/5.0 (Linux; Android 14; Tablet) AppleWebKit/537.36 ... Chrome/140.0.0.0 Safari/537.36
```

Verificado dentro de la página: `innerWidth x innerHeight = 1280x800`, `devicePixelRatio = 2`,
`navigator.maxTouchPoints = 1`, `matchMedia('(pointer: coarse)') = true`, letra base `18px`.

`playwright.config.ts` usa exactamente los mismos valores, así que **las capturas del informe salen
del mismo dispositivo que se ve en el Device Toolbar**.
