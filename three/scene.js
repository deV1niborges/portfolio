import * as THREE from 'three';
import {
  DPR_MAX,
  PIXEL_SIZE,
  PIXEL_SIZE_TABLET,
  PIXEL_SIZE_MOBILE,
  CAMERA_START_Z,
} from './constants.js';

/**
 * Cria Scene, Camera e Renderer e centraliza toda a lógica de resize.
 *
 * O renderer trabalha numa resolução interna menor que a viewport.
 * O canvas é ampliado pelo CSS com `image-rendering: pixelated`, o que
 * mantém o aspecto de holograma digital sem exigir um shader pesado.
 */
export function createSceneContext(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA_START_Z);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(1);

  const resizeCallbacks = new Set();
  let resizeFrame = null;

  function getViewportSize() {
    return {
      width: Math.max(1, window.innerWidth),
      height: Math.max(1, window.innerHeight),
    };
  }

  function getPixelSize(viewportWidth) {
    if (viewportWidth <= 520) return PIXEL_SIZE_MOBILE;
    if (viewportWidth <= 900) return PIXEL_SIZE_TABLET;
    return PIXEL_SIZE;
  }

  function getRenderSize() {
    const viewport = getViewportSize();
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    const pixelSize = getPixelSize(viewport.width);

    return {
      width: Math.max(1, Math.floor((viewport.width * dpr) / pixelSize)),
      height: Math.max(1, Math.floor((viewport.height * dpr) / pixelSize)),
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
      pixelSize,
    };
  }

  function resize() {
    const size = getRenderSize();

    camera.aspect = size.viewportWidth / size.viewportHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height, false);

    resizeCallbacks.forEach((callback) => callback(size));
  }

  function scheduleResize() {
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      resize();
    });
  }

  function onResize(callback) {
    resizeCallbacks.add(callback);
    callback(getRenderSize());
    return () => resizeCallbacks.delete(callback);
  }

  resize();
  window.addEventListener('resize', scheduleResize, { passive: true });
  window.addEventListener('orientationchange', scheduleResize, { passive: true });
  window.visualViewport?.addEventListener('resize', scheduleResize, { passive: true });

  return {
    scene,
    camera,
    renderer,
    resize,
    onResize,
    getRenderSize,
    getViewportSize,
  };
}
