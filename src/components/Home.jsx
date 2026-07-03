import React from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import WavyTitle from './WavyTitle'

const navLinkStyle = { color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }

const Home = ({ user }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <WavyTitle />
    <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: '2.6rem', lineHeight: 1.2, opacity: 0.9, marginBottom: '2rem' }}>
      singing Shortcomings, and other songs
    </p>

    {/* Social / Streaming links — coming soon */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2.5rem' }}>
      <span style={{ opacity: 0.6, fontStyle: 'italic' }}>social links coming soon...</span>
      <a href='mailto:palacerevolution2000@yahoo.com' style={{ color: '#f0f0f0' }}>Email Us</a>
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
