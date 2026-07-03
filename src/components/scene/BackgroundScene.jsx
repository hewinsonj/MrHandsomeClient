import React, { useMemo, useRef, useEffect, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, useGLTF, Center } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import * as THREE from 'three'

// --- Checkerboard floor texture ---
const useCheckerTexture = () =>
  useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 512
    const ctx = canvas.getContext('2d')
    const tile = 64
    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#111111'
        ctx.fillRect(x * tile, y * tile, tile, tile)
      }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(20, 20)
    return tex
  }, [])

const CORRIDOR_WIDTH  = 5
const CORRIDOR_LENGTH = 600                            // ~25 min at 0.4 u/s
const CORRIDOR_CENTER_Z = 6 - CORRIDOR_LENGTH / 2     // -294

const Floor = () => {
  const checker = useCheckerTexture()
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, CORRIDOR_CENTER_Z]}>
      <planeGeometry args={[40, CORRIDOR_LENGTH]} />
      <MeshReflectorMaterial
        map={checker}
        mirror={0.6}
        resolution={512}
        mixBlur={3}
        mixStrength={1.0}
        roughness={0.1}
        color='#ffffff'
        metalness={0.5}
      />
    </mesh>
  )
}

// --- Busts ---
const BUST_SCALES = [0.030, 0.0134, 0.013]
const BUST_PATHS  = [
  '/models/bust1/scene.gltf',
  '/models/bust2/scene.gltf',
  '/models/bust3/scene.gltf',
]
useGLTF.preload('/models/bust1/scene.gltf')
useGLTF.preload('/models/bust2/scene.gltf')
useGLTF.preload('/models/bust3/scene.gltf')

const Statue = ({ position, rotationY = 0, bustIndex = 0 }) => {
  const { scene } = useGLTF(BUST_PATHS[bustIndex % 3])
  const clone = useMemo(() => scene.clone(true), [scene])
  useMemo(() => {
    clone.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material = obj.material.clone()
        obj.material.color?.set('#ede8e0')
        obj.material.roughness = 0.4
        obj.material.metalness = 0.1
      }
    })
  }, [clone])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.9, 1.2, 0.9]} />
        <meshStandardMaterial color='#d8d4ce' roughness={0.6} metalness={0.05} />
      </mesh>
      <group position={[0, 1.2, 0]}>
        <Center top>
          <primitive object={clone} scale={BUST_SCALES[bustIndex % 3]} />
        </Center>
      </group>
    </group>
  )
}

// --- Candles ---
const CANDLE_PATHS  = [
  '/models/candle1/scene.gltf',
  '/models/candle2/scene.gltf',
  '/models/candle3/scene.gltf',
]
const CANDLE_SCALES = [0.75, 3.45, 0.24]
useGLTF.preload('/models/candle1/scene.gltf')
useGLTF.preload('/models/candle2/scene.gltf')
useGLTF.preload('/models/candle3/scene.gltf')

const Candle = ({ position, rotationY = 0, candleIndex = 0 }) => {
  const { scene } = useGLTF(CANDLE_PATHS[candleIndex % 3])
  const clone = useMemo(() => scene.clone(true), [scene])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Center top>
        <primitive object={clone} scale={CANDLE_SCALES[candleIndex % 3]} />
      </Center>
    </group>
  )
}

// --- Walls ---
const WALL_X      = CORRIDOR_WIDTH + 1.2   // 6.2
const WALL_HEIGHT = 14

const Wall = ({ side }) => {
  const x    = side === 'left' ? -WALL_X : WALL_X
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2
  return (
    <mesh position={[x, WALL_HEIGHT / 2, CORRIDOR_CENTER_Z]} rotation={[0, rotY, 0]}>
      <planeGeometry args={[CORRIDOR_LENGTH, WALL_HEIGHT]} />
      <meshStandardMaterial color='#1a1a1a' metalness={0.95} roughness={0.08} />
    </mesh>
  )
}

