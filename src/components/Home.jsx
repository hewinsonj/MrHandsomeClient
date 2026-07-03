import React from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

const navLinkStyle = { color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }

// Account/auth links (Sign In, Sign Up, Change Password, Sign Out) are hidden
// for now — flip to true to bring them back.
const SHOW_USER_LINKS = false

// The title + tagline wordmark is rendered persistently in App (top-left here);
// this page holds the rest of the content, centered.
const Home = ({ user }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center', padding: '2rem 2rem 10vh' }}>
    {/* Social / Streaming links — coming soon */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center', marginBottom: '2.5rem' }}>
      <span style={{ opacity: 0.6, fontStyle: 'italic' }}>social links coming soon...</span>
      <a href='mailto:palacerevolution2000@yahoo.com' style={{ color: '#f0f0f0' }}>Contact Us</a>
    </div>

    <Link to='/shop'>
      <Button variant='outline-light' size='lg'>Shop / Downloads</Button>
    </Link>

    {/* Account / user links (Sign In / Sign Up / etc.) — hidden for now */}
    {SHOW_USER_LINKS && (
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
    )}

    {SHOW_USER_LINKS && !user && (
      <p style={{ marginTop: '1rem', opacity: 0.5, fontSize: '0.9rem' }}>
        <Link to='/sign-in' style={{ color: '#f0f0f0' }}>Sign in</Link> to purchase &amp; download
      </p>
    )}
  </div>
)

export default Home
