import gsap from 'gsap';
import {
  GLOW_INTENSITY, GLITCH_INTENSITY, SCANLINE_INTENSITY,
  CAMERA_ZOOM_DISTANCE, GLOBE_RADIUS, MINAS_LAT, MINAS_LON,
} from './constants.js';
import { latLonToVector3 } from './coordinates.js';

/**
 * Calcula quanto girar o globo (em torno do eixo Y) pra trazer o
 * marcador de Minas Gerais — e, com ele, a América do Sul/Brasil —
 * pra uma posição de frente pra câmera (que fica parada olhando na
 * direção -Z, a partir de um ponto com Z positivo).
 *
 * A conta: pegamos a posição do marcador ANTES de qualquer rotação
 * (rotation.y = 0) e olhamos só pro plano XZ (é em volta do eixo Y
 * que o globo vai girar, então a altura Y do ponto não muda).
 * `Math.atan2(x, z)` dá o ângulo atual desse ponto em relação ao
 * eixo +Z. Girar o grupo por exatamente o ângulo oposto (-ângulo)
 * traz esse ponto pra cima do eixo +Z — de frente pra câmera.
 */
function getRotationToFaceCamera() {
  const markerPos = latLonToVector3(MINAS_LAT, MINAS_LON, GLOBE_RADIUS);
  const currentAngle = Math.atan2(markerPos.x, markerPos.z);
  return -currentAngle;
}

/**
 * Monta toda a sequência de entrada/saída do holograma numa única
 * gsap.timeline(), seguindo exatamente a ordem pedida:
 *
 * PROJEÇÃO -> GLOBO FORMADO -> ROTAÇÃO -> ZOOM -> MINAS GERAIS
 * -> PULSE -> GLITCH -> DESLIGAMENTO -> INTRO COMPLETA
 *
 * Cada `.addLabel('nome', tempo)` marca um ponto no tempo total da
 * timeline, e os `.to(..., 'nome')` ou `.to(..., 'nome+=0.3')`
 * seguintes se posicionam relativos a esse label. É isso que
 * substitui dezenas de gsap.to() soltos: toda a coreografia fica
 * legível num único lugar, na ordem em que ela acontece.
 */
