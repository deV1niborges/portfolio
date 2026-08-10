import * as THREE from "three";
import { DPR_MAX, PIXEL_SIZE, CAMERA_START_Z } from "./constants.js";

/**
 * Monta o "esqueleto" da cena Three.js: Scene, Camera, Renderer, e
 * cuida do resize responsivo.
 *
 * Detalhe importante: o renderer aqui NUNCA desenha direto pro
 * canvas visível — quem faz isso é o postFX (ver postFX.js). Aqui a
 * gente só prepara o renderer e calcula em que RESOLUÇÃO INTERNA ele
 * deve trabalhar, que é menor que o tamanho real da tela (dividida
 * por PIXEL_SIZE). É essa resolução reduzida, ampliada depois pelo
 * navegador sem suavizar (`image-rendering: pixelated` no CSS), que
 * cria o efeito pixelado.
 */
export function createSceneContext(canvas) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(0, 0, CAMERA_START_Z);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // com a pixelização, suavizar bordas não faz sentido
    alpha: true,
  });
  renderer.setClearColor(0x000000, 1);

  function getRenderSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAX);
    const width = Math.max(
      1,
      Math.floor((window.innerWidth * dpr) / PIXEL_SIZE),
    );
    const height = Math.max(
      1,
      Math.floor((window.innerHeight * dpr) / PIXEL_SIZE),
    );
    return { width, height };
  }

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    const { width, height } = getRenderSize();
    renderer.setPixelRatio(1); // o DPR já foi aplicado manualmente acima
    renderer.setSize(width, height, false); // false = não mexe no tamanho CSS do canvas
  }

  resize();
  window.addEventListener("resize", resize);

  return {
    scene,
    camera,
    renderer,
    resize,
    getRenderSize,
  };
}
