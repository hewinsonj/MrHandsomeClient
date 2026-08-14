import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '@react-three/drei'
import { SCENE_ENABLED } from '../sceneConfig'

// The menu (MR. HANDSOME landing at /welcome) opens once the background music
// starts — which itself waits for the video to start. This safety timeout opens
// it anyway if the audio never starts (e.g. blocked), so we can't stay on black.
const MENU_FALLBACK_MS = 6000

// The landing page: closed red curtains (rendered in the 3D scene) with nothing
// on screen but a "look" button. Pressing it starts the intro, then — once the
// sequence has played — hands off to the existing MR. HANDSOME splash.
const CurtainIntro = ({ started, onLook }) => {
  const navigate = useNavigate()

  // Hold the "look" button until every model/texture has loaded (an hourglass
  // shows over the black overlay meanwhile). Fallback so it can't stay hidden.
  const { active, total } = useProgress()
  // With the 3D scene off there's nothing to load, so show the button immediately.
  const [assetsReady, setAssetsReady] = useState(!SCENE_ENABLED)
  useEffect(() => { if (total > 0 && !active) setAssetsReady(true) }, [active, total])
  useEffect(() => {
    const t = setTimeout(() => setAssetsReady(true), 12000)
    return () => clearTimeout(t)
  }, [])

  // Once "look" is pressed, open the menu (hand off to /welcome) when the music
  // starts — the last link in the look -> video -> audio -> menu chain — with a
  // fallback timeout so a blocked/silent audio can't strand us on black.
  useEffect(() => {
    if (!started) return undefined
    let done = false
    const openMenu = () => { if (done) return; done = true; navigate('/welcome') }
    window.addEventListener('mh-audio-start', openMenu)
    const t = setTimeout(openMenu, MENU_FALLBACK_MS)
    return () => { window.removeEventListener('mh-audio-start', openMenu); clearTimeout(t) }
  }, [started, navigate])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      {assetsReady && !started && (
        <button
          type='button'
          onClick={onLook}
          className='look-btn'
          style={{
            pointerEvents: 'auto',
            fontFamily: "'Special Elite', monospace",
            fontSize: '1.5rem',
            letterSpacing: '0.35em',
            color: '#f5e6c8',
            background: 'rgba(25, 0, 0, 0.35)',
            border: '1px solid rgba(245, 230, 200, 0.55)',
            borderRadius: '4px',
            padding: '0.8rem 2.6rem 0.8rem 3rem',
            cursor: 'pointer',
            backdropFilter: 'blur(2px)',
          }}
        >
          look
        </button>
      )}
    </div>
  )
}

export default CurtainIntro
