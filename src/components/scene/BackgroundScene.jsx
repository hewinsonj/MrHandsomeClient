import React, { useMemo, useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial, useGLTF, Center } from '@react-three/drei'
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

  return (
    <group ref={groupRef}>
      <mesh position={[-RAIL_GAUGE, 0.1, 0]}>
        <boxGeometry args={[0.07, 0.1, TRACK_SPAN]} />
        <meshStandardMaterial color='#c0c0c0' metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[RAIL_GAUGE, 0.1, 0]}>
        <boxGeometry args={[0.07, 0.1, TRACK_SPAN]} />
        <meshStandardMaterial color='#c0c0c0' metalness={0.95} roughness={0.1} />
      </mesh>
      <instancedMesh ref={tiesRef} args={[null, null, TIE_COUNT]}>
        <boxGeometry args={[1.9, 0.07, 0.16]} />
        <meshStandardMaterial color='#3b2614' roughness={0.97} metalness={0} />
      </instancedMesh>
    </group>
  )
}

// --- Infinite corridor: 12-slot pool that repositions itself every frame ---
const STATUE_SPACING = 7
const SLOT_COUNT     = 12   // pool size — always SLOT_COUNT groups mounted
const LIGHT_SPEED    = 0.15
const BUST_HEAD_Y    = [3.5, 2.5, 2.5]

// Seeded pseudo-random in [0,1)
const fhash = (n) => Math.abs(Math.sin(n * 127.1) * 43758.5453 % 1)

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
        x:    (fhash(p * 7 + 1) - 0.5) * 7,
        z:    (fhash(p * 7 + 2) - 0.5) * 4,
        rotY:  fhash(p * 7 + 3) * Math.PI * 2,
        idx:   Math.floor(fhash(p * 7 + 4) * 3),
      },
      {
        x:    (fhash(p * 7 + 5) - 0.5) * 7,
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
    camera.position.z = 6 - t * 0.4
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
  </>
)

const BackgroundScene = () => (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
    <Canvas
      camera={{ position: [0, 1.4, 6], fov: 75 }}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
    >
      <Scene />
    </Canvas>
  </div>
)

export default BackgroundScene
