import * as THREE from 'three';
import {
  GLOBE_RADIUS, GLOBE_COLOR, GLOBE_COLOR_DIM, GLOW_INTENSITY, PARTICLE_COUNT,
} from './constants.js';
import { createContinentsTexture } from './continentsData.js';

/**
 * Cria o holograma do globo como um THREE.Group com várias camadas
 * empilhadas (cada uma é uma esfera ligeiramente maior que a
 * anterior, pra evitar z-fighting):
 *
 * GlobeGroup
 * ├── baseSphere        esfera quase invisível, dá "volume" ao holograma
 * ├── wireSphere         wireframe (linhas de latitude/longitude)
 * ├── continentsSphere   textura de continentes desenhada à mão
 * ├── glowSphere          brilho nas bordas (shader com efeito Fresnel)
 * └── particles           pontos soltos ao redor, "poeira" holográfica
 */
export function createGlobe() {
  const group = new THREE.Group();

  // 1) Esfera base — quase invisível, só pra dar profundidade ao
  // holograma (sem ela, o globo pareceria "oco" e achataria visualmente).
  const baseMaterial = new THREE.MeshBasicMaterial({
    color: GLOBE_COLOR_DIM,
    transparent: true,
    opacity: 0.045,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const baseSphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS, 48, 32),
    baseMaterial,
  );
  group.add(baseSphere);

  // 2) Wireframe — grade de latitude/longitude, o "esqueleto" do holograma.
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: GLOBE_COLOR,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const wireSphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.001, 24, 16),
    wireMaterial,
  );
  group.add(wireSphere);

  // 3) Continentes — textura própria (não é uma foto real da Terra).
  const continentsMaterial = new THREE.MeshBasicMaterial({
    map: createContinentsTexture(),
    color: GLOBE_COLOR,
    transparent: true,
    opacity: 0.68,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const continentsSphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.004, 48, 32),
    continentsMaterial,
  );
  group.add(continentsSphere);

  // 4) Glow nas bordas — ShaderMaterial com efeito Fresnel: quanto
  // mais "de perfil" a superfície está em relação à câmera, mais
  // brilhante ela fica. É isso que cria o contorno luminoso típico
  // de holograma (a parte de trás da esfera, virada pra fora, brilha
  // mais que a parte de frente).
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(GLOBE_COLOR) },
      uIntensity: { value: 0 }, // controlado pelo GSAP (ver hologramAnimation.js)
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-viewPosition.xyz);
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        // Fresnel: 0 quando a superfície encara a câmera de frente,
        // 1 quando está de perfil (na borda visível do globo).
        float fresnel = 1.0 - max(dot(vNormal, vViewDir), 0.0);
        fresnel = pow(fresnel, 2.5);
        gl_FragColor = vec4(uColor, fresnel * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });
  const glowSphere = new THREE.Mesh(
    new THREE.SphereGeometry(GLOBE_RADIUS * 1.12, 48, 32),
    glowMaterial,
  );
  group.add(glowSphere);

  // 5) Partículas digitais.
  const particles = createDigitalParticles();
  group.add(particles);

  return {
    group,
    baseSphere,
    wireSphere,
    continentsSphere,
    glowSphere,
    particles,
    // Lista à parte pra facilitar animações em lote no hologramAnimation.js
    materials: [baseMaterial, wireMaterial, continentsMaterial, glowMaterial],
  };
}

function createDigitalParticles() {
  // Textura de um quadrado sólido (em vez do círculo suave padrão do
  // PointsMaterial) — reforça a estética de "blocos digitais".
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 8, 8);
  const squareTexture = new THREE.CanvasTexture(canvas);
  squareTexture.magFilter = THREE.NearestFilter;

  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Distribui as partículas numa casca esférica ao redor do globo,
    // usando amostragem uniforme sobre uma esfera (não é só random
    // em lat/lon, que concentraria pontos nos polos).
    const radius = GLOBE_RADIUS * (1.15 + Math.random() * 0.5);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    map: squareTexture,
    color: GLOBE_COLOR,
    size: 0.028,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return new THREE.Points(geometry, material);
}

/**
 * Cria a faixa holográfica fina que aparece primeiro, antes do globo
 * se formar (fase "PROJEÇÃO" do pedido). Começa "fechada"
 * (scale.x quase 0) e a timeline estica ela horizontalmente.
 */
export function createHorizonLine() {
  const material = new THREE.MeshBasicMaterial({
    color: GLOBE_COLOR,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const line = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.018), material);
  line.position.set(0, -GLOBE_RADIUS * 0.9, 0.3);
  line.scale.x = 0.001;
  return line;
}
