# PassWordle - Simulador de Hacking (Wordle Based)

> **Descripción del Proyecto:**
> PassWordle es un mini-proyecto universitario de la materia Programación. Consiste en un simulador de hacking lógico con una fuerte estética **Cyberpunk**. El jugador asume el rol de un intruso digital (Netrunner) que debe descifrar códigos de seguridad de los sistemas, los cuales están basados en terminología de programación e informática.
>
> A nivel mecánico, el juego es una adaptación de **Wordle**, donde el usuario debe adivinar palabras (actualmente de 5 letras) en un número limitado de intentos, recibiendo feedback visual clásico: verde (letra correcta en posición correcta), amarillo (letra correcta en posición incorrecta) y oscuro (letra inexistente en la clave).
>
> **Stack Tecnológico:** HTML5, CSS3, JavaScript Vanilla. Está preparado con `capacitor.config.json` para su futura compilación en formato ejecutable (.exe / mobile).

---

## Registro de Cambios y Mejoras (Abril 2026)

## Resumen de Actualizaciones (Día 1)
Este documento guarda el progreso de las implementaciones lógicas y visuales realizadas en la versión original de ShadowCODE, ahora **PassWordle**.

### 🛠 Lógica del Juego (JS)
* **Sistema Basado en Intentos**: Se eliminó el contador de Game Over por temporizador (Timer) y se adoptó el estándar Wordle de **Intentos** para la derrota:
  * Nivel Junior: 9 Intentos.
  * Nivel Agent: 5 Intentos.
  * Nivel Netrunner: 4 Intentos.
* **Validaciones de Longitud (Wordle Strict)**: El usuario ya no puede enviar una entrada con menos o más caracteres de los requeridos por la palabra objetivo. Si la palabra es de 5 letras y se envían 3, el texto vibrará en rojo con la notificación de "Se requieren 5 caracteres".
* **Freedom of Input**: Se eliminó el bloqueo dictatorial de forzar "palabras que existan en el sistema". Ahora cualquier conjunto de caracteres (Ej: **ASDFG**) se toma como válido y gastará un intento para minar letras verdes y amarillas.
* **Depuración de Colores Algorítmica**: La clase ahora calcula letras repetidas estrictamente. El sistema ya no colorea múltiples botones de amarillo si la palabra clave solo dispone de una letra coincidente.

### 🎨 Frontend y Responsividad (CSS & HTML)
* **Soporte Móvil General**: Se aplicaron `@media queries` enfocadas a anchos de `max-width: 900px`. Se disminuyeron los tamaños lógicos de textos titánicos en los Modos de juego e inputs, y se aplicó apilamiento automático reubicando el botón de iniciar partida según el Layout para el celular.
* **Corrección de "Error Windows" (CSS)**: Las ventanas rojas de Critical Error que simulan el spam del hackeo fallido se re-distribuyeron con `transform` y `left` en las `@media queries` para que no se desborden creando overflow horizontal en dispositivos móviles.
* **Preservación Brutalista**: Se mantuvieron estrictas las guías "pesadas" y cuadradas en la pantalla de Modos, evitando que los botones colapsen a una estructura genérica y preservando el estilo original.
* **Ajuste de Strings HTML**: Cambio de la etiqueta `TIME` por `ATTEMPTS` con inyección dinámica del largo límite para dar feedback directo del tamaño de código al Hacker.

---

## Resumen de Actualizaciones (Día 2) - Minimalist Hacker UI Update

### 💅 Estética Global & Diseño UI (Glassmorphism)
* **Fondo y Gradientes**: Eliminación del color negro obsoleto para implementar un `radial-gradient` muy oscuro con brillos púrpuras extremadamente sutiles, que logran la paleta sigilosa del juego.
* **Rebranding Gráfico**: Modificación nativa del componente `<h1 class="h1-tile-container">` del Landing Page para renderizar el logo principal (*PASS WORDLE*) emulando cajas reales de colores Verde (`Correcto`), Amarillo (`Parcial`) y Sin color (`Ghost/Vacío`).
* **Botones e Inputs (Ghost Style)**: Cambio de componentes interactivos a cajas transparentes (`rgba()` tenues) con bordes delgados de `1px stroke`, brillos holográficos `box-shadow` y efectos `translateY` elegantes.
* **Terminal UI y Features**: 
  * Reestructuración del contenedor terminal para comportarse como una ventana cristalina `Glassmorphism`.
  * Conversión de la lista de características y bondades en paneles interactivos simulando consolas nativas de Linux con el característico triple control en barra `_ □ ✖`.
  * Íconos de características reimplementados mediante SVG de alto contraste (Verde, Amarillo, Lila).

### ⚙ Funcionalidades Core (JS)
* **Wordle Matrix Animado**: Implementación procedimental (`initMatrix()`) de contenedores SVG animados que renderizan de fondo carácteres alfanuméricos que llueven diagonalmente como en consola retro, mutando sus letras dinámicamente mediante `setInterval()`.
* **Typing Effect Coloreado**: Sobreescritura de la función encargada de generar letras en la Terminal de Inicio, soportando ahora `textChunks` y etiquetas `span` de color `HTML` mientras corre el bucle de impresión para resaltar los Modos Wordle por color dinámicamente en tiempo real. 
* **Globalización de Botón Audio**: Movimiento del ícono de control musical hacia la barra de navegación superior (Nav `ul`) y añadido label explícito interactivo de "ACTIVAR SONIDO".
