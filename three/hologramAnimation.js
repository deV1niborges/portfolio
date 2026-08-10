import gsap from "gsap";

import * as THREE from "three";

import {
  GLOW_INTENSITY,
  GLITCH_INTENSITY,
  SCANLINE_INTENSITY,
  CAMERA_ZOOM_DISTANCE,
  CAMERA_FOCUS_Z,
  CAMERA_FOCUS_Z_PORTRAIT,
  GLOBE_RADIUS,
  MINAS_LAT,
  MINAS_LON,
} from "./constants.js";

import { latLonToVector3 } from "./coordinates.js";

// ============================================================
// ROTAÇÃO PARA MINAS\n// ============================================================

function getRotationToFaceCamera() {
  const markerPos = latLonToVector3(
    MINAS_LAT,

    MINAS_LON,

    GLOBE_RADIUS,
  );

  const currentAngle = Math.atan2(
    markerPos.x,

    markerPos.z,
  );

  return -currentAngle;
}

// ============================================================
// ZOOM RESPONSIVO
// ============================================================

function getFocusCameraZ() {
  const portrait = window.innerHeight > window.innerWidth;

  return portrait ? CAMERA_FOCUS_Z_PORTRAIT : CAMERA_FOCUS_Z;
}

// ============================================================
// TIMELINE
// ============================================================