// --- Ceiling: watery shader + glowing polka dots ---
const Ceiling = () => {
  const matRef = useRef()
  const shader = useMemo(() => ({
    uniforms: { uTime: { value: 0 } },
    vertexShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 1.8 + uTime * 0.7)               * 0.35
               + sin(pos.y * 1.3 + uTime * 0.5)               * 0.28
               + sin(pos.x * 3.5 - pos.y * 2.0 + uTime * 1.1) * 0.14
               + cos(pos.x * 1.0 + pos.y * 3.2 - uTime * 0.6) * 0.18;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      vec3 hsv2rgb(float h, float s, float v) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(h + K.xyz) * 6.0 - K.www);
        return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
      }
      void main() {
        vec2 uv = vUv;
        float dx = sin(uv.y * 10.0 + uTime * 0.8) * 0.018 + sin(uv.y * 23.0 - uTime       ) * 0.008;
        float dy = cos(uv.x *  8.0 + uTime * 0.6) * 0.014 + cos(uv.x * 19.0 + uTime * 1.2 ) * 0.007;
        vec2 wuv = uv + vec2(dx, dy);
        float w1 = sin(wuv.x * 14.0 + uTime * 1.1) * sin(wuv.y * 11.0 - uTime * 0.7);
        float w2 = sin(wuv.x *  7.0 - wuv.y *  9.0 + uTime * 0.9);
        float wave = (w1 + w2) * 0.5 + 0.5;
        vec3 col = mix(vec3(0.0, 0.015, 0.06), vec3(0.01, 0.09, 0.22), wave);
        vec2 dotGrid = wuv * vec2(9.0, 9.0);
        vec2 dotId   = floor(dotGrid);
        vec2 dotFrac = fract(dotGrid) - 0.5;
        float d      = length(dotFrac);
        float hardDot  = smoothstep(0.24, 0.18, d);
        float softGlow = exp(-d * d * 18.0);
        float hue = fract(dotId.x * 0.137 + dotId.y * 0.317 + uTime * 0.04);
        vec3 dotCol = hsv2rgb(hue, 1.0, 1.0);
        col += dotCol * (hardDot * 7.0 + softGlow * 2.5);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  }), [])
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime
  })
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, WALL_HEIGHT, CORRIDOR_CENTER_Z]}>
      <planeGeometry args={[WALL_X * 2 + 2, CORRIDOR_LENGTH, 40, 20]} />
      <shaderMaterial ref={matRef} args={[shader]} />
    </mesh>
  )
}

// --- Train track — follows the camera, snapping to tie intervals so it never runs out ---
const RAIL_GAUGE    = 0.72
const TIE_SPACING   = 0.65
const TRACK_SPAN    = 160                                  // rail length: ~90 ahead, ~70 behind camera
const TIE_COUNT     = Math.ceil(TRACK_SPAN / TIE_SPACING)  // ties fill the local span, centered at group 0

const TrainTrack = () => {
  const groupRef = useRef()
  const tiesRef  = useRef()

  useEffect(() => {
    if (!tiesRef.current) return
    const dummy = new THREE.Object3D()
    const half  = TRACK_SPAN / 2
    for (let i = 0; i < TIE_COUNT; i++) {
      // ties placed in LOCAL space, evenly across the span centered on the group origin
      dummy.position.set(0, 0.035, half - i * TIE_SPACING)
      dummy.updateMatrix()
      tiesRef.current.setMatrixAt(i, dummy.matrix)
    }
    tiesRef.current.instanceMatrix.needsUpdate = true
  }, [])

  // Snap the whole track to the camera in TIE_SPACING steps. Because ties repeat exactly
  // every TIE_SPACING and the rails are uniform, these steps are invisible — endless track.
  useFrame(({ camera }) => {
    if (!groupRef.current) return
    groupRef.current.position.z = Math.round(camera.position.z / TIE_SPACING) * TIE_SPACING
  })

  // frustumCulled=false: the track follows the camera, and the instanced ties'
  // auto bounding sphere is just one tiny tie box at the group origin — so the
  // renderer would otherwise cull the whole track in and out as it drifts.
  return (
    <group ref={groupRef}>
      <mesh position={[-RAIL_GAUGE, 0.1, 0]} frustumCulled={false}>
        <boxGeometry args={[0.07, 0.1, TRACK_SPAN]} />
        <meshStandardMaterial color='#c0c0c0' metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[RAIL_GAUGE, 0.1, 0]} frustumCulled={false}>
        <boxGeometry args={[0.07, 0.1, TRACK_SPAN]} />
        <meshStandardMaterial color='#c0c0c0' metalness={0.95} roughness={0.1} />
      </mesh>
      <instancedMesh ref={tiesRef} args={[null, null, TIE_COUNT]} frustumCulled={false}>
        <boxGeometry args={[1.9, 0.07, 0.16]} />
        <meshStandardMaterial color='#3b2614' roughness={0.97} metalness={0} />
      </instancedMesh>
    </group>
  )
}

