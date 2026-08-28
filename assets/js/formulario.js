/**
 * formulario.js — Formulario de contacto.
 *
 * La página es estática (GitHub Pages solo sirve archivos), así que aquí no
 * hay nada que reciba un envío. En lugar de dejar el botón muerto, el
 * formulario arma el mensaje con lo que se ha escrito y abre WhatsApp con
 * todo listo. Nada sale de la página hasta que la persona pulsa enviar allí.
 *
 * Si algún día quieres que llegue al correo sin salir de la web, hace falta
 * un servicio intermediario (Formspree y parecidos) y una cuenta suya.
 */

import { CONTACTOS, CONTACTO_PRINCIPAL } from './config.js';

export function iniciarFormulario() {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  const aviso = form.querySelector('#form-ok');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validar()) return;

    const d = new FormData(form);
    const texto = [
      `Hola Alberto, soy ${d.get('nombre').trim()}.`,
      `Me interesa: ${d.get('tema')}.`,
      '',
      d.get('mensaje').trim(),
      '',
      `Puedes responderme en: ${d.get('contacto').trim()}`,
    ].join('\n');

    const numero = (CONTACTOS[CONTACTO_PRINCIPAL] ?? CONTACTOS[0]).numero;
    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
      '_blank',
      'noopener',
    );

    aviso.hidden = false;
    aviso.textContent =
      'Listo: se abrió WhatsApp con tu mensaje escrito. Si no lo ves, revisa que el navegador no haya bloqueado la ventana.';
  });

  /* Validación propia en vez de la del navegador: los mensajes salen en
     español, junto a su campo, y se anuncian a los lectores de pantalla. */
  function validar() {
    let primero = null;

    for (const campo of form.querySelectorAll('[required]')) {
      const hueco = form.querySelector(`[data-error-for="${campo.id}"]`);
      const vacio = !campo.value.trim();
      campo.classList.toggle('is-invalid', vacio);
      campo.setAttribute('aria-invalid', String(vacio));
      if (hueco) hueco.textContent = vacio ? mensajeDe(campo) : '';
      if (vacio && !primero) primero = campo;
    }

    if (primero) {
      primero.focus();
      aviso.hidden = true;
      return false;
    }
    return true;
  }

  function mensajeDe(campo) {
    if (campo.id === 'f-nombre') return 'Dime cómo te llamas.';
    if (campo.id === 'f-contacto') return 'Necesito un teléfono o correo para responderte.';
    return 'Escríbeme unas líneas, aunque sea poco.';
  }

  /* El error se borra en cuanto empiezan a corregirlo. */
  form.addEventListener('input', (e) => {
    const campo = e.target;
    if (!campo.hasAttribute('required') || !campo.value.trim()) return;
    campo.classList.remove('is-invalid');
    campo.setAttribute('aria-invalid', 'false');
    const hueco = form.querySelector(`[data-error-for="${campo.id}"]`);
    if (hueco) hueco.textContent = '';
  });
}
