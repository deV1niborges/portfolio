import * as THREE from 'three';
import { SCANLINE_INTENSITY } from './constants.js';

/**
 * Pós-processamento simples, feito à mão (sem EffectComposer).
 *
 * A ideia em 3 passos:
 * 1. Renderizamos a cena 3D normalmente, mas para DENTRO de uma
 *    textura (WebGLRenderTarget) em vez de ir direto pra tela.
 * 2. Pegamos essa textura e desenhamos ela num retângulo que ocupa
 *    a tela inteira (um "quad" com câmera ortográfica, que não tem
 *    perspectiva — perfeito pra desenhar uma imagem 2D chapada).
 * 3. Um ShaderMaterial nesse quad aplica scanlines e o glitch
 *    horizontal por cima da imagem já renderizada, antes dela
 *    finalmente aparecer na tela.
 *
 * Isso é basicamente reimplementar à mão o que o EffectComposer do
 * Three.js faz por baixo dos panos — só que como um único shader
 * pequeno, fácil de ler e explicar.
 */
export function createPostFX(renderer, width, height) {
  const renderTarget = new THREE.WebGLRenderTarget(width, height);

  const quadScene = new THREE.Scene();
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    tDiffuse: { value: renderTarget.texture },
    uTime: { value: 0 },
    uScanlineIntensity: { value: SCANLINE_INTENSITY },
    uGlitchIntensity: { value: 0 }, // 0 = sem glitch; disparado pelo GSAP
    uOpacity: { value: 1 }, // fade in/out geral do holograma
    uResolution: { value: new THREE.Vector2(width, height) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uScanlineIntensity;
      uniform float uGlitchIntensity;
      uniform float uOpacity;
      uniform vec2 uResolution;
      varying vec2 vUv;

      // "hash" simples: transforma um número em outro número
      // pseudo-aleatório entre 0 e 1. Não existe random() de verdade
      // em GLSL, então esse é o truque padrão pra simular um.
      float hash(float n) {
        return fract(sin(n) * 43758.5453123);
      }

      void main() {
        vec2 uv = vUv;

        // --- Glitch: quando uGlitchIntensity > 0, algumas FAIXAS
        // horizontais aleatórias (não a imagem toda) são deslocadas
        // lateralmente por um instante. Dividimos a tela em 24 faixas,
        // sorteamos (via hash) se cada faixa "glitcha" neste frame, e
        // se sim, deslocamos a leitura da textura naquela faixa.
        if (uGlitchIntensity > 0.0) {
          float band = floor(uv.y * 24.0);
          float noise = hash(band + floor(uTime * 30.0));
          if (noise > 1.0 - uGlitchIntensity * 0.4) {
            uv.x += (hash(band * 3.1 + uTime) - 0.5) * uGlitchIntensity * 0.08;
          }
        }

        vec4 color = texture2D(tDiffuse, uv);

        // --- Scanlines: uma onda senoidal ao longo de Y escurece
        // levemente linhas alternadas, simulando as linhas de
        // varredura de um monitor CRT/holograma de ficção científica.
        float scanline = sin(uv.y * uResolution.y * 3.14159);
        color.rgb -= scanline * uScanlineIntensity * 0.08;

        color.a *= uOpacity;
        gl_FragColor = color;
      }
    `,
    transparent: true,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quadScene.add(quad);

  function setSize(newWidth, newHeight) {
    renderTarget.setSize(newWidth, newHeight);
    uniforms.uResolution.value.set(newWidth, newHeight);
  }

  function render(mainScene, mainCamera, time) {
    uniforms.uTime.value = time;

    renderer.setRenderTarget(renderTarget);
    renderer.render(mainScene, mainCamera);

    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
  }

  return { uniforms, setSize, render };
}
