/**
 * main.js — Punto de entrada. Arranca cada módulo de la página.
 */

import { iniciarNavegacion } from './nav.js';
import { iniciarWhatsApp } from './whatsapp.js';
import { iniciarEnlaces } from './enlaces.js';
import { iniciarReproductor } from './reproductor.js';
import { iniciarVideo } from './video.js';
import { iniciarFormulario } from './formulario.js';
import {
  iniciarReveal,
  iniciarContadores,
  iniciarValores,
  iniciarResonancia,
  iniciarTrayectoria,
  iniciarMarquesina,
} from './interacciones.js';

function iniciar() {
  iniciarWhatsApp();
  iniciarEnlaces();
  iniciarNavegacion();
  iniciarReproductor();
  iniciarVideo();
  iniciarFormulario();
  iniciarReveal();
  iniciarContadores();
  iniciarValores();
  iniciarResonancia();
  iniciarTrayectoria();
  iniciarMarquesina();

  const anio = document.getElementById('year');
  if (anio) anio.textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}