// --- Infinite corridor: 12-slot pool that repositions itself every frame ---
const STATUE_SPACING = 7
const SLOT_COUNT     = 12    // pool size — always SLOT_COUNT groups mounted
const LIGHT_SPEED    = 0.15
const CAM_SPEED      = 0.85  // camera travel speed down the tracks (units/sec)
const BUST_HEAD_Y    = [3.5, 2.5, 2.5]

// Seeded pseudo-random in [0,1)
const fhash = (n) => Math.abs(Math.sin(n * 127.1) * 43758.5453 % 1)

// Seeded x that keeps candles off the central train track: |x| in [1.4, 3.4],
// side chosen by the seed (track ties are only ~0.95 wide either side of center)
const candleX = (s) => (fhash(s) < 0.5 ? -1 : 1) * (1.4 + fhash(s * 1.7 + 3.3) * 2.0)

const InfiniteCorridorSystem = () => {
  const slotGroupRefs  = useRef([])
  const lightLeftRefs  = useRef([])
  const lightRightRefs = useRef([])
  const flickerRefs    = useRef([])
  const colorBuf       = useMemo(() => new THREE.Color(), [])

  // Fixed candle layout per pool slot, seeded by slot index so pattern repeats consistently
  const candleConfigs = useMemo(() =>
    Array.from({ length: SLOT_COUNT }, (_, p) => [
      {
        x:    candleX(p * 7 + 1),
        z:    (fhash(p * 7 + 2) - 0.5) * 4,
        rotY:  fhash(p * 7 + 3) * Math.PI * 2,
        idx:   Math.floor(fhash(p * 7 + 4) * 3),
      },
      {
        x:    candleX(p * 7 + 5),
        z:    (fhash(p * 7 + 6) - 0.5) * 4,
        rotY:  fhash(p * 7 + 7) * Math.PI * 2,
        idx:   Math.floor(fhash(p * 7 + 8) * 3),
      },
    ]),
  [])

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime

    // Move camera forward forever — no modulo, no jump
    camera.position.x = Math.sin(t * 0.08) * 0.6
    camera.position.y = 1.4 + Math.sin(t * 0.18) * 0.08
    camera.position.z = 6 - t * CAM_SPEED
    camera.lookAt(camera.position.x * 0.2, 1.6, camera.position.z - 15)

    const cameraZ    = camera.position.z
    // camSlot: index of the slot currently at or just ahead of the camera
    const camSlot    = Math.floor((6 - cameraZ) / STATUE_SPACING)
    const windowStart = camSlot - 2   // show 2 slots behind camera, 9 ahead

    for (let p = 0; p < SLOT_COUNT; p++) {
      // Pool slot p "owns" worldN values ≡ p (mod SLOT_COUNT).
      // Find the worldN in [windowStart, windowStart+SLOT_COUNT) that belongs to this pool slot.
      const ws         = ((windowStart % SLOT_COUNT) + SLOT_COUNT) % SLOT_COUNT
      const baseOffset = ((p - ws) + SLOT_COUNT) % SLOT_COUNT
      const worldN     = windowStart + baseOffset

      // Teleport slot group to its current world position
      const group = slotGroupRefs.current[p]
      if (group) group.position.z = -(worldN + 1) * STATUE_SPACING

      // Cycle light colors: opposite hues per side, phase offset per worldN
      const hue = ((worldN * 0.137 + t * LIGHT_SPEED) % 1 + 1) % 1
      const ll = lightLeftRefs.current[p]
      if (ll) { colorBuf.setHSL(hue, 1, 0.5); ll.color.copy(colorBuf) }
      const lr = lightRightRefs.current[p]
      if (lr) { colorBuf.setHSL((hue + 0.5) % 1, 1, 0.5); lr.color.copy(colorBuf) }

      // Candle flicker
      const fl = flickerRefs.current[p]
      if (fl) {
        const ph      = p * 2.09
        const flicker = 0.50 * Math.sin(t * 18.7 + ph)
                      + 0.30 * Math.sin(t *  7.3 + ph * 1.5)
                      + 0.20 * Math.sin(t * 31.1 + ph * 0.6)
        fl.intensity = Math.max(0.5, 4.5 + flicker * 2.8)
      }
    }
  })

  return (
    <Suspense fallback={null}>
      {Array.from({ length: SLOT_COUNT }, (_, p) => {
        // Bust type per pool slot: worldN ≡ p (mod 12) and 12 ≡ 0 (mod 3),
        // so worldN % 3 == p % 3 always — the cycling pattern is perfectly preserved.
        const leftBustIdx  = p % 3
        const rightBustIdx = (p + 1) % 3
        return (
          <group key={p} ref={el => { slotGroupRefs.current[p] = el }}>
            <Statue
              position={[-CORRIDOR_WIDTH, 0, 0]}
              rotationY={ Math.PI / 2}
              bustIndex={leftBustIdx}
            />
            <Statue
              position={[ CORRIDOR_WIDTH, 0, 0]}
              rotationY={-Math.PI / 2}
              bustIndex={rightBustIdx}
            />
            {/* Key light — high, from corridor side. Tight falloff keeps it on the bust, not the whole hall */}
            <pointLight
              ref={el => { lightLeftRefs.current[p] = el }}
              position={[-CORRIDOR_WIDTH + 1.5, BUST_HEAD_Y[leftBustIdx], 0]}
              color='#ff0000'
              intensity={45}
              distance={7}
              decay={2}
            />
            {/* Fill light — opposite side, complementary color */}
            <pointLight
              ref={el => { lightRightRefs.current[p] = el }}
              position={[ CORRIDOR_WIDTH - 1.5, BUST_HEAD_Y[rightBustIdx], 0]}
              color='#00ffff'
              intensity={45}
              distance={7}
              decay={2}
            />
            {/* Warm candle flicker at floor level */}
            <pointLight
              ref={el => { flickerRefs.current[p] = el }}
              position={[0, 0.4, 0]}
              color='#ff8c20'
              intensity={4.5}
              distance={6}
              decay={2}
            />
            {candleConfigs[p].map((c, ci) => (
              <Candle
                key={ci}
                position={[c.x, 0, c.z]}
                rotationY={c.rotY}
                candleIndex={c.idx}
              />
            ))}
          </group>
        )
      })}
    </Suspense>
  )
}

