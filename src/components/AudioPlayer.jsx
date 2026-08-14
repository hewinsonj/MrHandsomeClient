import React, { useEffect, useRef, useState } from 'react'

// Looping background track. The filename has spaces/parens, so encode it.
const AUDIO_SRC = '/audio/' + encodeURIComponent('web loop 6 17 26 (1).wav')

// Background music with a fixed play/pause control in the bottom-right corner.
// Mounted once in App (outside <Routes>) so playback persists across navigation.
const AudioPlayer = () => {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.6

    // Keep button state in sync, and announce when the music actually starts so
    // the menu can open in step with it.
    const onPlay = () => { setPlaying(true); window.dispatchEvent(new Event('mh-audio-start')) }
    const onPause = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)

    // Duck the looping background music when the album player starts a track.
    const onAlbumPlay = () => audio.pause()
    window.addEventListener('mh-album-play', onAlbumPlay)

    // Start the music only when the background video starts (chained off the
    // look tap). If the browser blocks it, fall back to the first user gesture.
    let onGesture = null
    const startMusic = () => {
      audio.play().catch(() => {
        if (onGesture) return
        onGesture = () => {
          audio.play().catch(() => {})
          window.removeEventListener('pointerdown', onGesture)
          window.removeEventListener('keydown', onGesture)
          onGesture = null
        }
        window.addEventListener('pointerdown', onGesture)
        window.addEventListener('keydown', onGesture)
      })
    }
    window.addEventListener('mh-video-start', startMusic)

    return () => {
      window.removeEventListener('mh-video-start', startMusic)
      if (onGesture) {
        window.removeEventListener('pointerdown', onGesture)
        window.removeEventListener('keydown', onGesture)
      }
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      window.removeEventListener('mh-album-play', onAlbumPlay)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  return (
    <>
      <audio ref={audioRef} src={AUDIO_SRC} loop preload='auto' />
      <button
        type='button'
        className='audio-toggle'
        onClick={toggle}
        aria-label={playing ? 'Pause music' : 'Play music'}
        title={playing ? 'Pause music' : 'Play music'}
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          background: 'rgba(15, 15, 15, 0.6)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px rgba(140, 0, 238, 0.35)',
        }}
      >
        {playing ? (
          // pause icon
          <svg width='18' height='18' viewBox='0 0 12 14' fill='currentColor' aria-hidden='true'>
            <rect x='0' y='0' width='4' height='14' rx='1' />
            <rect x='8' y='0' width='4' height='14' rx='1' />
          </svg>
        ) : (
          // play icon (nudged right so it looks centered)
          <svg width='18' height='18' viewBox='0 0 14 16' fill='currentColor' aria-hidden='true' style={{ marginLeft: '2px' }}>
            <path d='M0 0 L14 8 L0 16 Z' />
          </svg>
        )}
      </button>
    </>
  )
}

export default AudioPlayer
