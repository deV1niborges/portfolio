import * as THREE from "three";

import {
  MARKER_COLOR,
  GLOBE_RADIUS,
  MINAS_LAT,
  MINAS_LON,
} from "./constants.js";

import { latLonToVector3 } from "./coordinates.js";

export function createMarker() {
  const group = new THREE.Group();

  const visualGroup = new THREE.Group();

  group.add(visualGroup);

  // ============================================================
  // POSIÇÃO
  // ============================================================

  const position = latLonToVector3(MINAS_LAT, MINAS_LON, GLOBE_RADIUS * 1.022);

  group.position.copy(position);

  // ============================================================
  // ORIENTAÇÃO
  // ============================================================

  // CircleGeometry olha para +Z.
  // Fazemos +Z apontar para FORA da esfera.

  const outwardNormal = position.clone().normalize();

  group.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),

    outwardNormal,
  );

  // ============================================================
  // FUNDO ESCURO
  // ============================================================

  // Bem pequeno.
  // Serve somente para o vermelho não desaparecer no ciano.

  const backplate = new THREE.Mesh(
    new THREE.CircleGeometry(0.032, 12),

    new THREE.MeshBasicMaterial({
      color: 0x02040a,

      transparent: true,

      opacity: 0,

      side: THREE.DoubleSide,

      depthTest: false,

      depthWrite: false,
    }),
  );

  backplate.position.z = -0.003;

  backplate.renderOrder = 30;

  visualGroup.add(backplate);

  // ============================================================
  // PONTO VERMELHO
  // ============================================================

  // ANTES estava muito grande.
  //
  // Agora ele serve apenas como indicação.

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(0.018, 12),

    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,

      transparent: true,

      opacity: 0,

      side: THREE.DoubleSide,

      blending: THREE.NormalBlending,

      depthTest: false,

      depthWrite: false,
    }),
  );

  dot.renderOrder = 32;

  visualGroup.add(dot);

  // ============================================================
  // GLOW
  // ============================================================

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.048, 16),

    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,

      transparent: true,

      opacity: 0,

      side: THREE.DoubleSide,

      blending: THREE.AdditiveBlending,

      depthTest: false,

      depthWrite: false,
    }),
  );

  glow.position.z = -0.001;

  glow.renderOrder = 31;

  visualGroup.add(glow);

  // ============================================================
  // PULSO
  // ============================================================

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.022, 0.028, 24),

    new THREE.MeshBasicMaterial({
      color: MARKER_COLOR,

      transparent: true,

      opacity: 0,

      side: THREE.DoubleSide,

      blending: THREE.NormalBlending,

      depthTest: false,

      depthWrite: false,
    }),
  );

  ring.position.z = 0.002;

  ring.renderOrder = 33;

  visualGroup.add(ring);

  return {
    group,

    visualGroup,

    backplate,

    dot,

    glow,

    ring,
  };
}
