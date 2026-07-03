import React from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

const TITLE_TEXT = 'MR. HANDSOME'

const navLinkStyle = { color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }

// Per-letter waving, drifting, multicolored title
const WavyTitle = ({ text }) => (
  <h1 className='wavy-title'>
    {text.split('').map((ch, i) => (
      <span
        key={i}
        className='wavy-title__letter'
        style={{
          // rainbow spread across the letters
          color: `hsl(${(i / text.length) * 360}, 100%, 62%)`,
          // stagger the wave so it ripples left-to-right
          animationDelay: `${i * 0.09}s`,
        }}
      >
        {ch === ' ' ? ' ' : ch}
      </span>
    ))}
  </h1>
)

const Home = ({ user }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <style>{`
      @keyframes wavyLetter {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50%      { transform: translateY(-0.22em) rotate(-3deg); }
      }
      @keyframes titleDrift {
        0%   { transform: translate(0, 0) rotate(0deg); }
        25%  { transform: translate(10px, -6px) rotate(0.6deg); }
        50%  { transform: translate(-8px, 5px) rotate(-0.8deg); }
        75%  { transform: translate(6px, 8px) rotate(0.4deg); }
        100% { transform: translate(0, 0) rotate(0deg); }
      }
      @keyframes titleHue {
        from { filter: hue-rotate(0deg); }
        to   { filter: hue-rotate(360deg); }
      }
      .wavy-title {
        font-size: 5rem;
        font-weight: 900;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
        display: inline-flex;
        white-space: pre;
        /* whole-title gentle drift + continuous color shift */
        animation: titleDrift 9s ease-in-out infinite, titleHue 8s linear infinite;
        text-shadow: 0 0 18px rgba(255, 255, 255, 0.25);
      }
      .wavy-title__letter {
        display: inline-block;
        animation: wavyLetter 1.6s ease-in-out infinite;
        will-change: transform;
      }
    `}</style>
    <WavyTitle text={TITLE_TEXT} />
    <p style={{ fontSize: '1.25rem', opacity: 0.7, marginBottom: '2rem' }}>
      Music. Merch. Mayhem.
    </p>

    {/* Social / Streaming links — fill in real URLs */}
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
      <a href='#' style={{ color: '#1DB954' }}>Spotify</a>
      <a href='#' style={{ color: '#fc0' }}>Apple Music</a>
      <a href='#' style={{ color: '#ff0000' }}>YouTube</a>
      <a href='#' style={{ color: '#E1306C' }}>Instagram</a>
      <a href='#' style={{ color: '#1DA1F2' }}>Twitter / X</a>
      <a href='mailto:band@mrhandsome.com' style={{ color: '#f0f0f0' }}>Email Us</a>
    </div>

    <Link to='/shop'>
      <Button variant='outline-light' size='lg'>Shop / Downloads</Button>
    </Link>

    {/* Account / navigation links — these used to live in the top menu bar */}
    <nav style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', marginTop: '1.75rem', fontSize: '0.95rem' }}>
      {user ? (
        <>
          <span style={{ opacity: 0.55 }}>{user.email}</span>
          <Link to='/change-password' style={navLinkStyle}>Change Password</Link>
          <Link to='/sign-out' style={navLinkStyle}>Sign Out</Link>
        </>
      ) : (
        <>
          <Link to='/sign-up' style={navLinkStyle}>Sign Up</Link>
          <Link to='/sign-in' style={navLinkStyle}>Sign In</Link>
        </>
      )}
    </nav>

    {!user && (
      <p style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.9rem' }}>
        <Link to='/sign-in' style={{ color: '#f0f0f0' }}>Sign in</Link> to purchase &amp; download
      </p>
    )}
  </div>
)

export default Home
