/**
 * reproductor.js — Reproductor de meditaciones.
 *
 * Dibuja la lista a partir de MEDITACIONES (config.js) y maneja un único
 * <audio>. Si un mp3 todavía no está subido, la pista no se rompe: se marca
 * como no disponible y ofrece el enlace de SoundCloud.
 */

import { MEDITACIONES } from './config.js';

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function iniciarReproductor() {
  const raiz = document.getElementById('player');
  if (!raiz || !MEDITACIONES.length) return;

  const audio = raiz.querySelector('#player-audio');
  const lista = raiz.querySelector('#player-lista');
  const portada = raiz.querySelector('#player-portada');
  const tipo = raiz.querySelector('#player-tipo');
  const titulo = raiz.querySelector('#player-titulo');
  const desc = raiz.querySelector('#player-desc');
  const aviso = raiz.querySelector('#player-aviso');
  const hueco = raiz.querySelector('#player-sc');
  const btnPlay = raiz.querySelector('#player-play');
  const btnPrev = raiz.querySelector('#player-prev');
  const btnNext = raiz.querySelector('#player-next');
  const barra = raiz.querySelector('#player-seek');
  const actual = raiz.querySelector('#player-actual');
  const total = raiz.querySelector('#player-total');
  const volumen = raiz.querySelector('#player-vol');

  let indice = 0;
  let arrastrando = false;
  const filas = [];
  /* Pistas cuyo mp3 no se pudo cargar: no se vuelve a intentar. */
  const rotas = new Set();

  /* ---------- Lista de pistas ---------- */
  MEDITACIONES.forEach((pista, i) => {
    const li = document.createElement('li');
    li.className = 'track';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'track__btn';
    boton.innerHTML = [
      '<span class="track__n" aria-hidden="true"></span>',
      '<span class="track__icon" aria-hidden="true">',
      '<svg class="track__play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
      '<svg class="track__pause" viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3.5v14H7zm6.5 0H17v14h-3.5z"/></svg>',
      '</span>',
      '<span class="track__txt">',
      '<span class="track__titulo"></span><span class="track__tipo"></span>',
      '</span>',
      '<span class="track__dur">--:--</span>',
    ].join('');
    boton.querySelector('.track__n').textContent = String(i + 1).padStart(2, '0');
    boton.querySelector('.track__titulo').textContent = pista.titulo;
    boton.querySelector('.track__tipo').textContent = pista.tipo;
    boton.setAttribute('aria-label', 'Reproducir ' + pista.titulo);
    boton.addEventListener('click', () => {
      // Sin mp3 no hay nada que reproducir aquí: se abre SoundCloud.
      if (rotas.has(i) && pista.soundcloud) {
        window.open(pista.soundcloud, '_blank', 'noopener');
        return;
      }
      if (i === indice) alternar();
      else cargar(i, true);
    });

    li.append(boton);
    lista.append(li);
    filas.push({ li, boton, dur: boton.querySelector('.track__dur') });

    comprobar(i, pista);
  });

  /**
   * ¿Está el mp3 en su sitio?
   *
   * No basta con esperar el evento `error` del <audio>: si el archivo no
   * existe, Chrome puede dejar la carga colgada sin avisar nunca, y entonces
   * la pista se quedaría muda y sin explicación. Una petición HTTP normal sí
   * responde siempre. Solo si el archivo está se le pide la duración.
   */
  async function comprobar(i, pista) {
    let existe = false;
    try {
      const respuesta = await fetch(pista.archivo, { method: 'HEAD' });
      existe = respuesta.ok;
    } catch {
      existe = false;
    }
    if (!existe) {
      marcarRota(i);
      return;
    }

    /* La duración se lee con un <audio> aparte, que solo pide los metadatos. */
    const sonda = new Audio();
    sonda.preload = 'metadata';
    sonda.addEventListener('loadedmetadata', () => {
      filas[i].dur.textContent = reloj(sonda.duration);
      if (i === indice) total.textContent = reloj(sonda.duration);
    });
    sonda.addEventListener('error', () => marcarRota(i));
    sonda.src = pista.archivo;
  }

  /* ---------- Estado ---------- */
  function marcarRota(i) {
    if (rotas.has(i)) return;
    rotas.add(i);
    filas[i].li.classList.add('is-missing');
    filas[i].dur.textContent = 'SoundCloud';
    if (MEDITACIONES[i].soundcloud) {
      filas[i].boton.setAttribute(
        'aria-label',
        'Escuchar ' + MEDITACIONES[i].titulo + ' en SoundCloud (se abre en otra pestaña)',
      );
    }
    if (i !== indice) return;
    // Cortamos la carga que se quedó a medias, o seguiría pendiente sin fin.
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    pintar(i);
  }

  function pintar(i) {
    const pista = MEDITACIONES[i];
    tipo.textContent = pista.tipo;
    titulo.textContent = pista.titulo;
    desc.textContent = pista.descripcion || '';
    portada.src = pista.portada || 'assets/img/isotipo.png';

    filas.forEach((f, n) => f.li.classList.toggle('is-current', n === i));

    /* Sin mp3 la pista suena desde SoundCloud, incrustado aquí mismo. Los
       controles de arriba se apagan: no mandan sobre ese reproductor. */
    const rota = rotas.has(i);
    raiz.classList.toggle('is-unavailable', rota);
    if (rota && pista.soundcloud) {
      aviso.hidden = false;
      aviso.querySelector('a').href = pista.soundcloud;
      incrustar(pista.soundcloud, pista.titulo);
    } else {
      aviso.hidden = true;
      hueco.replaceChildren();
    }
    btnPlay.disabled = rota;
    barra.disabled = rota;
  }

  /**
   * Reproductor incrustado de SoundCloud, teñido con el taupe de la marca.
   * Solo se crea cuando hace falta; así la página no pide nada a SoundCloud
   * mientras los mp3 estén en su sitio.
   */
  function incrustar(url, nombre) {
    if (hueco.dataset.url === url) return;
    const parametros = new URLSearchParams({
      url,
      color: '#b49c89',
      auto_play: 'false',
      hide_related: 'true',
      show_comments: 'false',
      show_user: 'true',
      show_reposts: 'false',
      show_teaser: 'false',
      visual: 'false',
    });
    const marco = document.createElement('iframe');
    marco.src = 'https://w.soundcloud.com/player/?' + parametros;
    marco.title = nombre + ' — reproductor de SoundCloud';
    marco.width = '100%';
    marco.height = '166';
    marco.loading = 'lazy';
    marco.frameBorder = '0';
    marco.allow = 'autoplay';
    hueco.replaceChildren(marco);
    hueco.dataset.url = url;
  }

  function cargar(i, reproducir = false) {
    indice = (i + MEDITACIONES.length) % MEDITACIONES.length;
    pintar(indice);
    barra.value = '0';
    barra.style.setProperty('--fill', '0%');
    actual.textContent = '0:00';
    const conocida = filas[indice].dur.textContent;
    total.textContent = conocida.includes(':') ? conocida : '--:--';

    if (rotas.has(indice)) {
      audio.pause();
      audio.removeAttribute('src');
      return;
    }
    audio.src = MEDITACIONES[indice].archivo;
    if (reproducir) audio.play().catch(() => {});
  }

  function alternar() {
    if (rotas.has(indice)) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  /* ---------- Controles ---------- */
  btnPlay.addEventListener('click', alternar);
  btnPrev.addEventListener('click', () => {
    // Como en cualquier reproductor: si ya avanzó, «anterior» rebobina.
    if (audio.currentTime > 3) audio.currentTime = 0;
    else cargar(indice - 1, !audio.paused);
  });
  btnNext.addEventListener('click', () => cargar(indice + 1, !audio.paused));

  audio.addEventListener('play', () => {
    raiz.classList.add('is-playing');
    btnPlay.setAttribute('aria-label', 'Pausar');
    btnPlay.setAttribute('aria-pressed', 'true');
  });
  audio.addEventListener('pause', () => {
    raiz.classList.remove('is-playing');
    btnPlay.setAttribute('aria-label', 'Reproducir');
    btnPlay.setAttribute('aria-pressed', 'false');
  });
  audio.addEventListener('ended', () => {
    if (MEDITACIONES.length > 1) cargar(indice + 1, true);
  });
  audio.addEventListener('error', () => {
    if (audio.getAttribute('src')) marcarRota(indice);
  });

  audio.addEventListener('loadedmetadata', () => {
    total.textContent = reloj(audio.duration);
    filas[indice].dur.textContent = reloj(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    if (arrastrando || !audio.duration) return;
    barra.value = String((audio.currentTime / audio.duration) * 100);
    actual.textContent = reloj(audio.currentTime);
    barra.style.setProperty('--fill', barra.value + '%');
  });

  /* La barra es un <input range>: teclado y lector de pantalla, gratis. */
  barra.addEventListener('input', () => {
    arrastrando = true;
    barra.style.setProperty('--fill', barra.value + '%');
    if (audio.duration) {
      actual.textContent = reloj((Number(barra.value) / 100) * audio.duration);
    }
  });
  barra.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (Number(barra.value) / 100) * audio.duration;
    arrastrando = false;
  });

  volumen.addEventListener('input', () => {
    audio.volume = Number(volumen.value) / 100;
    raiz.classList.toggle('is-muted', audio.volume === 0);
    volumen.style.setProperty('--fill', volumen.value + '%');
  });
  audio.volume = Number(volumen.value) / 100;
  volumen.style.setProperty('--fill', volumen.value + '%');

  cargar(0);
  if (reducido) raiz.classList.add('is-still');
}

/** Segundos → m:ss (o h:mm:ss si hiciera falta). */
function reloj(segundos) {
  if (!Number.isFinite(segundos)) return '--:--';
  const s = Math.floor(segundos % 60);
  const m = Math.floor((segundos / 60) % 60);
  const h = Math.floor(segundos / 3600);
  const dos = (n) => String(n).padStart(2, '0');
  return h ? h + ':' + dos(m) + ':' + dos(s) : m + ':' + dos(s);
}
