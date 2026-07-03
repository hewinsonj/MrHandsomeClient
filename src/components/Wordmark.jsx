import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import WavyTitle from './WavyTitle'

// Band name + tagline, rendered ONCE in App so it never unmounts across route
// changes. Instead of jumping, it glides between the splash's centered position
// and the top-left corner used on the hub — the CSS transition animates whenever
// the route (and therefore its target position) changes.
const Wordmark = () => {
  const { pathname } = useLocation()
  const centered = pathname === '/welcome'                        // splash centers it
  const visible = pathname === '/welcome' || pathname === '/home' // shown on those two
  // The title links back to the MR. HANDSOME landing, but only where it's shown
  // AND interactive (the hub). On the splash we let clicks fall through to the
  // "enter" link; elsewhere the wordmark is hidden, so it must not catch clicks.
  const titleClickable = visible && !centered

  return (
    <div
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        // Animate top/left (50% <-> 2rem) plus a pure-% translate for the
        // centering offset — all same-type interpolations, so they glide
        // reliably rather than snapping (mixed transform units don't tween).
        top: centered ? '50%' : '2rem',
        left: centered ? '50%' : '2rem',
        transform: centered ? 'translate(-50%, -50%)' : 'translate(0%, 0%)',
        zIndex: 2,
        pointerEvents: 'none',            // clicks fall through to the splash link
        opacity: visible ? 1 : 0,
        transition:
          'top 0.9s cubic-bezier(0.65, 0, 0.2, 1), ' +
          'left 0.9s cubic-bezier(0.65, 0, 0.2, 1), ' +
          'transform 0.9s cubic-bezier(0.65, 0, 0.2, 1), ' +
          'opacity 0.4s ease',
        willChange: 'top, left, transform',
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
      <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.4rem, 6.5vw, 2.6rem)', lineHeight: 1.2, opacity: 0.9, margin: 0 }}>
        singing Shortcomings, and other songs
      </p>
    </div>
  )
}

export default Wordmark
