# Alberto Chirinos — Landing

Página de una sola pantalla para Alberto Chirinos (crecimiento humano y
transformación emocional). HTML, CSS y JavaScript sin dependencias ni build.

## Cómo verla

```bash
python -m http.server 5173
```

Si al probarlo la página se queda a medias (el video bloquea el servidor,
porque `http.server` atiende de uno en uno), usa uno con hilos:

```bash
python -c "from http.server import *; ThreadingHTTPServer(('127.0.0.1',5173), SimpleHTTPRequestHandler).serve_forever()"
```

Y abre <http://127.0.0.1:5173>.

Hace falta un servidor (no vale abrir `index.html` con doble clic) porque el
JavaScript está organizado en módulos ES y el navegador los bloquea sobre
`file://`. Cualquier servidor estático sirve: `npx serve`, la extensión
*Live Server* de VS Code, etc.

## Estructura

```
index.html                 Todo el contenido y el marcado
assets/
  css/
    tokens.css             Color, tipografía, espaciado (el sistema de diseño)
    base.css               Reset, fuentes y tipografía base
    layout.css             Contenedores, cabecera, secciones y pie
    components.css         Botones, tarjetas, acordeón, línea de tiempo…
    sections.css           Composición específica de cada sección
  js/
    config.js              ← teléfonos, correo, redes y meditaciones
    main.js                Punto de entrada
    whatsapp.js            Rellena los enlaces de contacto
    enlaces.js             Correo y redes sociales
    reproductor.js         Reproductor de meditaciones
    nav.js                 Cabecera, menú móvil y sección activa
    interacciones.js       Aparición al scroll, contadores, acordeón, riel
  img/                     Logo, isotipo y fotos ya optimizadas
  audio/                   ← mp3 de las meditaciones (ver LEEME.txt)
  video/                   alberto-mensaje.mp4
_material-original/        Documento, manual de marca y fotos originales
```

## Números de WhatsApp

Todos están en `assets/js/config.js`, que es la única fuente:

```js
export const CONTACTOS = [
  { pais: 'Venezuela', bandera: 'bandera-ve',
    numero: '584247119592', visible: '+58 424 711 9592' },
  { pais: 'Colombia',  bandera: 'bandera-co',
    numero: '573028341685', visible: '+57 302 834 1685' },
  { pais: 'Colombia',  bandera: 'bandera-co',
    numero: '573022458002', visible: '+57 302 245 8002' },
];

export const CONTACTO_PRINCIPAL = 0;   // el que usan los botones de la página
```

`numero` va en formato internacional y solo con dígitos (es lo que pide wa.me);
`visible` es como se muestra en pantalla.

Dónde aparece cada uno:

- **Pie**: los tres, con su bandera.
- **Botón flotante «Escríbeme»**: despliega los tres para elegir.
- **Resto de botones** (cabecera, hero, lista de resonancia, cierre): usan
  `CONTACTO_PRINCIPAL`. Si quieres que también desplieguen la lista, hay que
  convertirlos en el mismo componente que el flotante.

En el marcado, `data-wa` recibe el enlace, `data-wa-msg` elige el mensaje
precargado (`MENSAJES`, en el mismo archivo) y `data-wa-num` el número:

```html
<a data-wa data-wa-num="1" data-wa-msg="hola">…</a>
```

`data-wa-visible="1"` escribe el número en pantalla desde `config.js`. El HTML
lleva el número también como texto por si el JavaScript no llega a ejecutarse,
pero el que manda es `config.js`.

**Las banderas son SVG, no emoji.** Windows no dibuja los emoji de bandera:
muestra las dos letras del país. Los símbolos se definen una vez al principio
de `index.html` y se reutilizan con `<use href="#bandera-ve">`.

## Meditaciones (el reproductor)

La sección va justo debajo del banner. Las pistas salen de `MEDITACIONES`, en
`assets/js/config.js`:

```js
{
  titulo: 'Alivio del dolor emocional',
  tipo: 'Ejercicio guiado',
  descripcion: '…',
  archivo: 'assets/audio/alivio-del-dolor-emocional.mp3',
  soundcloud: 'https://soundcloud.com/ser-integral/ejercicio-alivio-del-dolor',
  portada: '',            // cuadrada; sin ella se usa el isotipo
}
```

