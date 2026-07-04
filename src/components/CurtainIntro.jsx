import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@react-three/drei'

// How long the curtain-open sequence plays after "look" before we reveal the
// MR. HANDSOME landing (/welcome), where the title drops into place. The curtains
// keep opening behind the scene after the hand-off.
const SEQUENCE_MS = 1500

// The landing page: closed red curtains (rendered in the 3D scene) with nothing
// on screen but a "look" button. Pressing it starts the intro, then — once the
// sequence has played — hands off to the existing MR. HANDSOME splash.
const CurtainIntro = ({ started, onLook }) => {
  const navigate = useNavigate()

  // Hold the "look" button until every model/texture has loaded (an hourglass
  // shows over the black overlay meanwhile). Fallback so it can't stay hidden.
  const { active, total } = useProgress()
  const [assetsReady, setAssetsReady] = useState(false)
  useEffect(() => { if (total > 0 && !active) setAssetsReady(true) }, [active, total])
  useEffect(() => {
    const t = setTimeout(() => setAssetsReady(true), 12000)
    return () => clearTimeout(t)
  }, [])

  // Schedule the hand-off as an effect tied to `started` (with cleanup) rather
  // than inside the click handler, so it can't double-fire or leak a stale timer.
  // Hand off after the sequence. Driven by requestAnimationFrame rather than
  // setTimeout: this page runs a heavy WebGL loop that can starve timers, and
  // rAF also ties the countdown to the frames the scene is actually rendering.
  useEffect(() => {
    if (!started) return undefined
    const start = performance.now()
    let raf = 0
    const tick = () => {
      if (performance.now() - start >= SEQUENCE_MS) navigate('/welcome')
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {assetsReady && !started && (
        <button
          type='button'
          onClick={onLook}
          className='look-btn'
          style={{
            pointerEvents: 'auto',
            fontFamily: "'Special Elite', monospace",
            fontSize: '1.5rem',
            letterSpacing: '0.35em',
            color: '#f5e6c8',
            background: 'rgba(25, 0, 0, 0.35)',
            border: '1px solid rgba(245, 230, 200, 0.55)',
            borderRadius: '4px',
            padding: '0.8rem 2.6rem 0.8rem 3rem',
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
          }}
        >
          look
        </button>
      )}
    </div>
  )
}

export default CurtainIntro
