import * as THREE from "three";

import { createSceneContext } from "./three/scene.js";

import { createGlobe, createHorizonLine } from "./three/globe.js";

import { createMarker } from "./three/marker.js";

import { createMinasStateHighlight } from "./three/minasState.js";

import { createPostFX } from "./three/postFX.js";

import { createIntroTimeline } from "./three/hologramAnimation.js";

import { updateResponsiveIntroLayout } from "./three/responsive.js";

import { createWelcomeTimeline } from "./animations/welcomeAnimation.js";

import { createHeroTimeline } from "./animations/heroAnimation.js";

import { initAboutAnimation } from "./animations/aboutAnimation.js";

// ============================================================
// CANVAS / SCENE
// ============================================================

const canvas = document.getElementById("webgl");

const {
  scene,

  camera,

  renderer,

  getRenderSize,

  onResize,
} = createSceneContext(canvas);

// ============================================================
// ROOT RESPONSIVO
// ============================================================

const introRoot = new THREE.Group();

scene.add(introRoot);

// ============================================================
// GLOBO
// ============================================================

const globe = createGlobe();

introRoot.add(globe.group);

// ============================================================
// MARCADOR\n// ============================================================

const marker = createMarker();

globe.group.add(marker.group);

// ============================================================
// MINAS GERAIS
// ============================================================

// Carrega o contorno real do estado.
//
// Se a API não responder,
// a intro continua normalmente.

const minasState = await createMinasStateHighlight();

globe.group.add(minasState.group);

// ============================================================
// LINHA DE PROJEÇÃO
// ============================================================

const horizonLine = createHorizonLine();

introRoot.add(horizonLine);

// ============================================================
// POST FX
// ============================================================

const initialSize = getRenderSize();

const postFX = createPostFX(
  renderer,

  initialSize.width,

  initialSize.height,
);

// ============================================================
// RESPONSIVIDADE
// ============================================================

onResize((size) => {
  postFX.setSize(
    size.width,

    size.height,
  );

  updateResponsiveIntroLayout({
    camera,

    introRoot,

    marker,

    viewportWidth: size.viewportWidth,

    viewportHeight: size.viewportHeight,
  });
});

// ============================================================
// ACESSIBILIDADE
// ============================================================

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

// ============================================================
// RENDER LOOP
// ============================================================

const clock = new THREE.Clock();

let introComplete = false;

let animationFrameId = null;

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  if (!introComplete) {
    globe.particles.rotation.y = elapsed * 0.025;

    globe.particles.rotation.x = Math.sin(elapsed * 0.35) * 0.012;
  }

  postFX.render(
    scene,

    camera,

    elapsed,
  );
}

// ============================================================
// INTRO COMPLETA
// ============================================================

function onIntroComplete() {
  if (introComplete) {
    return;
  }

  introComplete = true;

  document.documentElement.classList.add("intro-complete");

  window.dispatchEvent(new CustomEvent("introComplete"));

  // ============================================================
  // PARA O THREE.JS
  // ============================================================

  requestAnimationFrame(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = null;

    // ========================================================
    // COMEÇA O "BEM-VINDO"
    // ========================================================

    createWelcomeTimeline({
      onComplete() {
        createHeroTimeline();

        initAboutAnimation();
      },
    });
  });
  // ============================================================
  // REDUCED MOTION
  // ============================================================

  if (motionPreference.matches) {
    postFX.uniforms.uOpacity.value = 0;

    canvas.setAttribute(
      "aria-hidden",

      "true",
    );

    requestAnimationFrame(onIntroComplete);
  } else {
    createIntroTimeline({
      globe,

      marker,

      minasState,

      camera,

      postFX,

      horizonLine,

      onComplete: onIntroComplete,
    });
  }

  // ============================================================
  // START
  // ============================================================

  animate();
}
