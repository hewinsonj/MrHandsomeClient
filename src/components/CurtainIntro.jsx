import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// How long the curtain-open + camera-glide sequence plays before we reveal the
// MR. HANDSOME landing (/welcome). Tuned to the camera reaching + passing the
// curtains (see CURTAIN_* + CAM_SPEED in BackgroundScene).
const SEQUENCE_MS = 6000

// The landing page: closed red curtains (rendered in the 3D scene) with nothing
// on screen but a "look" button. Pressing it starts the intro, then — once the
// sequence has played — hands off to the existing MR. HANDSOME splash.
const CurtainIntro = ({ started, onLook }) => {
  const navigate = useNavigate()

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
      {!started && (
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
