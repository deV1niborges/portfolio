import * as THREE from 'three';
import { MARKER_COLOR, GLOBE_RADIUS, MINAS_LAT, MINAS_LON } from './constants.js';
import { latLonToVector3 } from './coordinates.js';

/**
 * Cria o marcador de Minas Gerais.
 *
 * LocationMarker (Group)
 * ├── dot   -> ponto vermelho principal          (●)
 * ├── glow  -> halo suave atrás do ponto          (◉, parte do brilho)
 * └── ring  -> anel que expande e some             (◎, o "pulso")
 *
 * O grupo é posicionado exatamente na superfície do globo usando
 * latLonToVector3, e depois orientado com lookAt(0,0,0): isso faz o
 * eixo -Z do grupo apontar pro CENTRO do globo, o que deixa o eixo
 * +Z (a face visível de dot/glow/ring, que são planos 2D) apontando
 * pra FORA — ou seja, sempre tangente à superfície e virado pra
 * quem está olhando de fora, mesmo depois do globo girar (o marcador
 * é filho do globo, então gira junto com ele).
 */
export function createMarker() {
  const group = new THREE.Group();

  const position = latLonToVector3(MINAS_LAT, MINAS_LON, GLOBE_RADIUS * 1.01);
  group.position.copy(position);
  group.lookAt(0, 0, 0);

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.028, 16),
    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(dot);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.075, 16),
    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.z = -0.001; // fica levemente atrás do dot
  group.add(glow);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.037, 32),
    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  group.add(ring);

  return { group, dot, glow, ring };
}
