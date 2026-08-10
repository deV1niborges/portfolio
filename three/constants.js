// ============================================================
// CONSTANTES DE AJUSTE DA INTRO
// Mexa nesses valores para experimentar o visual sem precisar
// entender o resto do código.
// ============================================================

// --- Pixelização ---
// Quanto maior, mais "blocado" fica o render (1 = sem pixelização).
// O efeito funciona renderizando a cena numa resolução interna menor
// e deixando o navegador ampliar sem suavizar (ver three/scene.js).
export const PIXEL_SIZE = 3;

// Limite de devicePixelRatio, pra não renderizar em altíssima
// resolução em celulares (o que pesaria muito na GPU).
export const DPR_MAX = 1.5;

// --- Cores ---
export const GLOBE_COLOR = 0x35e6ff; // ciano principal do holograma
export const GLOBE_COLOR_DIM = 0x0c5866; // tom mais escuro (base/sombra)
export const MARKER_COLOR = 0xff3b30; // vermelho do marcador de Minas Gerais

// --- Intensidades dos efeitos ---
export const GLOW_INTENSITY = 1.4; // brilho do contorno (fresnel) do globo formado
export const SCANLINE_INTENSITY = 0.35; // força das linhas horizontais
export const GLITCH_INTENSITY = 0.6; // força do glitch quando é disparado

// --- Movimento ---
export const ROTATION_SPEED = 0.06; // rotação contínua (idle) depois da intro, em rad/s

// --- Geometria do globo ---
export const GLOBE_RADIUS = 1.6;

// --- Partículas digitais ---
export const PARTICLE_COUNT = 220;

// --- Câmera ---
export const CAMERA_START_Z = 5.2;
export const CAMERA_ZOOM_DISTANCE = 0.45; // quanto a câmera se aproxima durante o zoom

// --- Minas Gerais ---
// Coordenada representativa do estado (região central), não é um
// endereço específico.
export const MINAS_LAT = -18.9;
export const MINAS_LON = -44.3;
