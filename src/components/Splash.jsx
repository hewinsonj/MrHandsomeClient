import React from 'react'
import { Link } from 'react-router-dom'

// Landing page. The wordmark (title + tagline) is rendered persistently in App
// and sits centered here; this just provides the full-screen click target one
// page in, with a subtle ENTER cue near the bottom so it doesn't cover the title.
const Splash = () => (
  <Link to='/home' aria-label='Enter site' style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '12vh', cursor: 'pointer' }}>
      <span style={{ opacity: 0.4, fontSize: '0.85rem', letterSpacing: '0.25em' }}>ENTER &rarr;</span>
    </div>
  </Link>
)

export default Splash