Para añadir una meditación: copia el mp3 en `assets/audio/` y añade un objeto
más. El reproductor y la lista se dibujan solos, la duración se lee del propio
archivo y la portada cae al isotipo si no le das una.

**Falta el mp3, pero el audio suena igual.** Ahora mismo `assets/audio/` está
vacío: solo llegó el enlace de SoundCloud. Cuando un `archivo` no existe, la
pista no se queda muda: se incrusta el reproductor de SoundCloud de esa pista
—teñido con el taupe de la marca— y se esconde la botonera propia, que no
manda sobre él. En cuanto copies `alivio-del-dolor-emocional.mp3` en la
carpeta, el reproductor prestado desaparece y vuelve el nuestro.

`soundcloud` tiene que ser la **URL larga** (`soundcloud.com/usuario/pista`).
El enlace corto `on.soundcloud.com/…` solo redirige en el navegador: el
reproductor incrustado no lo entiende. El de esta pista se resolvió así:

```bash
curl -sIL https://on.soundcloud.com/zO4bhNWHZrt190UVFj | grep -i ^location
```

Detalle: para saber si el mp3 está, se le hace una petición HTTP normal
(`fetch` con `HEAD`) en lugar de esperar el evento `error` del `<audio>`. Ese
evento no es de fiar: si el archivo no existe, Chrome puede dejar la carga
colgada y no avisar nunca, y entonces la pista se quedaría muda y sin
explicación.

La portada del reproductor usa el isotipo. Si quieres la carátula real de la
meditación (la que se ve en SoundCloud), guárdala cuadrada en `assets/img/` y
ponla en `portada`.

El volumen va pegado a la botonera, no al borde derecho, porque ahí flota el
botón de WhatsApp y lo tapaba.

## Video

`assets/video/alberto-mensaje.mp4` — vertical (720×1280), 4:11, 23 MB. Es el
archivo que llegó por WhatsApp, sin recomprimir. La sección lo enmarca como un
reel: alto acotado y ancho proporcional, sin recortarlo.

Va a la izquierda a propósito: sus controles nativos están abajo a la derecha,
justo donde flota el botón de WhatsApp.

Se carga con `preload="metadata"`, así que el navegador solo pide la cabecera
hasta que alguien le da al play. Aun así, 23 MB es bastante: si algún día la
página va lenta, comprimirlo es lo primero que hay que mirar.

Para cambiarlo, sustituye el archivo (mismo nombre) o el `src` en `index.html`.

## Correo y redes

Ambos en `assets/js/config.js`:

```js
export const CORREO = 'albertodariochirinos@gmail.com';
```

El correo aparece en el pie y en la sección «¿Comenzamos?», con el asunto y el
cuerpo ya escritos. En el marcado, `data-mail` recibe el enlace,
`data-mail-asunto` elige el asunto y `data-mail-visible` escribe la dirección.

Las redes salen de `REDES` y se pintan en dos sitios: fila de iconos sueltos en
el cierre (`data-redes`) y columna propia en el pie, con el icono y el nombre
en un renglón (`data-redes data-redes-texto`).

El pie es una retícula de cinco columnas, una por bloque: marca (con el
correo), Secciones, WhatsApp, Dónde estamos y Redes. Es a propósito: apilar
dos títulos dentro de una misma columna descoloca todo lo que va debajo y las
redes acababan muy por debajo del resto. El `@` de cada perfil no se escribe
en el pie —el icono ya identifica la red y el enlace lleva al perfil—, pero sí
va en el `aria-label` para quien navega con lector de pantalla.

**Ojo con dos enlaces.** Solo Instagram está verificado, porque Alberto dio el
@ (`albertodchirinos`, perfil «Alberto D. CHIRINOS A.»). Los de Facebook y
TikTok están *deducidos* de ese mismo usuario: no aparecen buscándolos y nadie
los ha confirmado. Antes de publicar, abre los dos perfiles y copia la URL de
la barra del navegador a `REDES`; si el usuario real es otro, esos enlaces
llevan a una página inexistente o, peor, a la cuenta de otra persona.

## Dirección visual

Editorial cálido, en la línea de pixandhue.com: neutros greige, tipografía
serif de alto contraste para los titulares, versalitas muy espaciadas para las
etiquetas, botones rectangulares y filetes finos en lugar de tarjetas.