// --- Dancers: exactly TWO instances, reused forever ---
// Glowing multicolored figures between the busts on each side. A pool of 2
// repositions to the two nearest "dance spots" ahead of the camera; when one
// passes behind, it recycles far ahead (into the fog) so there is never a
// visible pop and never more than 2 skinned meshes alive at once.
const DANCER_PATHS    = [
  '/models/dancer1/scene.gltf',
  '/models/dancer2/scene.gltf',
  '/models/dancer3/scene.gltf',
]
const DANCER_COUNT    = DANCER_PATHS.length
const DANCE_SPEED     = 0.25   // playback speed of the dance animation (1 = normal, lower = slower)
const DANCER_TARGET_H = 2.4    // world height every dancer is normalized to
const DANCER_X        = 4.4    // how far to the side they stand
const DANCE_SPACING   = 24     // gap between dance spots along the corridor
const DANCE_START_Z   = -10    // z of dance spot 0
DANCER_PATHS.forEach((p) => useGLTF.preload(p))

const Dancer = React.forwardRef(({ dancerIndex, timeOffset = 0 }, ref) => {
  const { scene, animations } = useGLTF(DANCER_PATHS[dancerIndex])

  // SkeletonUtils.clone — scene.clone() would break the skinned mesh/skeleton link
  const model = useMemo(() => cloneSkinned(scene), [scene])

  // Shared time uniform driving the color cycle; the dancers' hues are spread
  // evenly across the wheel so they're never the same color.
  const timeUniform = useMemo(() => ({ value: 0 }), [])
  const hueOffset   = dancerIndex / DANCER_COUNT

  // Glow the model with an animated vertical rainbow, and normalize its size.
  const fit = useMemo(() => {
    model.traverse((o) => {
      if (o.isMesh) {
        const mat = new THREE.MeshBasicMaterial({ toneMapped: false }) // unlit → glows on its own
        mat.onBeforeCompile = (shader) => {
          shader.uniforms.uTime = timeUniform
          // pass world-space height to the fragment shader (model-scale independent)
          shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nvarying float vWorldY;')
            .replace(
              '#include <project_vertex>',
              '#include <project_vertex>\n vWorldY = (modelMatrix * vec4(transformed, 1.0)).y;'
            )
          // recolor with an HSV rainbow that scrolls up the body over time
          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              `#include <common>
               varying float vWorldY;
               uniform float uTime;
               vec3 hsv2rgb(float h, float s, float v) {
                 vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
                 vec3 p = abs(fract(h + K.xyz) * 6.0 - K.www);
                 return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
               }`
            )
            .replace(
              'vec4 diffuseColor = vec4( diffuse, opacity );',
              `float hue = fract(vWorldY * 0.35 - uTime * 0.15 + ${hueOffset.toFixed(3)});
               vec4 diffuseColor = vec4( hsv2rgb(hue, 1.0, 1.0), opacity );`
            )
        }
        o.material = mat
        o.frustumCulled = false
      }
    })
    model.updateMatrixWorld(true)
    const box  = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3(); box.getSize(size)
    const scale = size.y > 0 ? DANCER_TARGET_H / size.y : 1
    return { scale, footY: box.min.y }
  }, [model, timeUniform, hueOffset])

  // Each dancer gets its own mixer so they can be at different points in the dance
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  useEffect(() => {
    if (!animations.length) return
    const action = mixer.clipAction(animations[0])
    action.play()
    mixer.setTime(timeOffset)
    return () => { mixer.stopAllAction(); mixer.uncacheRoot(model) }
  }, [mixer, animations, timeOffset, model])
  useFrame((_, delta) => {
    mixer.update(delta * DANCE_SPEED)   // scale playback to slow the dance
    timeUniform.value += delta          // advance the color cycle (unaffected)
  })

  // Transform (side/z) is driven by the parent each frame; feet sit on the floor.
  return (
    <group ref={ref}>
      <primitive object={model} scale={fit.scale} position={[0, -fit.footY * fit.scale, 0]} />
    </group>
  )
})