export function createIntroTimeline({
  globe, marker, camera, postFX, horizonLine, onComplete,
}) {
  const [baseMat, wireMat, continentsMat, glowMat] = globe.materials;
  const targetRotationY = getRotationToFaceCamera();
  const zoomTargetZ = camera.position.z - CAMERA_ZOOM_DISTANCE;

  // Flicker contínuo e sutil no wireframe, enquanto o globo está
  // "vivo" (formado). Usamos valores gerados por função em vez de
  // números fixos, junto com `repeatRefresh: true`, pra que o GSAP
  // sorteie um novo valor/duração a cada repetição — isso que dá a
  // sensação de instabilidade de sinal, sem precisar escrever nosso
  // próprio código de ruído no loop de render.
  const flicker = gsap.to(wireMat, {
    opacity: () => 0.16 + Math.random() * 0.16,
    duration: () => 0.05 + Math.random() * 0.35,
    repeat: -1,
    repeatRefresh: true,
    ease: 'none',
    paused: true,
  });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete,
  });

  // ---------- ESTADO INICIAL: tudo invisível/achatado ----------
  gsap.set(globe.group.scale, { x: 1, y: 0.001, z: 1 });
  gsap.set([baseMat, wireMat, continentsMat], { opacity: 0 });
  gsap.set(glowMat.uniforms.uIntensity, { value: 0 });
  gsap.set(globe.particles.material, { opacity: 0 });
  gsap.set([marker.dot.material, marker.glow.material, marker.ring.material], { opacity: 0 });
  gsap.set(marker.ring.scale, { x: 0.3, y: 0.3 });

  // ---------- PROJEÇÃO (a faixa/linha que anuncia o globo) ----------
  tl.addLabel('projecao', 0.2);
  tl.to(horizonLine.material, { opacity: 0.9, duration: 0.15 }, 'projecao');
  tl.to(horizonLine.scale, { x: 1, duration: 0.2, ease: 'power1.out' }, 'projecao');

  // ---------- GLOBO FORMADO (constrói de baixo pra cima) ----------
  tl.addLabel('formacao', 0.3);
  tl.to(globe.group.scale, {
    y: 1.03, // overshoot: passa um pouco do tamanho final...
    duration: 0.5,
    ease: 'back.out(2)',
  }, 'formacao');
  tl.to(globe.group.scale, {
    y: 1, // ...e estabiliza rapidamente. Sensação mais cartunesca
    duration: 0.15, // que fisicamente realista, como pedido.
    ease: 'power1.out',
  }, 'formacao+=0.5');
  tl.to(baseMat, { opacity: 0.06, duration: 0.5 }, 'formacao');
  tl.to(wireMat, { opacity: 0.25, duration: 0.5 }, 'formacao');
  tl.to(continentsMat, { opacity: 0.9, duration: 0.5 }, 'formacao');
  tl.to(glowMat.uniforms.uIntensity, { value: GLOW_INTENSITY, duration: 0.6 }, 'formacao');
  tl.to(globe.particles.material, { opacity: 0.6, duration: 0.7 }, 'formacao');
  tl.to(horizonLine.material, { opacity: 0, duration: 0.3 }, 'formacao+=0.25');
  tl.call(() => flicker.play(), [], 'formacao+=0.6');

  // ---------- ROTAÇÃO (traz Brasil/América do Sul pra frente) ----------
  tl.addLabel('rotacao', 'formacao+=0.65');
  tl.to(globe.group.rotation, {
    y: targetRotationY,
    duration: 1,
    ease: 'power3.inOut',
  }, 'rotacao');

  // ---------- ZOOM (câmera de verdade, não CSS) ----------
  // Acontece ao mesmo tempo que a rotação, como pedido.
  tl.to(camera.position, {
    z: zoomTargetZ,
    duration: 1,
    ease: 'power2.inOut',
  }, 'rotacao');

  // ---------- MINAS GERAIS ----------
  tl.addLabel('minas', 'rotacao+=0.9');
  tl.to(marker.dot.material, { opacity: 1, duration: 0.15 }, 'minas');
  tl.to(marker.glow.material, { opacity: 0.7, duration: 0.15 }, 'minas');

  // ---------- PULSE (dois pulsos rápidos do anel) ----------
  tl.addLabel('pulse', 'minas+=0.1');
  // 1º pulso: ● -> ◉ -> ◎ (anel nasce pequeno, expande e desaparece)
  tl.to(marker.ring.material, { opacity: 0.8, duration: 0.05 }, 'pulse');
  tl.to(marker.ring.scale, { x: 1.8, y: 1.8, duration: 0.35 }, 'pulse');
  tl.to(marker.ring.material, { opacity: 0, duration: 0.35 }, 'pulse');
  // 2º pulso: reseta o anel e repete
  tl.set(marker.ring.scale, { x: 0.3, y: 0.3 }, 'pulse+=0.4');
  tl.to(marker.ring.material, { opacity: 0.8, duration: 0.05 }, 'pulse+=0.4');
  tl.to(marker.ring.scale, { x: 1.8, y: 1.8, duration: 0.3 }, 'pulse+=0.4');
  tl.to(marker.ring.material, { opacity: 0, duration: 0.3 }, 'pulse+=0.4');

  // Pequeno "impacto" cartunesco no globo inteiro quando Minas é encontrada
  tl.to(globe.group.scale, {
    x: 1.02, z: 1.02, duration: 0.08, yoyo: true, repeat: 1,
  }, 'pulse');
  tl.to(glowMat.uniforms.uIntensity, {
    value: GLOW_INTENSITY * 1.6, duration: 0.1, yoyo: true, repeat: 1,
  }, 'pulse');

  // ---------- GLITCH curto ----------
  tl.addLabel('glitch', 'pulse+=0.05');
  tl.to(postFX.uniforms.uGlitchIntensity, {
    value: GLITCH_INTENSITY, duration: 0.05, yoyo: true, repeat: 3,
  }, 'glitch');

  // ---------- DESLIGAMENTO ----------
  // Mantém o holograma visível por ~0.5s depois do pulso, depois desliga.
  tl.addLabel('desligamento', 'pulse+=0.9');
  tl.call(() => flicker.pause(), [], 'desligamento');
  tl.to(postFX.uniforms.uGlitchIntensity, {
    value: GLITCH_INTENSITY * 1.4, duration: 0.06, yoyo: true, repeat: 3,
  }, 'desligamento');
  tl.to(postFX.uniforms.uScanlineIntensity, {
    value: SCANLINE_INTENSITY * 3, duration: 0.2,
  }, 'desligamento');
  tl.to(glowMat.uniforms.uIntensity, { value: 0, duration: 0.5 }, 'desligamento');
  tl.to(globe.particles.material, { opacity: 0, duration: 0.4 }, 'desligamento');
  tl.to(globe.group.scale, {
    y: 0.05, duration: 0.5, ease: 'power2.in',
  }, 'desligamento+=0.1');
  tl.to([baseMat, wireMat, continentsMat], { opacity: 0, duration: 0.4 }, 'desligamento+=0.15');
  tl.to([marker.dot.material, marker.glow.material], { opacity: 0, duration: 0.3 }, 'desligamento');
  tl.to(postFX.uniforms.uOpacity, { value: 0, duration: 0.35 }, 'desligamento+=0.25');

  // ---------- INTRO COMPLETA ----------
  tl.addLabel('completa', 'desligamento+=0.6');
  tl.call(() => flicker.kill(), [], 'completa');

  return tl;
}
