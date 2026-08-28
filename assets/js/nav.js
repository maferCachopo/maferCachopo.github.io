/**
 * nav.js — Cabecera fija, menú móvil y marcado de la sección activa.
 */

export function iniciarNavegacion() {
  const header = document.getElementById('header');
  const toggle = document.getElementById('nav-toggle');
  const lista = document.getElementById('nav-list');
  const enlaces = [...document.querySelectorAll('.nav__link')];

  /* --- Fondo sólido de la cabecera al bajar --- */
  const centinela = document.createElement('div');
  centinela.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
  document.body.prepend(centinela);

  new IntersectionObserver(
    ([e]) => header.classList.toggle('is-stuck', !e.isIntersecting),
    { rootMargin: '-60px 0px 0px 0px' },
  ).observe(centinela);

  /* --- Menú móvil --- */
  function cerrarMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    lista.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  toggle.addEventListener('click', () => {
    const abierto = toggle.getAttribute('aria-expanded') === 'true';
    if (abierto) {
      cerrarMenu();
      return;
    }
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
    lista.classList.add('is-open');
    document.body.classList.add('is-locked');
  });

  lista.addEventListener('click', (e) => {
    if (e.target.closest('.nav__link')) cerrarMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarMenu();
  });

  /* --- Sección activa en el menú --- */
  const secciones = enlaces
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  const espia = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        const id = entrada.target.id;
        enlaces.forEach((a) =>
          a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`),
        );
      }
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  secciones.forEach((s) => espia.observe(s));
}