const DancerPair = () => {
  const refs = useRef([])

  useFrame(({ camera }) => {
    const camZ = camera.position.z
    // first dance spot at or ahead of the camera (camera travels toward -z)
    const kMin = Math.ceil((DANCE_START_Z - camZ) / DANCE_SPACING)
    for (let d = 0; d < DANCER_COUNT; d++) {
      // dancer d always occupies the spot with k ≡ d (mod DANCER_COUNT), so the
      // dancers fill DANCER_COUNT consecutive spots ahead of the camera. When one
      // passes behind, its k jumps forward by DANCER_COUNT (into the fog) — no pop.
      const k = kMin + (((d - (kMin % DANCER_COUNT)) % DANCER_COUNT) + DANCER_COUNT) % DANCER_COUNT
      const g = refs.current[d]
      if (!g) continue
      const left = ((k % 2) + 2) % 2 === 0   // alternate sides down the corridor
      g.position.x = left ? -DANCER_X : DANCER_X
      g.position.z = DANCE_START_Z - k * DANCE_SPACING
      g.rotation.y = left ? Math.PI / 2 : -Math.PI / 2   // face the corridor center
    }
  })

  return (
    <Suspense fallback={null}>
      {DANCER_PATHS.map((_, d) => (
        <Dancer
          key={d}
          ref={(el) => { refs.current[d] = el }}
          dancerIndex={d}
          timeOffset={d * 1.3}
        />
      ))}
    </Suspense>
  )
}

