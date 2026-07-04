import React from 'react'
import { Link } from 'react-router-dom'

// Landing page. The wordmark (title + tagline) is rendered persistently in App
// and sits centered here; this just provides the full-screen click target one
// page in, with a subtle ENTER cue near the bottom so it doesn't cover the title.
const Splash = () => (
  <Link to='/home' aria-label='Enter site' style={{ textDecoration: 'none', color: 'inherit' }}>
    <style>{`
      @keyframes enterPulse {
        0%, 100% { opacity: 0.8; transform: translateY(0); }
        50%      { opacity: 1;   transform: translateY(-5px); }
      }
    `}</style>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12vh', cursor: 'pointer' }}>
      <span
        style={{
          fontFamily: "'Great Vibes', cursive",
          fontSize: 'clamp(1.8rem, 6vw, 2.6rem)',
          animation: 'enterPulse 2.2s ease-in-out infinite',
          textShadow: '0 3px 12px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.95)',
        }}
      >
        enter &rarr;
      </span>
    </div>
  </Link>
)

export default Splash
