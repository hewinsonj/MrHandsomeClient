import { Effect, EffectAttribute, BlendFunction } from 'postprocessing'
import { wrapEffect } from '@react-three/postprocessing'
import * as THREE from 'three'

// Screen-space perlin (fbm value-noise) warp — ported from visual-life-app.
// Baked to a subtle amount: 12% strength, 0.3 speed, 3.0 scale.
const fragmentShader = /* glsl */`
uniform float uStrength;
uniform float uSpeed;
uniform float uScale;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// 3-octave fractal noise — good detail/perf balance
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (uStrength < 0.001) { outputColor = inputColor; return; }

  float t  = uTime * uSpeed;
  float nx = fbm(uv * uScale + vec2(t * 0.7,       t * 0.3));
  float ny = fbm(uv * uScale + vec2(t * 0.4 + 3.7, t * 0.8 + 1.1));

  vec2 offset = (vec2(nx, ny) * 2.0 - 1.0) * uStrength * 0.12;
  outputColor = texture2D(inputBuffer, clamp(uv + offset, 0.001, 0.999));
}`

class PerlinWarpEffect extends Effect {
  constructor() {
    super('PerlinWarpEffect', fragmentShader, {
      attributes: EffectAttribute.CONVOLUTION,
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map([
        ['uStrength', new THREE.Uniform(0.12)],
        ['uSpeed', new THREE.Uniform(0.3)],
        ['uScale', new THREE.Uniform(3.0)],
        ['uTime', new THREE.Uniform(0.0)],
      ]),
    })
  }

  // The composer calls this each frame — advance the animation clock.
  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('uTime').value += deltaTime
  }
}

// r3f component usable inside <EffectComposer>
const PerlinWarp = wrapEffect(PerlinWarpEffect)
export default PerlinWarp
