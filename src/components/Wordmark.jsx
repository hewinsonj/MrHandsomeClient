import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import WavyTitle from './WavyTitle'

const FADE_MS       = 260    // opacity fade each way when moving between locations
const FIRST_FADE_MS = 1800   // slower, dramatic fade the very first time it appears

// Band name + tagline, rendered ONCE in App so it never unmounts across route
// changes. Instead of gliding between the splash (centered) and hub (top-left) —
// which animates top/left and stutters on mobile — it CROSSFADES: fade out at the
// old spot, snap to the new spot while invisible, fade back in. Only opacity
// animates (GPU-composited), so it stays smooth even while the scene renders.
const Wordmark = () => {
  const { pathname } = useLocation()

  // `displayPath` is the route whose position we're showing; it lags `pathname`
  // during a fade so the snap happens while the wordmark is invisible.
  const [displayPath, setDisplayPath] = useState(pathname)
  const [shown, setShown] = useState(true)
  useEffect(() => {
    if (pathname === displayPath) return undefined
    setShown(false)                                  // fade out at the old spot
    const start = performance.now()
    let raf = 0
    const tick = () => {
      if (performance.now() - start >= FADE_MS) { setDisplayPath(pathname); setShown(true) }
      else raf = requestAnimationFrame(tick)         // rAF: reliable in a heavy WebGL page
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathname, displayPath])

  const centered = displayPath === '/welcome'                        // splash centers it
  const visible = displayPath === '/welcome' || displayPath === '/home'

  // The very first appearance fades in slowly; after that, quick crossfades.
  const [hasAppeared, setHasAppeared] = useState(false)
  useEffect(() => {
    if (!visible || !shown || hasAppeared) return undefined
    const t = setTimeout(() => setHasAppeared(true), FIRST_FADE_MS)
    return () => clearTimeout(t)
  }, [visible, shown, hasAppeared])
  const fadeMs = hasAppeared ? FADE_MS : FIRST_FADE_MS
  // The title links back to the MR. HANDSOME landing, but only where it's shown
  // AND interactive (the hub). On the splash we let clicks fall through to the
  // "enter" link; elsewhere the wordmark is hidden, so it must not catch clicks.
  const titleClickable = visible && !centered

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        // Position SNAPS (no transition) — the move happens during the fade, so
        // there's no janky top/left animation.
        top: centered ? '50%' : '2rem',
        left: centered ? '50%' : '2rem',
        transform: centered ? 'translate(-50%, -50%)' : 'translate(0%, 0%)',
        zIndex: 2,
        pointerEvents: 'none',            // clicks fall through to the splash link
        opacity: visible && shown ? 1 : 0,
        transition: `opacity ${fadeMs}ms ease`,
        willChange: 'opacity',
      }}
    >
      {/* MR. HANDSOME -> back to the landing page (a descendant can re-enable
          pointer events even though the wrapper has pointer-events: none). */}
      <Link
        to='/welcome'
        aria-label='Home'
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'inline-block',
          pointerEvents: titleClickable ? 'auto' : 'none',
          cursor: titleClickable ? 'pointer' : 'default',
        }}
      >
        <WavyTitle />
      </Link>
      <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.4rem, 6.5vw, 2.6rem)', lineHeight: 1.2, opacity: 0.9, margin: 0, textShadow: '0 3px 12px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.95)' }}>
        singing Shortcomings, and other songs
      </p>
    </div>
  )
}

export default Wordmark
