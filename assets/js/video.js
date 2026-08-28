/**
 * video.js — El video arranca solo al llegar a su sección y se detiene al salir.
 *
 * Los navegadores solo dejan arrancar un video sin que nadie lo pida si va en
 * silencio; por eso empieza mudo y hay un botón para darle sonido. Si alguien
 * lo pausa a mano, ya no vuelve a arrancar solo: mandar sobre el reproductor
 * es suyo a partir de ahí.
 */

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarVideo() {
  const video = document.getElementById('video-alberto');
  const boton = document.getElementById('video-sonido');
  if (!video) return;

  /* Se pone aquí y no en el marcado para que, si el JavaScript no llega a
     ejecutarse, el video quede con su sonido y sus controles de siempre. */
  video.muted = true;

  let manda = false;    // ¿ha tomado el mando la persona?
  let aLaVista = false; // ¿está la sección en pantalla?

  video.addEventListener('pause', () => {
    // Solo cuenta como decisión suya si el video estaba a la vista.
    if (aLaVista) manda = true;
  });
  video.addEventListener('ended', () => {
    manda = true;
  });

  if (boton) {
    boton.addEventListener('click', () => {
      video.muted = !video.muted;
      pintarBoton();
      // Dar sonido es querer verlo: si estaba parado, que siga.
      if (!video.muted && video.paused) video.play().catch(() => {});
    });
    video.addEventListener('volumechange', pintarBoton);
    pintarBoton();
  }

  function pintarBoton() {
    const mudo = video.muted || video.volume === 0;
    boton.setAttribute('aria-pressed', String(!mudo));
    boton.classList.toggle('is-on', !mudo);
    boton.querySelector('.videoblock__sonido-txt').textContent = mudo
      ? 'Activar sonido'
      : 'Silenciar';
  }

  /* Quien haya pedido menos movimiento no quiere un video arrancando solo. */
  if (reducido) return;

  /* Tampoco se arranca solo si el teléfono avisa de que los datos cuestan o
     la conexión es lenta: son 23 MB, y gastárselos sin permiso está feo.
     Ahí el video se queda esperando, con su botón de play de siempre. */
  const red = navigator.connection;
  if (red && (red.saveData || /^([23]g|slow-2g)$/.test(red.effectiveType ?? ''))) return;

  const observador = new IntersectionObserver(
    ([entrada]) => {
      aLaVista = entrada.isIntersecting;
      if (aLaVista) {
        if (!manda) video.play().catch(() => {});
        return;
      }
      // Al salir de pantalla se pausa siempre: nadie quiere oír una voz
      // saliendo de una sección que ya dejó atrás.
      if (!video.paused) video.pause();
    },
    { threshold: 0.55 },
  );
  observador.observe(video);
}