| Token | Valor | Uso |
|---|---|---|
| `--bone` | `#F4F2EF` | fondo base |
| `--linen` | `#EAE4DD` | franjas alternas |
| `--ink` | `#241F1B` | texto y paneles oscuros |
| `--taupe` | `#B49C89` | acento: etiquetas, números, filetes |
| `--taupe-deep` | `#8E7461` | acento con contraste para texto |
| `--cyan` | `#65C4DA` | marca: logotipo |
| `--cyan-deep` | `#2E7C8E` | marca: estados interactivos |

Tipografías (Google Fonts): **Instrument Serif** para titulares y cursivas,
**Red Hat Display** para texto y etiquetas.

**Sobre el manual de marca.** `_material-original/GUIA LOGO.pdf` define negro
`#1D1D1B`, cian `#65C4DA`, gris `#9A9999` y las tipografías Audiowide y Boluga.
El cian se mantiene en el logotipo y en los estados interactivos; el negro se
calienta ligeramente a `#241F1B` para que conviva con los neutros greige. Las
tipografías del manual no se usan en la web: Boluga es comercial y Audiowide
tiene un carácter tecnológico que choca con esta dirección editorial.

## Assets generados

El logotipo sale de `_material-original/logo_transparente.png`, el PNG con
canal alfa correcto. Ese archivo sirve igual sobre fondo claro y sobre fondo
oscuro: las partículas son cian, el wordmark gris y la silueta humana queda
transparente, así que toma el color del fondo (hueso en la cabecera, espresso
en el pie). Por eso basta una sola versión.

| Archivo | Para qué |
|---|---|
| `logo-chirinos.png` | logotipo completo: cabecera, cierre y pie |
| `isotipo.png` | solo el círculo, para la marca de agua |
| `favicon.png` / `favicon.ico` | icono de pestaña, sobre disco espresso |

El logotipo va completo y sin recortar en los tres sitios. La cabecera mide
104 px de alto (84 px en móvil) precisamente para darle sitio: el tagline
necesita todo el ancho posible para leerse.

El favicon lleva disco espresso detrás: la silueta es transparente y a 32 px,
sobre un fondo claro cualquiera, la figura se perdería.

Las fotos están redimensionadas a JPG progresivo + WebP.

## Detalles de implementación

- **Lista de resonancia**: las seis frases son botones con `aria-pressed`; el
  contador y el mensaje cambian según cuántas marques.
- **Riel de trayectoria**: avanza solo, muy despacio, en bucle continuo (la
  serie de hitos se duplica para que no se vea el salto). Se detiene mientras
  alguien lo mira o lo maneja y retoma a los 2,6 s; solo corre cuando la
  sección está en pantalla. Las flechas van superpuestas y semitransparentes,
  una en cada extremo, y los bordes se desvanecen bajo ellas.
  Nota: el avance no puede hacerse sumando decimales a `scrollLeft` porque el
  navegador descarta el subpíxel; la posición se acumula en una variable y se
  asigna entera en cada fotograma.
- **Accesibilidad**: enlace para saltar al contenido, foco visible, `aria-expanded`
  en menú y acordeón, y todo el movimiento respeta `prefers-reduced-motion`.
- **Reproductor**: un solo `<audio>` para toda la lista. La duración de cada
  pista se lee con un `Audio` aparte en `preload="metadata"`, que solo pide la
  cabecera del mp3. La barra de progreso es un `<input type="range">` (así el
  teclado y los lectores de pantalla funcionan sin añadir nada) y el relleno se
  pinta con un degradado que sigue a la variable `--fill`.
  Nota: `.player__aviso` usa `display:flex`, que le gana al atributo `hidden`
  del navegador; por eso hace falta la regla `.player__aviso[hidden]`.
- **Rendimiento**: sin librerías, fotos en WebP con `loading="lazy"` salvo la del
  hero, y `width`/`height` en las imágenes para evitar saltos de maquetación.
  El video va con `preload="metadata"`.

## Pendiente de datos reales

- **El mp3 de la meditación** (`assets/audio/alivio-del-dolor-emocional.mp3`).
  Mientras tanto suena desde SoundCloud, así que no corre prisa.
- **URL exactas de Facebook y TikTok** (las actuales están deducidas).
- La cifra «cientos de encuentros» está en el texto, pero no hay número exacto
  para el bloque de estadísticas; ahora muestra año de inicio, años y países.
