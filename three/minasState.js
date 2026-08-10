import * as THREE from "three";

import {
  GLOBE_RADIUS,
  MINAS_OUTLINE_COLOR,
  MINAS_FILL_COLOR,
} from "./constants.js";

import { latLonToVector3 } from "./coordinates.js";

// ============================================================
// MALHA DE MINAS GERAIS - IBGE
// ============================================================

const MG_GEOJSON_URL =
  "https://servicodados.ibge.gov.br/api/v3/malhas/estados/MG" +
  "?formato=application%2Fvnd.geo%2Bjson&qualidade=minima";

// ============================================================
// EXTRAI OS POLÍGONOS
// ============================================================

function getOuterRings(geometry) {
  if (!geometry) {
    return [];
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates.length ? [geometry.coordinates[0]] : [];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon) => polygon[0]).filter(Boolean);
  }

  return [];
}

// ============================================================
// MAIS PIXELS NO CONTORNO
// ============================================================

function densifyRing(ring, stepDegrees = 0.16) {
  const result = [];

  for (let i = 0; i < ring.length - 1; i += 1) {
    const [lonA, latA] = ring[i];

    const [lonB, latB] = ring[i + 1];

    const distance = Math.hypot(
      lonB - lonA,

      latB - latA,
    );

    const steps = Math.max(
      1,

      Math.ceil(distance / stepDegrees),
    );

    for (let j = 0; j < steps; j += 1) {
      const t = j / steps;

      result.push([lonA + (lonB - lonA) * t, latA + (latB - latA) * t]);
    }
  }

  if (ring.length) {
    result.push(ring[ring.length - 1]);
  }

  return result;
}

// ============================================================
// TESTA SE UM PONTO ESTÁ DENTRO DO ESTADO
// ============================================================

function pointInPolygon(lon, lat, ring) {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];

    const [xj, yj] = ring[j];

    const intersects =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

// ============================================================
// TEXTURA PIXEL
// ============================================================

function createSquareTexture() {
  const canvas = document.createElement("canvas");

  canvas.width = 8;

  canvas.height = 8;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(0, 0, 8, 8);

  const texture = new THREE.CanvasTexture(canvas);

  texture.magFilter = THREE.NearestFilter;

  texture.minFilter = THREE.NearestFilter;

  return texture;
}

// ============================================================
// FALLBACK
// ============================================================

function createEmptyHighlight() {
  const group = new THREE.Group();

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",

    new THREE.BufferAttribute(
      new Float32Array(0),

      3,
    ),
  );

  const outline = new THREE.LineSegments(
    geometry.clone(),

    new THREE.LineBasicMaterial({
      transparent: true,

      opacity: 0,
    }),
  );

  const borderPixels = new THREE.Points(
    geometry.clone(),

    new THREE.PointsMaterial({
      transparent: true,

      opacity: 0,

      size: 0.01,
    }),
  );

  const borderGlow = new THREE.Points(
    geometry.clone(),

    new THREE.PointsMaterial({
      transparent: true,

      opacity: 0,

      size: 0.01,
    }),
  );

  const fill = new THREE.Points(
    geometry.clone(),

    new THREE.PointsMaterial({
      transparent: true,

      opacity: 0,

      size: 0.01,
    }),
  );

  group.add(
    outline,

    borderGlow,

    borderPixels,

    fill,
  );

  return {
    group,

    outline,

    borderPixels,

    borderGlow,

    fill,

    loaded: false,
  };
}

// ============================================================
// CRIA DESTAQUE DE MINAS
// ============================================================

