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

// Social / follow links
const SOCIAL_LINKS = [
  { label: 'YouTube',   url: 'https://www.youtube.com/@Mr.HandsomeSings',            color: '#FF0000' },
  { label: 'Instagram', url: 'https://www.instagram.com/mrhandsomesings/',           color: '#E1306C' },
  { label: 'TikTok',    url: 'https://www.tiktok.com/@mr..handsome093',              color: '#25F4EE' },
  { label: 'Facebook',  url: 'https://www.facebook.com/profile.php?id=61593332696120', color: '#1877F2' },
  { label: 'Linktree',  url: 'https://linktr.ee/mrhandsomesings',                    color: '#43E660' },
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
      {/* Follow / social — links slowly orbit a center "follow" label. Each label
          counter-rotates so it stays upright while its position revolves. */}
      <div className='orbit-wrap' aria-label='Follow Mr. Handsome'>
        <style>{`
          @keyframes orbitSpin    { to { transform: rotate(360deg); } }
          @keyframes orbitSpinRev { to { transform: rotate(-360deg); } }
          .orbit-wrap {
            --r: clamp(80px, 30vw, 132px);   /* orbit radius */
            --d: calc(2 * var(--r) + 4.5rem); /* box leaves room for the labels */
            position: relative;
            width: var(--d);
            height: var(--d);
            margin: 0.5rem auto;
          }
          .orbit { position: absolute; inset: 0; animation: orbitSpin 34s linear infinite; }
          .orbit-center {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            font-family: 'Great Vibes', cursive;
            font-size: clamp(1.4rem, 6vw, 2rem);
            opacity: 0.85; pointer-events: none;
          }
          .orbit-item {
            position: absolute; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(var(--a)) translate(var(--r)) rotate(calc(-1 * var(--a)));
            text-decoration: none; white-space: nowrap;
          }
          /* cancels the parent's spin so the text never goes upside-down */
          .orbit-label { display: inline-block; animation: orbitSpinRev 34s linear infinite; }
          .orbit-item:hover .orbit-label { text-decoration: underline; }
          @media (prefers-reduced-motion: reduce) {
            .orbit, .orbit-label { animation: none; }
          }
        `}</style>
        <span className='orbit-center'>follow</span>
        <div className='orbit'>
          {SOCIAL_LINKS.map(({ label, url, color }, i) => (
            <a
              key={label}
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='orbit-item'
              style={{ '--a': `${-90 + (360 / SOCIAL_LINKS.length) * i}deg`, color }}
            >
              <span className='orbit-label'>{label}</span>
            </a>
          ))}
        </div>
      </div>

      <a href='mailto:mrhandsomesings@gmail.com' style={{ color: '#f0f0f0' }}>Contact Us</a>
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
