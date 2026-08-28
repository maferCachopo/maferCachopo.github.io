/**
 * whatsapp.js — Enlaces de contacto y desplegable del botón flotante.
 *
 * Cualquier elemento con [data-wa] recibe el enlace; [data-wa-msg] elige el
 * mensaje precargado y [data-wa-num] el número (índice en CONTACTOS).
 */

import { CONTACTOS, enlaceWhatsApp } from './config.js';

export function iniciarWhatsApp() {
  document.querySelectorAll('[data-wa]').forEach((el) => {
    el.href = enlaceWhatsApp(el.dataset.waMsg, Number(el.dataset.waNum ?? 0));
    el.target = '_blank';
    el.rel = 'noopener';
  });

  // Los números visibles se escriben desde config.js, no a mano en el HTML.
  document.querySelectorAll('[data-wa-visible]').forEach((el) => {
    const contacto = CONTACTOS[Number(el.dataset.waVisible)];
    if (contacto) el.textContent = contacto.visible;
  });

  iniciarFlotante();
}

/** El botón flotante despliega la lista de números en lugar de abrir uno. */
function iniciarFlotante() {
  const fab = document.getElementById('fab');
  const boton = document.getElementById('fab-btn');
  const panel = document.getElementById('fab-panel');
  const hero = document.getElementById('inicio');
  if (!fab || !boton || !panel) return;

  const abrir = (si) => {
    boton.setAttribute('aria-expanded', String(si));
    panel.toggleAttribute('hidden', !si);
    fab.classList.toggle('is-open', si);
  };

  boton.addEventListener('click', (e) => {
    e.stopPropagation();
    abrir(boton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('click', (e) => {
    if (!fab.contains(e.target)) abrir(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (boton.getAttribute('aria-expanded') !== 'true') return;
    abrir(false);
    boton.focus();
  });

  // Al elegir un número se cierra, para no dejarlo abierto al volver.
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a')) abrir(false);
  });

  /* Aparece una vez pasado el hero. */
  if (!hero) return;
  new IntersectionObserver(
    ([e]) => {
      fab.classList.toggle('is-visible', !e.isIntersecting);
      if (e.isIntersecting) abrir(false);
    },
    { threshold: 0, rootMargin: '-40% 0px 0px 0px' },
  ).observe(hero);
}