export async function createMinasStateHighlight() {
  try {
    const response = await fetch(MG_GEOJSON_URL);

    if (!response.ok) {
      throw new Error(`IBGE respondeu ${response.status}`);
    }

    const geojson = await response.json();

    const feature = geojson.features?.[0];

    const rings = getOuterRings(feature?.geometry);

    if (!rings.length) {
      throw new Error("Malha de Minas Gerais sem coordenadas.");
    }

    const group = new THREE.Group();

    const squareTexture = createSquareTexture();

    // ============================================================
    // LINHA DO ESTADO
    // ============================================================

    const linePositions = [];

    rings.forEach((ring) => {
      for (let i = 0; i < ring.length - 1; i += 1) {
        const [lonA, latA] = ring[i];

        const [lonB, latB] = ring[i + 1];

        const a = latLonToVector3(
          latA,

          lonA,

          GLOBE_RADIUS * 1.017,
        );

        const b = latLonToVector3(
          latB,

          lonB,

          GLOBE_RADIUS * 1.017,
        );

        linePositions.push(
          a.x,
          a.y,
          a.z,

          b.x,
          b.y,
          b.z,
        );
      }
    });

    const outlineGeometry = new THREE.BufferGeometry();

    outlineGeometry.setAttribute(
      "position",

      new THREE.Float32BufferAttribute(
        linePositions,

        3,
      ),
    );

    const outline = new THREE.LineSegments(
      outlineGeometry,

      new THREE.LineBasicMaterial({
        color: MINAS_OUTLINE_COLOR,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,
      }),
    );

    outline.renderOrder = 18;

    group.add(outline);

    // ============================================================
    // CONTORNO PIXELADO
    // ============================================================

    const denseBorder = rings.flatMap((ring) => densifyRing(ring));

    const borderPositions = new Float32Array(denseBorder.length * 3);

    denseBorder.forEach(
      (
        [lon, lat],

        index,
      ) => {
        const p = latLonToVector3(
          lat,

          lon,

          GLOBE_RADIUS * 1.021,
        );

        borderPositions[index * 3] = p.x;

        borderPositions[index * 3 + 1] = p.y;

        borderPositions[index * 3 + 2] = p.z;
      },
    );

    const borderGeometry = new THREE.BufferGeometry();

    borderGeometry.setAttribute(
      "position",

      new THREE.BufferAttribute(
        borderPositions,

        3,
      ),
    );

    // Glow do contorno

    const borderGlow = new THREE.Points(
      borderGeometry,

      new THREE.PointsMaterial({
        map: squareTexture,

        color: MINAS_OUTLINE_COLOR,

        size: 0.05,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,

        sizeAttenuation: true,
      }),
    );

    borderGlow.renderOrder = 17;

    group.add(borderGlow);

    // Pixel principal da borda

    const borderPixels = new THREE.Points(
      borderGeometry.clone(),

      new THREE.PointsMaterial({
        map: squareTexture,

        color: MINAS_OUTLINE_COLOR,

        size: 0.018,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,

        sizeAttenuation: true,
      }),
    );

    borderPixels.renderOrder = 19;

    group.add(borderPixels);

    // ============================================================
    // PREENCHIMENTO PIXELADO
    // ============================================================

    const fillCoords = [];

    rings.forEach((ring) => {
      const lons = ring.map(([lon]) => lon);

      const lats = ring.map(([, lat]) => lat);

      const minLon = Math.min(...lons);

      const maxLon = Math.max(...lons);

      const minLat = Math.min(...lats);

      const maxLat = Math.max(...lats);

      const step = 0.38;

      for (let lat = minLat; lat <= maxLat; lat += step) {
        for (let lon = minLon; lon <= maxLon; lon += step) {
          if (
            !pointInPolygon(
              lon,

              lat,

              ring,
            )
          ) {
            continue;
          }

          // pequenas falhas para parecer holograma

          const hash = Math.abs(Math.sin(lon * 12.9898 + lat * 78.233));

          if (hash < 0.28) {
            continue;
          }

          fillCoords.push([lon, lat]);
        }
      }
    });

    const fillPositions = new Float32Array(fillCoords.length * 3);

    fillCoords.forEach(
      (
        [lon, lat],

        index,
      ) => {
        const p = latLonToVector3(
          lat,

          lon,

          GLOBE_RADIUS * 1.014,
        );

        fillPositions[index * 3] = p.x;

        fillPositions[index * 3 + 1] = p.y;

        fillPositions[index * 3 + 2] = p.z;
      },
    );

    const fillGeometry = new THREE.BufferGeometry();

    fillGeometry.setAttribute(
      "position",

      new THREE.BufferAttribute(
        fillPositions,

        3,
      ),
    );

    const fill = new THREE.Points(
      fillGeometry,

      new THREE.PointsMaterial({
        map: squareTexture,

        color: MINAS_FILL_COLOR,

        size: 0.022,

        transparent: true,

        opacity: 0,

        blending: THREE.AdditiveBlending,

        depthWrite: false,

        sizeAttenuation: true,
      }),
    );

    fill.renderOrder = 16;

    group.add(fill);

    return {
      group,

      outline,

      borderPixels,

      borderGlow,

      fill,

      loaded: true,
    };
  } catch (error) {
    console.warn(
      "Não foi possível carregar a malha de Minas Gerais:",

      error,
    );

    return createEmptyHighlight();
  }
}
