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
import { initSkillsAnimation } from "./animations/skillsAnimation.js";
import { initProjectsAnimation } from "./animations/projectsAnimation.js";
import { initPortfolioAnimations } from "./animations/scrollAnimations.js";

// ============================================================
// THREE.JS / INTRO
// ============================================================

const canvas = document.getElementById("webgl");

const {
  scene,
  camera,
  renderer,
  getRenderSize,
  onResize,
} = createSceneContext(canvas);

const introRoot = new THREE.Group();
scene.add(introRoot);

const globe = createGlobe();
introRoot.add(globe.group);

const marker = createMarker();
globe.group.add(marker.group);

// O destaque de Minas usa a malha remota quando disponível e cai
// para um objeto vazio se a conexão falhar. A intro continua.
const minasState = await createMinasStateHighlight();
globe.group.add(minasState.group);

const horizonLine = createHorizonLine();
introRoot.add(horizonLine);

const initialSize = getRenderSize();
const postFX = createPostFX(renderer, initialSize.width, initialSize.height);

onResize((size) => {
  postFX.setSize(size.width, size.height);

  updateResponsiveIntroLayout({
    camera,
    introRoot,
    marker,
    viewportWidth: size.viewportWidth,
    viewportHeight: size.viewportHeight,
  });
});

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
const clock = new THREE.Clock();

let introComplete = false;
let animationFrameId = null;
let portfolioStarted = false;

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  if (!introComplete) {
    globe.particles.rotation.y = elapsed * 0.025;
    globe.particles.rotation.x = Math.sin(elapsed * 0.35) * 0.012;
  }

  postFX.render(scene, camera, elapsed);
}

// ============================================================
// INICIA O PORTFÓLIO HTML
// ============================================================

function startPortfolio() {
  if (portfolioStarted) return;
  portfolioStarted = true;

  document.documentElement.classList.add("portfolio-ready");

  // Garante que o documento volte a usar o scroll nativo do navegador.
  // O <html> é o único scroll container; o body não cria um scroll interno.
  document.documentElement.style.overflowY = "auto";
  document.body.style.overflow = "visible";

  // Registra todas as animações de scroll e interações uma única vez.
  initAboutAnimation();
  initSkillsAnimation();
  initProjectsAnimation();
  initPortfolioAnimations();

  // O Hero é a única seção que entra sem depender do scroll.
  createHeroTimeline();
}

// ============================================================
// INTRO COMPLETA
// ============================================================

function onIntroComplete() {
  if (introComplete) return;
  introComplete = true;

  document.documentElement.classList.add("intro-complete");
  window.dispatchEvent(new CustomEvent("introComplete"));

  requestAnimationFrame(() => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
    }

    animationFrameId = null;

    // Usuários com preferência por menos movimento não precisam
    // aguardar toda a tela intermediária.
    if (motionPreference.matches) {
      startPortfolio();
      return;
    }

    createWelcomeTimeline({
      onComplete: startPortfolio,
    });
  });
}

// ============================================================
// START
// ============================================================

if (motionPreference.matches) {
  postFX.uniforms.uOpacity.value = 0;
  canvas.setAttribute("aria-hidden", "true");
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

animate();