// --- Trash: textured, low-cost floor clutter ---
// Each model keeps its real glTF base-color texture(s). A model's meshes are
// merged PER MATERIAL (trash2 is a 36-material junk pile), and every material
// group becomes one pooled InstancedMesh — so a piece is a handful of draw
// calls, not one, but instances are still recycled down the corridor and we
// only ever draw the visible few. Materials are unlit (MeshBasicMaterial + map)
// so the trash stays visible on the near-black floor and fades into the fog.
const TRASH_PATHS   = ['/models/trash1/scene.gltf', '/models/trash2/scene.gltf', '/models/trash3/scene.gltf']
const TRASH_TYPES   = TRASH_PATHS.length
const TRASH_POOL    = 15     // total pieces alive (divisible by TRASH_TYPES → 5 each)
const TRASH_PER     = TRASH_POOL / TRASH_TYPES
const TRASH_SPACING = 5      // gap between trash spots (× pool ≈ 75u window, covers the fog)
const TRASH_START_Z = -6
const TRASH_MAX     = [1.9, 6.0, 1.9]   // per-type: largest dimension each piece normalizes to; trash2 is a big pile
TRASH_PATHS.forEach((p) => useGLTF.preload(p))

// Merge a model's meshes into one floor-seated geometry PER SOURCE MATERIAL,
// preserving UVs so the original base-color texture maps correctly. All groups
// share one normalization (combined bbox) so they stay a single coherent piece.
const mergeTrashByMaterial = (root, maxSize) => {
  root.updateMatrixWorld(true)
  const groups  = new Map()          // material.uuid → { geoms, map, color }
  const overall = new THREE.Box3()
  root.traverse((o) => {
    if (o.isMesh && o.geometry) {
      let g = o.geometry.clone()
      g.applyMatrix4(o.matrixWorld)    // bake world transform so all groups share one space
      if (g.index) g = g.toNonIndexed()
      const pos = g.getAttribute('position')
      const uv  = g.getAttribute('uv') ||
        new THREE.BufferAttribute(new Float32Array(pos.count * 2), 2)   // fallback: flat UVs
      const ng = new THREE.BufferGeometry()
      ng.setAttribute('position', pos)
      ng.setAttribute('uv', uv)        // unlit textured → position + uv is all we need
      ng.computeBoundingBox()
      overall.union(ng.boundingBox)

      const mat = Array.isArray(o.material) ? o.material[0] : o.material
      const key = mat ? mat.uuid : 'none'
      if (!groups.has(key)) {
        groups.set(key, {
          geoms: [],
          map:   mat?.map || null,
          color: mat?.color ? mat.color.clone() : new THREE.Color('#ffffff'),
        })
      }
      groups.get(key).geoms.push(ng)
    }
  })

  const cx   = (overall.min.x + overall.max.x) / 2
  const cz   = (overall.min.z + overall.max.z) / 2
  const size = new THREE.Vector3(); overall.getSize(size)
  const scale = maxSize / Math.max(size.x, size.y, size.z)

  const out = []
  groups.forEach(({ geoms, map, color }) => {
    const merged = mergeGeometries(geoms, false)
    merged.translate(-cx, -overall.min.y, -cz)   // center on x/z, seat base at y = 0
    out.push({ geometry: merged, map, color })
  })
  return { groups: out, scale }
}

const TrashType = ({ typeIndex, registerMesh }) => {
  const { scene } = useGLTF(TRASH_PATHS[typeIndex])
  const { groups, scale } = useMemo(() => mergeTrashByMaterial(scene, TRASH_MAX[typeIndex]), [scene, typeIndex])

  // Unlit material per group: real base-color texture where present, else the
  // source material's flat color. Fog stays on so distant trash fades out.
  const materials = useMemo(() =>
    groups.map(({ map, color }) => new THREE.MeshBasicMaterial({
      map:   map || null,
      color: map ? new THREE.Color('#ffffff') : color,
    })),
  [groups])

  return groups.map((g, gi) => (
    <instancedMesh
      key={gi}
      ref={(el) => registerMesh(typeIndex, gi, el, scale)}
      args={[g.geometry, materials[gi], TRASH_PER]}
      frustumCulled={false}
    />
  ))
}

