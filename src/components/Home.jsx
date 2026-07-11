import React from 'react'
import { Link } from 'react-router-dom'
import Button from 'react-bootstrap/Button'

const navLinkStyle = { color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }

// Streaming links for "singing Shortcomings, and other songs"
const STREAMING_LINKS = [
  { label: 'Listen Everywhere', url: 'https://mrhandsome.hearnow.com/mr-handsome-singing-shortcomings-and-other-songs', color: '#f5e6c8' },
  { label: 'Spotify',      url: 'https://open.spotify.com/album/67Or9nasToypgqrl5ZaAwi', color: '#1DB954' },
  { label: 'Apple Music',  url: 'https://music.apple.com/us/album/mr-handsome-singing-shortcomings-and-other-songs/6785654143', color: '#FA243C' },
  { label: 'Amazon Music', url: 'https://music.amazon.com/albums/B0H6Z6CVD8?tag=fndcmpgns-20', color: '#25D1DA' },
  { label: 'Pandora',      url: 'https://www.pandora.com/artist/mr-handsome/mr-handsome-singing-shortcomings-and-other-songs/ALrdzZn7Xp3p6wk', color: '#4B6EFF' },
  { label: 'Deezer',       url: 'https://www.deezer.com/us/album/1017432371', color: '#A238FF' },
]

// Account/auth links (Sign In, Sign Up, Change Password, Sign Out) are hidden
// for now — flip to true to bring them back.
const SHOW_USER_LINKS = false

// The title + tagline wordmark is rendered persistently in App (top-left here);
// this page holds the rest of the content, centered.
const Home = ({ user }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'center', padding: '2rem 2rem 10vh' }}>
    {/* Streaming links */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem' }}>
      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '640px' }}>
        {STREAMING_LINKS.map(({ label, url, color }) => (
          <a key={label} href={url} target='_blank' rel='noopener noreferrer' style={{ color, textDecoration: 'none' }}>
            {label}
          </a>
        ))}
      </div>
      <a href='mailto:palacerevolution2000@yahoo.com' style={{ color: '#f0f0f0' }}>Contact Us</a>
    </div>

    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link to='/listen'>
        <Button variant='outline-light' size='lg'>&#9835; Listen</Button>
      </Link>
      <Link to='/shop'>
        <Button variant='outline-light' size='lg'>Shop / Downloads</Button>
      </Link>
    </div>

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
