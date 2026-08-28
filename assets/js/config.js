/**
 * config.js — Único lugar que hay que tocar para cambiar datos de contacto.
 */

/**
 * Números de WhatsApp, en orden de aparición.
 * `numero` va en formato internacional y solo con dígitos (es lo que pide
 * wa.me); `visible` es como se muestra en pantalla.
 * `bandera` apunta al símbolo SVG definido al principio de index.html.
 */
export const CONTACTOS = [
  {
    pais: 'Venezuela',
    bandera: 'bandera-ve',
    numero: '584247119592',
    visible: '+58 424 711 9592',
  },
  {
    pais: 'Colombia',
    bandera: 'bandera-co',
    numero: '573028341685',
    visible: '+57 302 834 1685',
  },
  {
    pais: 'Colombia',
    bandera: 'bandera-co',
    numero: '573022458002',
    visible: '+57 302 245 8002',
  },
];

/** El que usan los botones de la página cuando no se indica otro. */
export const CONTACTO_PRINCIPAL = 0;

/** Mensajes que se autocompletan según desde dónde se pulse el botón. */
export const MENSAJES = {
  hola:
    'Hola Alberto, llegué a tu página web y me gustaría comenzar un proceso de acompañamiento.',
  reconoces:
    'Hola Alberto, me identifiqué con varias cosas de tu página y me gustaría conversar.',
  'primer-paso':
    'Hola Alberto, quiero dar el primer paso. ¿Me cuentas cómo empezamos?',
  flotante:
    'Hola Alberto, vengo de tu página web y quisiera más información.',
};

/** Construye el enlace wa.me con el mensaje ya escrito. */
export function enlaceWhatsApp(clave = 'hola', indice = CONTACTO_PRINCIPAL) {
  const contacto = CONTACTOS[indice] ?? CONTACTOS[CONTACTO_PRINCIPAL];
  const texto = MENSAJES[clave] ?? MENSAJES.hola;
  return `https://wa.me/${contacto.numero}?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ */
/* Correo de contacto                                                  */
/* ------------------------------------------------------------------ */

export const CORREO = 'albertodariochirinos@gmail.com';

/** Asuntos del correo, según desde dónde se pulse. */
export const ASUNTOS = {
  hola: 'Quiero comenzar un proceso de acompañamiento',
  'primer-paso': 'Quiero dar el primer paso',
};

/** Construye el enlace mailto con asunto y cuerpo ya escritos. */
export function enlaceCorreo(clave = 'hola') {
  const asunto = ASUNTOS[clave] ?? ASUNTOS.hola;
  const cuerpo = MENSAJES[clave] ?? MENSAJES.hola;
  return `mailto:${CORREO}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
}

/* ------------------------------------------------------------------ */
/* Redes sociales                                                      */
/* ------------------------------------------------------------------ */

/**
 * `icono` apunta al símbolo SVG definido al principio de index.html.
 *
 * OJO: solo Instagram está verificado (el @ lo dio Alberto). Los usuarios de
 * Facebook y TikTok están deducidos del de Instagram y hay que confirmarlos
 * abriendo cada perfil y copiando la URL de la barra del navegador.
 */
export const REDES = [
  {
    nombre: 'Instagram',
    usuario: '@albertodchirinos',
    url: 'https://www.instagram.com/albertodchirinos/',
    icono: 'ico-instagram',
    verificado: true,
  },
  {
    nombre: 'Facebook',
    usuario: 'Alberto Chirinos',
    url: 'https://www.facebook.com/albertodchirinos',
    icono: 'ico-facebook',
    verificado: false,
  },
  {
    nombre: 'TikTok',
    usuario: 'Alberto Chirinos',
    url: 'https://www.tiktok.com/@albertodchirinos',
    icono: 'ico-tiktok',
    verificado: false,
  },
];

/* ------------------------------------------------------------------ */
/* Meditaciones y ejercicios guiados                                   */
/* ------------------------------------------------------------------ */

/**
 * Cada pista del reproductor.
 *
 * `archivo`     ruta al mp3 dentro de assets/audio/ (es lo que suena).
 * `soundcloud`  respaldo: si el mp3 todavía no está subido, la pista suena
 *               igualmente desde SoundCloud, incrustado bajo el título.
 *               Tiene que ser la URL larga (soundcloud.com/usuario/pista):
 *               el enlace corto on.soundcloud.com no le vale al reproductor
 *               incrustado, solo redirige en el navegador.
 * `portada`     imagen cuadrada opcional; sin ella se usa el isotipo.
 *
 * Para añadir una meditación: copia el mp3 en assets/audio/ y añade aquí
 * un objeto más. El reproductor y la lista se dibujan solos.
 */
export const MEDITACIONES = [
  {
    titulo: 'Alivio del dolor emocional',
    tipo: 'Ejercicio guiado',
    descripcion:
      'Un ejercicio para acompañar el dolor que todavía duele: reconocerlo, ' +
      'darle un lugar y dejar de pelearte con él.',
    archivo: 'assets/audio/alivio-del-dolor-emocional.mp3',
    soundcloud: 'https://soundcloud.com/ser-integral/ejercicio-alivio-del-dolor',
    portada: '',
  },
];
