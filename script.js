import * as THREE from 'three';
import { createSceneContext } from './three/scene.js';
import { createGlobe, createHorizonLine } from './three/globe.js';
import { createMarker } from './three/marker.js';
import { createPostFX } from './three/postFX.js';
import { createIntroTimeline } from './three/hologramAnimation.js';
import { ROTATION_SPEED, GLOW_INTENSITY } from './three/constants.js';

const canvas = document.getElementById('webgl');
const { scene, camera, renderer, getRenderSize } = createSceneContext(canvas);

// --- Monta a cena ---
const globe = createGlobe();
scene.add(globe.group);

const marker = createMarker();
globe.group.add(marker.group); // filho do globo: gira junto com ele automaticamente

const horizonLine = createHorizonLine();
scene.add(horizonLine);

const { width, height } = getRenderSize();
const postFX = createPostFX(renderer, width, height);

window.addEventListener('resize', () => {
  const size = getRenderSize();
  postFX.setSize(size.width, size.height);
});

// --- Acessibilidade: prefers-reduced-motion ---
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Loop de render ---
const clock = new THREE.Clock();
let introFinished = false;

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Rotação contínua e sutil, mantendo o holograma "vivo" depois da intro.
  if (introFinished) {
    globe.group.rotation.y += ROTATION_SPEED * delta;
  }

  postFX.render(scene, camera, elapsed);
}

function onIntroComplete() {
  introFinished = true;
  // Evento simples pra quem for construir a próxima etapa (texto de
  // boas-vindas, etc) saber que pode começar.
  window.dispatchEvent(new CustomEvent('introComplete'));
}

if (prefersReducedMotion) {
  // Pula a coreografia inteira: os materiais do globo já nascem com
  // opacidades "formadas" (definidas em three/globe.js), então só
  // precisamos garantir a escala e ligar o glow e o marcador — sem
  // nenhuma das animações de projeção/rotação/zoom/glitch.
  globe.group.scale.set(1, 1, 1);
  globe.glowSphere.material.uniforms.uIntensity.value = GLOW_INTENSITY;
  marker.dot.material.opacity = 1;
  marker.glow.material.opacity = 0.6;
  setTimeout(onIntroComplete, 400);
} else {
  createIntroTimeline({
    globe, marker, camera, postFX, horizonLine, onComplete: onIntroComplete,
  });
}

animate();
