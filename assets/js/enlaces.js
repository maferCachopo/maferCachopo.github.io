/**
 * enlaces.js — Correo y redes sociales.
 *
 * [data-mail]         recibe el enlace mailto; [data-mail-asunto] elige el asunto.
 * [data-mail-visible] escribe la dirección en pantalla desde config.js.
 * [data-redes]        se rellena con la lista de perfiles.
 */

import { CORREO, REDES, enlaceCorreo } from './config.js';

export function iniciarEnlaces() {
  document.querySelectorAll('[data-mail]').forEach((el) => {
    el.href = enlaceCorreo(el.dataset.mailAsunto);
  });

  document.querySelectorAll('[data-mail-visible]').forEach((el) => {
    el.textContent = CORREO;
  });

  document.querySelectorAll('[data-redes]').forEach(dibujarRedes);
}

/** Un enlace por red, con su icono SVG (definido al inicio de index.html). */
function dibujarRedes(contenedor) {
  const conTexto = contenedor.hasAttribute('data-redes-texto');
  contenedor.replaceChildren();

  for (const red of REDES) {
    const a = document.createElement('a');
    a.className = 'red';
    a.href = red.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', red.nombre + ' — ' + red.usuario);
    a.innerHTML =
      '<svg class="red__icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<use href="#' + red.icono + '"/></svg>';

    /* En el pie va solo el nombre, en un renglón, para que la columna tenga
       el mismo ritmo que «Secciones» o «Dónde estamos». El usuario ya va en
       el aria-label y en el propio enlace. */
    if (conTexto) {
      const txt = document.createElement('span');
      txt.className = 'red__nombre';
      txt.textContent = red.nombre;
      a.append(txt);
    }

    contenedor.append(a);
  }
}
