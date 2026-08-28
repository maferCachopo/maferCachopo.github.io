/**
 * interacciones.js — Aparición al hacer scroll, contadores, acordeón de valores,
 * lista de resonancia, riel de la trayectoria y marquesina.
 */

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Aparición progresiva ---------- */
export function iniciarReveal() {
  const elementos = document.querySelectorAll('[data-reveal]');
  if (reducido) {
    elementos.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('is-in');
        obs.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );
  elementos.forEach((el) => observador.observe(el));
}

/* ---------- Contadores de la biografía ---------- */
export function iniciarContadores() {
  const nums = document.querySelectorAll('[data-count]');

  const animar = (el) => {
    const destino = Number(el.dataset.count);
    const sufijo = el.dataset.suffix ?? '';
    // Los años se muestran tal cual; el resto cuenta desde cero.
    const desde = el.hasAttribute('data-plain') ? destino - 30 : 0;
    const duracion = 1100;
    const inicio = performance.now();

    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(desde + (destino - desde) * suave) + sufijo;
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  };

  if (reducido) {
    nums.forEach((el) => {
      el.textContent = el.dataset.count + (el.dataset.suffix ?? '');
    });
    return;
  }

  const observador = new IntersectionObserver(
    (entradas, obs) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        animar(entrada.target);
        obs.unobserve(entrada.target);
      }
    },
    { threshold: 0.6 },
  );
  nums.forEach((el) => observador.observe(el));
}

/* ---------- Acordeón de valores ---------- */
export function iniciarValores() {
  const contenedor = document.getElementById('values');
  if (!contenedor) return;

  contenedor.addEventListener('click', (e) => {
    const btn = e.target.closest('.value__btn');
    if (!btn) return;

    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const abierto = btn.getAttribute('aria-expanded') === 'true';

    // Un solo valor abierto a la vez: la lectura se mantiene tranquila.
    contenedor.querySelectorAll('.value__btn').forEach((otro) => {
      otro.setAttribute('aria-expanded', 'false');
      document
        .getElementById(otro.getAttribute('aria-controls'))
        .setAttribute('data-open', 'false');
    });

    if (!abierto) {
      btn.setAttribute('aria-expanded', 'true');
      panel.setAttribute('data-open', 'true');
    }
  });
}

/* ---------- Lista de resonancia ---------- */
export function iniciarResonancia() {
  const grid = document.getElementById('echo-grid');
  const cuenta = document.getElementById('echo-count');
  const mensaje = document.getElementById('echo-msg');
  if (!grid) return;

  const BASE =
    'No significa que estés mal. Significa que alguna parte de tu historia necesita ser comprendida, atendida y tratada con más amor.';

  const respuesta = (n) => {
    if (n === 0) return BASE;
    if (n === 1) return 'Una sola ya es suficiente para empezar a mirarla de cerca.';
    if (n <= 3)
      return 'Reconocer es el primer movimiento. Lo que se nombra deja de mandar en silencio.';
    if (n <= 5)
      return 'Varias a la vez. No es que estés mal: es que tu historia lleva tiempo pidiendo la palabra.';
    return 'Las seis. Enhorabuena: acabas de hacer el diagnóstico más honesto del día. Ahora vamos a trabajarlo con calma.';
  };

  const actualizar = () => {
    const n = grid.querySelectorAll('[aria-pressed="true"]').length;
    cuenta.textContent = n;
    mensaje.textContent = respuesta(n);
  };

  grid.addEventListener('click', (e) => {
    const chip = e.target.closest('.echo');
    if (!chip) return;
    chip.setAttribute(
      'aria-pressed',
      chip.getAttribute('aria-pressed') === 'true' ? 'false' : 'true',
    );
    actualizar();
  });
}

/* ---------- Riel de la trayectoria ----------
   Avanza solo, muy despacio, en bucle continuo. Se detiene mientras el
   visitante lo está mirando o manejando, y retoma poco después. */
export function iniciarTrayectoria() {
  const riel = document.getElementById('timeline');
  if (!riel) return;

  const VELOCIDAD = 0.28;      // píxeles por fotograma
  const ESPERA_TRAS_USO = 2600; // ms de pausa después de tocarlo

  // Se duplica la serie para que el bucle no muestre un salto al final.
  const original = riel.innerHTML;
  riel.insertAdjacentHTML('beforeend', original);
  riel.querySelectorAll('.milestone').forEach((hito, i, todos) => {
    if (i >= todos.length / 2) hito.setAttribute('aria-hidden', 'true');
  });
  const mitad = () => riel.scrollWidth / 2;

  let raf = null;
  let enPausa = false;
  let visible = false;
  let temporizador;
  // El navegador descarta los incrementos subpíxel de scrollLeft, así que la
  // posición se acumula aparte y se asigna entera en cada fotograma.
  let pos = 0;

  function paso() {
    if (!enPausa) {
      pos += VELOCIDAD;
      // Al pasar la primera serie se retrocede una vuelta exacta: invisible.
      if (pos >= mitad()) pos -= mitad();
      riel.scrollLeft = pos;
    }
    raf = requestAnimationFrame(paso);
  }

  // Mientras el visitante lo maneja, manda su posición, no la del bucle.
  riel.addEventListener('scroll', () => {
    if (enPausa) pos = riel.scrollLeft;
  }, { passive: true });

  function arrancar() {
    if (reducido || raf || !visible) return;
    raf = requestAnimationFrame(paso);
  }
  function detener() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = null;
  }

  function pausar() {
    enPausa = true;
    clearTimeout(temporizador);
  }
  function reanudar() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => { enPausa = false; }, ESPERA_TRAS_USO);
  }

  // Solo corre mientras la sección está en pantalla.
  new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      if (visible) arrancar();
      else detener();
    },
    { threshold: 0 },
  ).observe(riel);

  riel.addEventListener('pointerenter', pausar);
  riel.addEventListener('pointerleave', reanudar);
  riel.addEventListener('focusin', pausar);
  riel.addEventListener('focusout', reanudar);
  riel.addEventListener('pointerdown', pausar);
  riel.addEventListener('touchstart', pausar, { passive: true });
  riel.addEventListener('touchend', reanudar, { passive: true });
  riel.addEventListener('wheel', () => { pausar(); reanudar(); }, { passive: true });

  document.querySelectorAll('[data-rail]').forEach((btn) => {
    btn.addEventListener('click', () => {
      pausar();
      reanudar();
      const hito = riel.querySelector('.milestone');
      const paso = hito ? hito.offsetWidth + 1 : riel.clientWidth * 0.8;
      const destino = riel.scrollLeft + (btn.dataset.rail === 'next' ? paso : -paso);
      // El bucle también aplica a las flechas: nunca se llega a un extremo.
      if (destino < 0) riel.scrollLeft += mitad();
      riel.scrollBy({
        left: btn.dataset.rail === 'next' ? paso : -paso,
        behavior: reducido ? 'auto' : 'smooth',
      });
    });
  });
}

/* ---------- Marquesina infinita ---------- */
export function iniciarMarquesina() {
  document.querySelectorAll('[data-marquee]').forEach((cinta) => {
    // Se duplica el contenido para que el bucle no muestre huecos.
    cinta.innerHTML += cinta.innerHTML;
  });
}