export function createIntroTimeline({
  globe,

  marker,

  minasState,

  camera,

  postFX,

  horizonLine,

  onComplete,
}) {
  const [baseMat, wireMat, continentsMat, glowMat] = globe.materials;

  const targetRotationY = getRotationToFaceCamera();

  const rotationZoomZ = camera.position.z - CAMERA_ZOOM_DISTANCE;

  const markerWorldPosition = new THREE.Vector3();

  // ============================================================
  // FLICKER
  // ============================================================

  const flicker = gsap.to(
    wireMat,

    {
      opacity: () => 0.15 + Math.random() * 0.11,

      duration: () => 0.08 + Math.random() * 0.3,

      repeat: -1,

      repeatRefresh: true,

      ease: "none",

      paused: true,
    },
  );

  // ============================================================
  // TIMELINE
  // ============================================================

  const tl = gsap.timeline({
    defaults: {
      ease: "power2.out",
    },

    onComplete,
  });

  // ============================================================
  // ESTADO INICIAL
  // ============================================================

  gsap.set(
    globe.group.scale,

    {
      x: 1,

      y: 0.001,

      z: 1,
    },
  );

  gsap.set(
    [baseMat, wireMat, continentsMat],

    {
      opacity: 0,
    },
  );

  gsap.set(
    glowMat.uniforms.uIntensity,

    {
      value: 0,
    },
  );

  gsap.set(
    globe.particles.material,

    {
      opacity: 0,
    },
  );

  gsap.set(
    [
      marker.backplate.material,

      marker.dot.material,

      marker.glow.material,

      marker.ring.material,
    ],

    {
      opacity: 0,
    },
  );

  gsap.set(
    marker.ring.scale,

    {
      x: 0.25,

      y: 0.25,

      z: 1,
    },
  );

  // Minas começa completamente apagada

  gsap.set(
    [
      minasState.outline.material,

      minasState.borderPixels.material,

      minasState.borderGlow.material,

      minasState.fill.material,
    ],

    {
      opacity: 0,
    },
  );

  // ============================================================
  // PROJEÇÃO
  // ============================================================

  tl.addLabel(
    "projecao",

    0.18,
  );

  tl.to(
    horizonLine.material,

    {
      opacity: 0.82,

      duration: 0.12,
    },

    "projecao",
  );

  tl.to(
    horizonLine.scale,

    {
      x: 1,

      duration: 0.2,

      ease: "power1.out",
    },

    "projecao",
  );

  // ============================================================
  // FORMAÇÃO
  // ============================================================

  tl.addLabel(
    "formacao",

    0.28,
  );

  tl.to(
    globe.group.scale,

    {
      y: 1.03,

      duration: 0.5,

      ease: "back.out(1.8)",
    },

    "formacao",
  );

  tl.to(
    globe.group.scale,

    {
      y: 1,

      duration: 0.14,

      ease: "power1.out",
    },

    "formacao+=0.5",
  );

  tl.to(
    baseMat,

    {
      opacity: 0.045,

      duration: 0.45,
    },

    "formacao",
  );

  tl.to(
    wireMat,

    {
      opacity: 0.22,

      duration: 0.5,
    },

    "formacao",
  );

  tl.to(
    continentsMat,

    {
      opacity: 0.68,

      duration: 0.5,
    },

    "formacao",
  );

  tl.to(
    glowMat.uniforms.uIntensity,

    {
      value: GLOW_INTENSITY,

      duration: 0.58,
    },

    "formacao",
  );

  tl.to(
    globe.particles.material,

    {
      opacity: 0.48,

      duration: 0.65,
    },

    "formacao",
  );

  tl.to(
    horizonLine.material,

    {
      opacity: 0,

      duration: 0.28,
    },

    "formacao+=0.25",
  );

  tl.call(
    () => {
      flicker.play();
    },

    [],

    "formacao+=0.58",
  );

  // ============================================================
  // ROTAÇÃO PARA O BRASIL
  // ============================================================

  tl.addLabel(
    "rotacao",

    "formacao+=0.64",
  );

  tl.to(
    globe.group.rotation,

    {
      y: targetRotationY,

      duration: 1.05,

      ease: "power3.inOut",
    },

    "rotacao",
  );

  // Primeiro zoom leve

  tl.to(
    camera.position,

    {
      z: rotationZoomZ,

      duration: 1.05,

      ease: "power2.inOut",
    },

    "rotacao",
  );

  // ============================================================
  // PONTO VERMELHO APARECE
  // ============================================================

  tl.addLabel(
    "minas",

    "rotacao+=1",
  );

  tl.to(
    marker.backplate.material,

    {
      opacity: 0.45,

      duration: 0.08,
    },

    "minas",
  );

  tl.to(
    marker.dot.material,

    {
      opacity: 1,

      duration: 0.08,
    },

    "minas",
  );

  tl.to(
    marker.glow.material,

    {
      opacity: 0.52,

      duration: 0.12,
    },

    "minas",
  );

  tl.fromTo(
    marker.visualGroup.scale,

    {
      x: 0.55,

      y: 0.55,

      z: 0.55,
    },

    {
      x: 1,

      y: 1,

      z: 1,

      duration: 0.2,

      ease: "back.out(2.2)",
    },

    "minas",
  );

  // ============================================================
  // PRIMEIRO PULSO
  // ============================================================

  tl.set(
    marker.ring.scale,

    {
      x: 0.3,

      y: 0.3,

      z: 1,
    },

    "minas+=0.05",
  );

  tl.to(
    marker.ring.material,

    {
      opacity: 0.82,

      duration: 0.04,
    },

    "minas+=0.05",
  );

  tl.to(
    marker.ring.scale,

    {
      x: 1.65,

      y: 1.65,

      duration: 0.35,

      ease: "power2.out",
    },

    "minas+=0.05",
  );

  tl.to(
    marker.ring.material,

    {
      opacity: 0,

      duration: 0.3,
    },

    "minas+=0.12",
  );

  // ============================================================
  // ZOOM REAL EM MINAS
  // ============================================================

  tl.addLabel(
    "focus",

    "minas+=0.28",
  );

  // pega a posição real do ponto
  // depois que o globo terminou de girar

  tl.call(
    () => {
      marker.group.getWorldPosition(markerWorldPosition);
    },

    [],

    "focus",
  );

  // ============================================================
  // CAMERA VAI ATÉ MINAS
  // ============================================================

  tl.to(
    camera.position,

    {
      x: () => markerWorldPosition.x,

      y: () => markerWorldPosition.y,

      z: () => getFocusCameraZ(),

      duration: 0.86,

      ease: "power3.inOut",
    },

    "focus",
  );

  // ============================================================
  // CONTORNO DE MINAS ACENDE
  // ============================================================

  tl.to(
    minasState.outline.material,

    {
      opacity: 0.9,

      duration: 0.42,
    },

    "focus+=0.12",
  );

  // pixels da borda

  tl.to(
    minasState.borderPixels.material,

    {
      opacity: 0.95,

      duration: 0.42,
    },

    "focus+=0.12",
  );

  // glow externo

  tl.to(
    minasState.borderGlow.material,

    {
      opacity: 0.24,

      duration: 0.42,
    },

    "focus+=0.12",
  );

  // ============================================================
  // INTERIOR DE MINAS FICA DESTACADO
  // ============================================================

  tl.to(
    minasState.fill.material,

    {
      opacity: 0.22,

      duration: 0.5,
    },

    "focus+=0.18",
  );

  // ============================================================
  // FLASH NO CONTORNO
  // ============================================================

  tl.to(
    minasState.borderGlow.material,

    {
      opacity: 0.42,

      duration: 0.1,

      yoyo: true,

      repeat: 1,
    },

    "focus+=0.68",
  );

  tl.to(
    minasState.borderGlow.material,

    {
      size: 0.066,

      duration: 0.1,

      yoyo: true,

      repeat: 1,
    },

    "focus+=0.68",
  );

  // ============================================================
  // SEGUNDO PULSO
  // ============================================================

  tl.addLabel(
    "pulse2",

    "focus+=0.64",
  );

  tl.set(
    marker.ring.scale,

    {
      x: 0.3,

      y: 0.3,

      z: 1,
    },

    "pulse2",
  );

  tl.to(
    marker.ring.material,

    {
      opacity: 0.9,

      duration: 0.04,
    },

    "pulse2",
  );

  tl.to(
    marker.ring.scale,

    {
      x: 1.9,

      y: 1.9,

      duration: 0.4,

      ease: "power2.out",
    },

    "pulse2",
  );

  tl.to(
    marker.ring.material,

    {
      opacity: 0,

      duration: 0.32,
    },

    "pulse2+=0.08",
  );

  // pequeno flash geral

  tl.to(
    glowMat.uniforms.uIntensity,

    {
      value: GLOW_INTENSITY * 1.3,

      duration: 0.09,

      yoyo: true,

      repeat: 1,
    },

    "pulse2",
  );

  // ============================================================
  // SEGURA MINAS NA TELA
  // ============================================================

  tl.addLabel(
    "holdMinas",

    "focus+=0.92",
  );

  // ============================================================
  // GLITCH
  // ============================================================

  tl.addLabel(
    "glitch",

    "holdMinas+=0.3",
  );

  tl.to(
    postFX.uniforms.uGlitchIntensity,

    {
      value: GLITCH_INTENSITY,

      duration: 0.045,

      yoyo: true,

      repeat: 2,
    },

    "glitch",
  );

  // ============================================================
  // DESLIGAMENTO
  // ============================================================

  tl.addLabel(
    "desligamento",

    "glitch+=0.28",
  );

  tl.call(
    () => {
      flicker.pause();
    },

    [],

    "desligamento",
  );

  // ============================================================
  // MINAS DESAPARECE
  // ============================================================

  tl.to(
    [
      minasState.outline.material,

      minasState.borderPixels.material,

      minasState.borderGlow.material,

      minasState.fill.material,
    ],

    {
      opacity: 0,

      duration: 0.28,
    },

    "desligamento+=0.12",
  );

  // ============================================================
  // SCANLINES
  // ============================================================

  tl.to(
    postFX.uniforms.uScanlineIntensity,

    {
      value: SCANLINE_INTENSITY * 2.15,

      duration: 0.18,
    },

    "desligamento",
  );

  // ============================================================
  // GLOW APAGA
  // ============================================================

  tl.to(
    glowMat.uniforms.uIntensity,

    {
      value: 0,

      duration: 0.42,
    },

    "desligamento",
  );

  // ============================================================
  // PARTÍCULAS APAGAM
  // ============================================================

  tl.to(
    globe.particles.material,

    {
      opacity: 0,

      duration: 0.32,
    },

    "desligamento",
  );

  // ============================================================
  // GLOBO DESAPARECE
  // ============================================================

  tl.to(
    [baseMat, wireMat, continentsMat],

    {
      opacity: 0,

      duration: 0.38,
    },

    "desligamento+=0.05",
  );

  // ============================================================
  // COLAPSO VERTICAL
  // ============================================================

  tl.to(
    globe.group.scale,

    {
      y: 0.045,

      duration: 0.44,

      ease: "power2.in",
    },

    "desligamento+=0.06",
  );

  // ============================================================
  // MARCADOR SOME POR ÚLTIMO
  // ============================================================

  tl.to(
    [
      marker.backplate.material,

      marker.dot.material,

      marker.glow.material,

      marker.ring.material,
    ],

    {
      opacity: 0,

      duration: 0.2,
    },

    "desligamento+=0.2",
  );

  // ============================================================
  // TELA PRETA
  // ============================================================

  tl.to(
    postFX.uniforms.uOpacity,

    {
      value: 0,

      duration: 0.3,
    },

    "desligamento+=0.22",
  );

  // ============================================================
  // INTRO COMPLETA
  // ============================================================

  tl.addLabel(
    "completa",

    "desligamento+=0.56",
  );

  tl.call(
    () => {
      flicker.kill();
    },

    [],

    "completa",
  );

  return tl;
}
