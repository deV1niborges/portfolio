import * as THREE from "three";

/**
 * Converte latitude/longitude (em graus) num ponto Vector3 na
 * superfície de uma esfera de raio `radius`, centrada na origem.
 *
 * Como funciona:
 * - `phi` é o ângulo medido a partir do polo NORTE (0 = polo norte,
 *   PI = polo sul). Por isso fazemos (90 - lat): quando lat = 90
 *   (polo norte), phi = 0.
 * - `theta` é o ângulo em volta do eixo Y (longitude), com um
 *   deslocamento de +180 para casar com a costura padrão de uma
 *   SphereGeometry/textura equiretangular do Three.js — é a mesma
 *   fórmula usada para alinhar um globo terrestre "de verdade" com
 *   sua textura, então também vai alinhar nosso globo com a textura
 *   de continentes gerada em continentsData.js.
 * - Depois disso é só conversão de coordenadas esféricas -> cartesianas.
 */
export function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}
