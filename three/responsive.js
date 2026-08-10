import * as THREE from "three";

import {
  CAMERA_START_Z,
  CAMERA_ZOOM_DISTANCE,
  GLOBE_DISPLAY_SCALE,
  GLOBE_RADIUS,
  VIEWPORT_SAFE_FILL,
} from "./constants.js";

export function updateResponsiveIntroLayout({
  camera,

  introRoot,

  marker,

  viewportWidth,

  viewportHeight,
}) {
  const aspect = viewportWidth / viewportHeight;

  const verticalFov = THREE.MathUtils.degToRad(camera.fov);

  const closestCameraZ = CAMERA_START_Z - CAMERA_ZOOM_DISTANCE;

  const halfVisibleHeight = closestCameraZ * Math.tan(verticalFov / 2);

  const halfVisibleWidth = halfVisibleHeight * aspect;

  const limitingHalfAxis = Math.min(
    halfVisibleWidth,

    halfVisibleHeight,
  );

  const visualRadius = GLOBE_RADIUS * 1.12;

  const fitScale = (limitingHalfAxis * VIEWPORT_SAFE_FILL) / visualRadius;

  const responsiveScale = THREE.MathUtils.clamp(
    Math.min(
      GLOBE_DISPLAY_SCALE,

      fitScale,
    ),

    0.24,

    GLOBE_DISPLAY_SCALE,
  );

  introRoot.scale.setScalar(responsiveScale);

  // ============================================================
  // MARCADOR
  // ============================================================

  // Antes aumentava muito no mobile.
  //
  // Agora compensamos bem pouco.

  const markerBoost = THREE.MathUtils.clamp(
    Math.sqrt(GLOBE_DISPLAY_SCALE / responsiveScale),

    1,

    1.16,
  );

  marker.group.scale.setScalar(markerBoost);

  return {
    responsiveScale,

    markerBoost,
  };
}
