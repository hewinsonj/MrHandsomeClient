import React, { useEffect, useRef, useState } from 'react'
import { STATIC_BG, BG_CLIP_INTRO, BG_CLIP_LOOP } from '../../sceneConfig'

// Sequence:
//   look pressed -> black cover fades out over FADE_SECONDS
//   -> intro clip plays once (starts the moment the fade finishes)
//   -> hard-cut straight into the loop clip
//   -> loop clip repeats forever, crossfading into itself at each loop point.
const FADE_SECONDS     = 1.5   // black -> video fade; matches the look-button reveal
const LOOP_CROSSFADE_S = 1.0   // how long the loop clip dissolves into itself

const cover = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }

const VideoBackground = ({ running }) => {
  const introRef = useRef(null)
  const loopARef = useRef(null)
  const loopBRef = useRef(null)

  const [phase, setPhase] = useState('intro')     // 'intro' | 'loop'
  const [loopFront, setLoopFront] = useState(0)    // which loop element is visible (0=A, 1=B)
  const [loopStarted, setLoopStarted] = useState(false)  // enables the crossfade transition only after the first (instant) reveal
  const [videoBlocked, setVideoBlocked] = useState(false)  // true only if the video can't play at all
  const swapping = useRef(false)
  const startedSignal = useRef(false)

  // Start the intro the instant "look" is pressed — no waiting for the first
  // frame. Until it paints, the plain black base shows (never the still).
  useEffect(() => {
    if (!running) return
    const v = introRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
  }, [running])

  // When the intro actually begins painting, signal the app so the audio (and
  // then the menu) can start in sync with the video.
  const handleIntroPlaying = () => {
    if (startedSignal.current) return
    startedSignal.current = true
    window.dispatchEvent(new Event('mh-video-start'))
  }

  // Intro finished -> hand straight to the looping clip (hard cut: loop element
  // A already has frame 0 decoded underneath, so revealing it shows no black).
  const handleIntroEnded = () => {
    const a = loopARef.current
    if (a) { a.currentTime = 0; a.play().catch(() => {}) }
    setLoopFront(0)
    setPhase('loop')
    // enable opacity transitions a tick later so THIS reveal is instant but the
    // subsequent self-crossfades dissolve.
    setTimeout(() => setLoopStarted(true), 60)
  }

  // As the visible loop element nears its end, start the other from 0 and
  // crossfade to it — the clip dissolving into a fresh copy of itself.
  const handleLoopTimeUpdate = (which) => () => {
    if (phase !== 'loop' || swapping.current || which !== loopFront) return
    const front = which === 0 ? loopARef.current : loopBRef.current
    if (!front || !front.duration) return
    if (front.currentTime < front.duration - LOOP_CROSSFADE_S) return

    swapping.current = true
    const back = which === 0 ? loopBRef.current : loopARef.current
    if (back) { back.currentTime = 0; back.play().catch(() => {}) }
    setLoopFront(which === 0 ? 1 : 0)
    // once hidden, reset the old element so it's primed for its next turn
    setTimeout(() => {
      if (front) { front.pause(); front.currentTime = 0 }
      swapping.current = false
    }, LOOP_CROSSFADE_S * 1000)
  }

  const loopTransition = loopStarted ? `opacity ${LOOP_CROSSFADE_S}s ease` : 'none'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000' }}>
      {/* Still is a fallback ONLY — shown if the video genuinely can't play. */}
      {videoBlocked && <img src={STATIC_BG} alt='' aria-hidden='true' style={cover} />}

      {/* Loop pair sits underneath the intro so the intro->loop swap is a clean cut. */}
      <video
        ref={loopARef}
        src={BG_CLIP_LOOP}
        muted playsInline preload='auto' aria-hidden='true'
        onTimeUpdate={handleLoopTimeUpdate(0)}
        style={{ ...cover, opacity: phase === 'loop' && loopFront === 0 ? 1 : 0, transition: loopTransition }}
      />
      <video
        ref={loopBRef}
        src={BG_CLIP_LOOP}
        muted playsInline preload='auto' aria-hidden='true'
        onTimeUpdate={handleLoopTimeUpdate(1)}
        style={{ ...cover, opacity: phase === 'loop' && loopFront === 1 ? 1 : 0, transition: loopTransition }}
      />

      {/* Intro clip on top, opaque until it ends, then instantly hidden. */}
      <video
        ref={introRef}
        src={BG_CLIP_INTRO}
        muted playsInline preload='auto' aria-hidden='true'
        onPlaying={handleIntroPlaying}
        onError={() => setVideoBlocked(true)}
        onEnded={handleIntroEnded}
        style={{ ...cover, opacity: phase === 'intro' ? 1 : 0, transition: 'none' }}
      />

      {/* Black cover on the landing (behind "look"); fades out once look is pressed.
          The base is black too, so while the video loads you see black, never the still. */}
      <div
        aria-hidden='true'
        style={{
          position: 'absolute', inset: 0, background: '#000',
          opacity: running ? 0 : 1,
          transition: `opacity ${FADE_SECONDS}s ease-in-out`,
        }}
      />
    </div>
  )
}

export default VideoBackground
