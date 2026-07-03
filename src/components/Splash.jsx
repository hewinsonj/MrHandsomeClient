import React from 'react'
import { Link } from 'react-router-dom'
import WavyTitle from './WavyTitle'

// Landing page: nothing but the band name + tagline over the scene.
// The whole splash is a link one page in to the hub (everything else).
const Splash = () => (
  <Link to='/home' aria-label='Enter site' style={{ textDecoration: 'none', color: 'inherit' }}>
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', cursor: 'pointer' }}>
      <WavyTitle />
      <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.6rem', lineHeight: 1.2, opacity: 0.9, marginBottom: '2rem' }}>
        singing Shortcomings, and other songs
      </p>
      <span style={{ opacity: 0.4, fontSize: '0.85rem', letterSpacing: '0.25em' }}>ENTER &rarr;</span>
    </div>
  </Link>
)

export default Splash
