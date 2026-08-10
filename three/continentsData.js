import * as THREE from 'three';

// Coordenadas [longitude, latitude] simplificadas para cada continente.
// NÃO são geograficamente perfeitas — são só detalhadas o suficiente
// pra silhueta ficar reconhecível quando desenhada em baixa resolução
// (o pedido original é explícito sobre isso: precisão não importa,
// só precisa dar pra reconhecer América do Sul / Brasil).
const CONTINENTS = {
  southAmerica: [
    [-81, 9], [-77, 1], [-75, -4], [-70, -18], [-71, -30], [-73, -40],
    [-71, -52], [-68, -55], [-65, -54], [-62, -50], [-58, -42], [-48, -25],
    [-40, -14], [-37, -8], [-40, -3], [-50, 0], [-60, 5], [-70, 10], [-81, 9],
  ],
  africa: [
    [-17, 15], [-16, 12], [-13, 7], [9, 4], [9, -1], [12, -5], [13, -10],
    [12, -17], [15, -22], [18, -28], [20, -34], [26, -33], [32, -25],
    [35, -18], [40, -12], [40, -4], [43, 0], [48, 10], [43, 12], [38, 15],
    [33, 22], [25, 31], [10, 37], [0, 35], [-6, 33], [-10, 30], [-13, 27],
    [-17, 20], [-17, 15],
  ],
  northAmerica: [
    [-155, 60], [-165, 55], [-160, 58], [-140, 60], [-130, 55], [-125, 48],
    [-124, 40], [-117, 32], [-105, 20], [-97, 16], [-90, 15], [-85, 10],
    [-80, 8], [-77, 20], [-80, 25], [-81, 31], [-75, 35], [-70, 42],
    [-65, 45], [-60, 48], [-65, 55], [-75, 58], [-85, 62], [-95, 68],
    [-110, 70], [-130, 70], [-140, 68], [-150, 65], [-155, 60],
  ],
  eurasia: [
    [-10, 36], [0, 43], [10, 45], [20, 40], [27, 36], [35, 42], [40, 46],
    [50, 45], [60, 50], [70, 55], [80, 60], [90, 65], [100, 68], [120, 70],
    [135, 65], [140, 55], [145, 45], [140, 35], [130, 30], [120, 25],
    [110, 20], [105, 10], [100, 5], [95, 10], [90, 20], [80, 25], [70, 20],
    [68, 15], [73, 10], [78, 8], [80, 12], [70, 25], [60, 30], [50, 30],
    [45, 35], [35, 32], [30, 30], [25, 35], [20, 38], [15, 37], [10, 38],
    [0, 38], [-10, 36],
  ],
  australia: [
    [113, -22], [115, -20], [122, -18], [130, -12], [136, -12], [142, -11],
    [145, -16], [150, -22], [153, -27], [153, -32], [150, -35], [145, -38],
    [140, -38], [135, -35], [130, -32], [122, -34], [115, -34], [113, -27],
    [113, -22],
  ],
};

// Resolução baixa de propósito: reforça a estética pixelada/digital
// e é tudo que precisamos, já que os continentes só aparecem como
// silhuetas simples enroladas na esfera.
const MAP_WIDTH = 256;
const MAP_HEIGHT = 128;

function lonLatToXY(lon, lat) {
  // Projeção equiretangular: x segue a longitude, y segue a latitude,
  // ambos numa escala linear direta. É a mesma convenção usada por
  // qualquer textura de "mapa-múndi" comum para SphereGeometry.
  const x = ((lon + 180) / 360) * MAP_WIDTH;
  const y = ((90 - lat) / 180) * MAP_HEIGHT;
  return [x, y];
}

/**
 * Desenha os continentes num canvas 2D e devolve uma THREE.CanvasTexture.
 * Essa textura é aplicada como `map` num material e o próprio Three.js
 * cuida de "enrolá-la" na esfera (é o mesmo mecanismo usado por
 * qualquer textura de globo terrestre realista — só que aqui o
 * "mapa" foi desenhado à mão, não é uma foto).
 */
export function createContinentsTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_WIDTH;
  canvas.height = MAP_HEIGHT;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  ctx.fillStyle = '#ffffff';

  Object.values(CONTINENTS).forEach((polygon) => {
    ctx.beginPath();
    polygon.forEach(([lon, lat], i) => {
      const [x, y] = lonLatToXY(lon, lat);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  // NearestFilter em vez de suavizar (LinearFilter, o padrão) —
  // mantém a textura "quadriculada", combinando com o resto do
  // efeito pixelado.
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}