const TrashField = () => {
  const meshRefs = useRef([])   // meshRefs.current[type] = [instancedMesh per material group]
  const scaleRef = useRef([])   // scaleRef.current[type]  = normalization scale
  const dummy    = useMemo(() => new THREE.Object3D(), [])

  // Each material group of each type registers its InstancedMesh here so the
  // pool loop can drive all of a piece's groups with one shared transform.
  const registerMesh = (type, groupIndex, el, scale) => {
    if (!meshRefs.current[type]) meshRefs.current[type] = []
    meshRefs.current[type][groupIndex] = el
    scaleRef.current[type] = scale
  }

  useFrame(({ camera }) => {
    const camZ = camera.position.z
    const kMin = Math.ceil((TRASH_START_Z - camZ) / TRASH_SPACING)
    for (let p = 0; p < TRASH_POOL; p++) {
      const worldK = kMin + ((((p - (kMin % TRASH_POOL)) % TRASH_POOL) + TRASH_POOL) % TRASH_POOL)
      const type   = p % TRASH_TYPES
      const idx    = Math.floor(p / TRASH_TYPES)
      const groupMeshes = meshRefs.current[type]
      if (!groupMeshes) continue
      let x = (fhash(worldK * 3.1 + 0.7) - 0.5) * 9         // scatter across the floor
      if (type === 1) {
        // trash2 is a big pile — keep its center out of the central train-track
        // lane (rails/ties live within |x| ≲ 0.95) by seating it in a side gutter
        const side = x < 0 ? -1 : 1
        x = side * (2.5 + fhash(worldK * 5.3 + 2.9) * 1.5)  // |x| in [2.5, 4.0]
      }
      // independent seed → random facing, uncorrelated with x, but stable per world spot
      const rotY = fhash(worldK * 12.9898 + 4.1) * Math.PI * 2
      const s    = scaleRef.current[type] || 1
      dummy.position.set(x, 0, TRASH_START_Z - worldK * TRASH_SPACING)
      dummy.rotation.set(0, rotY, 0)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      // every material group of this piece shares the same instance transform
      for (let gi = 0; gi < groupMeshes.length; gi++) {
        if (groupMeshes[gi]) groupMeshes[gi].setMatrixAt(idx, dummy.matrix)
      }
    }
    for (let type = 0; type < TRASH_TYPES; type++) {
      const gm = meshRefs.current[type]
      if (!gm) continue
      for (let gi = 0; gi < gm.length; gi++) {
        if (gm[gi]) gm[gi].instanceMatrix.needsUpdate = true
      }
    }
  })

  return (
    <Suspense fallback={null}>
      {TRASH_PATHS.map((_, t) => (
        <TrashType key={t} typeIndex={t} registerMesh={registerMesh} />
      ))}
    </Suspense>
  )
}

const Scene = () => (
  <>
    <color attach='background' args={['#0d0d0d']} />
    <fog attach='fog' args={['#0d0d0d', 20, 65]} />
    <ambientLight intensity={0.06} />
    <pointLight position={[0, 10, -20]} intensity={25} distance={45} color='#7700ee' />
    <Floor />
    <Wall side='left' />
    <Wall side='right' />
    <Ceiling />
    <TrainTrack />
    <InfiniteCorridorSystem />
    <DancerPair />
    <TrashField />
  </>
)

const INTRO_DELAY_MS = 1500   // hold on black (menu + text only) before revealing the scene
const FADE_SECONDS   = 5      // how long the black curtain takes to fade out

const BackgroundScene = () => {
  // The scene renders at full opacity from load; a solid black overlay on top
  // hides it at first (showing only the menu + text), then fades out after
  // INTRO_DELAY_MS. Fading a plain div — not the live WebGL canvas — keeps the
  // reveal smooth instead of snapping.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), INTRO_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
      <Canvas
        camera={{ position: [0, 1.4, 6], fov: 75 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Scene />
      </Canvas>
      {/* Black intro curtain — sits over the canvas, under the menu/text, fades away */}
      <div
        style={{
          position: 'absolute', inset: 0, background: '#000',
          opacity: revealed ? 0 : 1,
          transition: `opacity ${FADE_SECONDS}s ease-in-out`,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export default BackgroundScene
