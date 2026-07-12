import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import WaveSurfer from 'wavesurfer.js'

// Album lives in public/audio/Shortcmings Mr Handsome/<title>.mp3 (folder name
// is spelled that way on disk). Reorder this list to change the tracklist order.
const ALBUM_DIR = '/audio/' + encodeURIComponent('Shortcmings Mr Handsome') + '/'
const TRACKS = [
  'Shortcomings', 'Dead Ringer', 'Gangster Car', 'Heaven', 'Visiting Day', 'LMLOY',
  'Blondie', 'I Was Walking on Flames', 'Two Lifers', 'DQ', 'Trouble', 'Stop That Braggin',
  'Zeros', 'Jealousy', 'Presence of the Lord', 'Hyperion', 'Vanilla Town', 'Chopping Block',
  'Newport Gospel',
].map((title) => ({ title, url: ALBUM_DIR + encodeURIComponent(title) + '.mp3' }))

const GOLD = '#f5c96b'

const fmt = (s) => {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export default function AlbumPlayer() {
  const containerRef = useRef(null)
  const wsRef = useRef(null)
  const autoplayRef = useRef(false)
  const firstLoad = useRef(true)

  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showList, setShowList] = useState(true)   // collapsible tracklist

  // Create the WaveSurfer instance once (first track pre-loaded).
  useEffect(() => {
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(245, 230, 200, 0.28)',
      progressColor: GOLD,
      cursorColor: 'rgba(245, 230, 200, 0.7)',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 56,
      url: TRACKS[0].url,
    })
    wsRef.current = ws
    ws.on('ready', () => {
      setDuration(ws.getDuration())
      setLoading(false)
      if (autoplayRef.current) { autoplayRef.current = false; ws.play() }
    })
    ws.on('timeupdate', (t) => setCurrentTime(t))
    ws.on('play', () => setPlaying(true))
    ws.on('pause', () => setPlaying(false))
    ws.on('finish', () => {
      setIndex((i) => {
        if (i + 1 < TRACKS.length) { autoplayRef.current = true; return i + 1 }
        return i
      })
    })
    return () => { ws.destroy(); wsRef.current = null }
  }, [])

  // Load the selected track when the index changes.
  useEffect(() => {
    const ws = wsRef.current
    if (!ws) return
    if (firstLoad.current) { firstLoad.current = false; return }  // TRACKS[0] already loaded
    setLoading(true)
    setCurrentTime(0)
    ws.load(TRACKS[index].url).catch(() => {})
  }, [index])

  const select = (i) => {
    setShowList(false)   // collapse the list once a song is picked, so the background shows
    if (i === index) { wsRef.current && wsRef.current.playPause(); if (!playing) pauseSiteLoop(); return }
    autoplayRef.current = true
    pauseSiteLoop()
    setIndex(i)
  }
  const playPause = () => {
    const ws = wsRef.current
    if (!ws) return
    if (ws.isPlaying()) ws.pause()
    else { pauseSiteLoop(); ws.play() }
  }
  const step = (delta) => {
    const next = (index + delta + TRACKS.length) % TRACKS.length
    autoplayRef.current = true
    pauseSiteLoop()
    setIndex(next)
  }
  // pause the site's looping background music while the album plays
  const pauseSiteLoop = () => window.dispatchEvent(new Event('mh-album-play'))

  const track = TRACKS[index]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(5rem, 15vw, 9rem) 1rem 6rem', position: 'relative', zIndex: 1 }}>
      <Link to='/home' style={{ alignSelf: 'flex-start', color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }}>
        &larr; Home
      </Link>

      <div style={{ width: '100%', maxWidth: '680px', marginTop: '1rem' }}>
        <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(1.6rem, 6vw, 2.4rem)', textAlign: 'center', margin: '0 0 1.5rem' }}>
          singing Shortcomings, and other songs
        </p>

        {/* Now playing + waveform + transport */}
        <div style={{ background: 'rgba(15, 12, 10, 0.55)', border: `1px solid ${GOLD}55`, borderRadius: '10px', padding: '1rem 1.25rem', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <span style={{ color: GOLD, fontSize: '1.05rem' }}>{index + 1}. {track.title}</span>
            <span style={{ opacity: 0.7, fontSize: '0.85rem' }}>{fmt(currentTime)} / {fmt(duration)}</span>
          </div>

          <div ref={containerRef} style={{ width: '100%', minHeight: '56px', cursor: 'pointer' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', marginTop: '0.75rem' }}>
            <button type='button' onClick={() => step(-1)} aria-label='Previous track' style={btn}>&#9198;</button>
            <button type='button' onClick={playPause} aria-label={playing ? 'Pause' : 'Play'} disabled={loading} style={{ ...btn, fontSize: '1.8rem', opacity: loading ? 0.4 : 1 }}>
              {loading ? '…' : playing ? '❚❚' : '►'}
            </button>
            <button type='button' onClick={() => step(1)} aria-label='Next track' style={btn}>&#9197;</button>
          </div>
        </div>

        {/* Collapsible tracklist — closes when a song is picked so the background shows */}
        <button
          type='button'
          onClick={() => setShowList((s) => !s)}
          aria-expanded={showList}
          style={{
            width: '100%', marginTop: '1.25rem', background: 'transparent', border: 'none',
            color: '#f0f0f0', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.85, padding: '0.5rem 0.25rem',
          }}
        >
          <span style={{ transition: 'transform 0.2s', transform: showList ? 'rotate(90deg)' : 'none' }}>&#9656;</span>
          {showList ? 'Hide' : 'Show'} tracklist ({TRACKS.length} songs)
        </button>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: showList ? 'block' : 'none' }}>
          {TRACKS.map((t, i) => (
            <li key={t.title}>
              <button
                type='button'
                onClick={() => select(i)}
                style={{
                  width: '100%', textAlign: 'left', background: i === index ? 'rgba(245, 201, 107, 0.12)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.08)', color: i === index ? GOLD : '#f0f0f0',
                  padding: '0.7rem 0.75rem', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem',
                  display: 'flex', gap: '0.75rem', alignItems: 'center',
                }}
              >
                <span style={{ opacity: 0.5, minWidth: '1.6rem' }}>{String(i + 1).padStart(2, '0')}</span>
                <span>{t.title}</span>
                {i === index && playing && <span style={{ marginLeft: 'auto', color: GOLD }}>♪</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const btn = {
  background: 'transparent',
  border: 'none',
  color: '#f5e6c8',
  cursor: 'pointer',
  fontSize: '1.3rem',
  lineHeight: 1,
  padding: '0.4rem',
}
