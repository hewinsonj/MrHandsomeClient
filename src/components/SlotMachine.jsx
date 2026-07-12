import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// Each reel is a real 3D drum: the symbols are faces of a cylinder
// (rotateX(i·angle) translateZ(radius)), and spinning rotates the whole drum on
// its X axis. `perspective` on the window gives the depth so faces curve away at
// the top/bottom like a physical mechanical reel. A little JS picks the results.
const SYMBOLS = ['🎸', '🎤', '💿', '🎩', '⭐', '🎵', '🍒']
const S = SYMBOLS.length
const FACES = 14                             // 2 turns of symbols -> rounder wheel
const ANGLE = 360 / FACES                    // degrees between faces
const H = 92                                 // face height (px)
const REEL_W = 104                           // reel width (px)
const WINDOW = 260                           // window height — tall enough to see the wheel curve
const RADIUS = Math.round((H / 2) / Math.tan(Math.PI / FACES))  // drum radius
const SPIN_COST = 5
const SMALL_WIN = 15
const JACKPOT = 150
const GOLD = '#f5c96b'

// rotateX that brings symbol k to the front
const rotFor = (k) => -k * ANGLE

export default function SlotMachine() {
  const [rot, setRot] = useState([rotFor(0), rotFor(1), rotFor(2)])  // per-reel drum rotation (deg)
  const [durations, setDurations] = useState([0, 0, 0])
  const [spinning, setSpinning] = useState(false)
  const [credits, setCredits] = useState(100)
  const [message, setMessage] = useState('Pull the handle')
  const [win, setWin] = useState(false)

  const spin = () => {
    if (spinning || credits < SPIN_COST) return
    setSpinning(true)
    setWin(false)
    setMessage('')
    setCredits((c) => c - SPIN_COST)

    const results = [0, 1, 2].map(() => Math.floor(Math.random() * S))
    const durs = [2.4, 3.0, 3.6]
    const next = rot.map((r, i) => {
      const loops = 5 + i                            // later reels spin more (stagger the stop)
      const base = r - loops * 360                   // spin downward several full turns
      const targetMod = rotFor(results[i])           // final rotation mod 360
      return base - ((((base - targetMod) % 360) + 360) % 360)  // snap down onto the target face
    })
    setDurations(durs)
    setRot(next)
    setTimeout(() => finish(results), durs[2] * 1000 + 150)
  }

  const finish = (r) => {
    setSpinning(false)
    if (r[0] === r[1] && r[1] === r[2]) {
      setCredits((c) => c + JACKPOT); setWin(true)
      setMessage(`JACKPOT!  ${SYMBOLS[r[0]]}${SYMBOLS[r[0]]}${SYMBOLS[r[0]]}  +${JACKPOT}`)
    } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
      setCredits((c) => c + SMALL_WIN); setWin(true)
      setMessage(`Two of a kind!  +${SMALL_WIN}`)
    } else {
      setMessage('So close… spin again')
    }
  }

  const broke = credits < SPIN_COST

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(5rem, 15vw, 9rem) 1rem 4rem', position: 'relative', zIndex: 1 }}>
      <style>{`
        @keyframes winPulse { 0%,100% { box-shadow: 0 0 30px rgba(245,201,107,0.35), inset 0 0 20px rgba(0,0,0,0.6); } 50% { box-shadow: 0 0 55px rgba(245,201,107,0.85), inset 0 0 20px rgba(0,0,0,0.6); } }
        .slot-frame { background: linear-gradient(180deg, #2a1a08, #120a04); border: 3px solid ${GOLD}; border-radius: 16px; padding: 1.25rem; box-shadow: 0 0 30px rgba(245,201,107,0.35), inset 0 0 20px rgba(0,0,0,0.6); }
        .slot-frame.win { animation: winPulse 0.6s ease-in-out 3; }
        .reels { position: relative; display: flex; gap: 0.75rem; background: #0a0705; border-radius: 8px; padding: 0.6rem; }
        .reel-outer { position: relative; width: ${REEL_W}px; height: ${WINDOW}px; perspective: 760px; overflow: hidden; border-radius: 8px; background: #0a0705; }
        .drum { position: absolute; left: 0; right: 0; top: calc(50% - ${H / 2}px); height: ${H}px; transform-style: preserve-3d; }
        .face {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 50px; line-height: 1;
          background: linear-gradient(180deg, #2a2013, #140d07);
          border-top: 1px solid rgba(245,201,107,0.16);
          border-bottom: 1px solid rgba(0,0,0,0.65);
          backface-visibility: hidden;
        }
        /* cylindrical shading — dark where the drum curves away top/bottom, lit at the payline */
        .reel-shade {
          position: absolute; inset: 0; pointer-events: none; border-radius: 8px;
          background: linear-gradient(180deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.12) 58%, rgba(0,0,0,0.92) 100%);
          box-shadow: inset 0 0 18px rgba(0,0,0,0.8);
        }
        .payline { position: absolute; left: 0.35rem; right: 0.35rem; top: 50%; height: 2px; transform: translateY(-1px); background: rgba(245,201,107,0.55); box-shadow: 0 0 8px rgba(245,201,107,0.6); pointer-events: none; z-index: 3; }
        .spin-btn { font-family: inherit; font-size: 1.15rem; letter-spacing: 0.1em; color: #1a1206; background: ${GOLD}; border: none; border-radius: 8px; padding: 0.8rem 2.4rem; cursor: pointer; box-shadow: 0 4px 0 #b8922f; transition: transform 0.06s, box-shadow 0.06s; }
        .spin-btn:active:not(:disabled) { transform: translateY(3px); box-shadow: 0 1px 0 #b8922f; }
        .spin-btn:disabled { opacity: 0.5; cursor: default; }
      `}</style>

      <Link to='/home' style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: '#f0f0f0', textDecoration: 'none', opacity: 0.85 }}>&larr; Home</Link>

      <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(2rem, 9vw, 3.2rem)', color: GOLD, margin: '0 0 1.5rem', textShadow: '0 3px 10px rgba(0,0,0,0.9)' }}>
        Handsome Jackpot
      </h1>

      <div className={win ? 'slot-frame win' : 'slot-frame'}>
        <div className='reels'>
          {rot.map((r, i) => (
            <div className='reel-outer' key={i}>
              <div
                className='drum'
                style={{ transform: `rotateX(${r}deg)`, transition: durations[i] ? `transform ${durations[i]}s cubic-bezier(0.2, 0.85, 0.25, 1)` : 'none' }}
              >
                {Array.from({ length: FACES }, (_, f) => (
                  <div className='face' key={f} style={{ transform: `rotateX(${f * ANGLE}deg) translateZ(${RADIUS}px)` }}>
                    {SYMBOLS[f % S]}
                  </div>
                ))}
              </div>
              <div className='reel-shade' />
            </div>
          ))}
          <div className='payline' />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', margin: '1.25rem 0', minHeight: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span>Credits: <b style={{ color: GOLD }}>{credits}</b></span>
        <span style={{ color: '#f5e6c8' }}>{message}</span>
      </div>

      <button className='spin-btn' onClick={spin} disabled={spinning || broke}>
        {spinning ? 'Spinning…' : broke ? 'Out of credits' : `SPIN  (–${SPIN_COST})`}
      </button>
      {broke && (
        <button
          onClick={() => { setCredits(100); setMessage('Fresh stack — good luck'); setWin(false) }}
          style={{ marginTop: '0.9rem', background: 'transparent', border: `1px solid ${GOLD}`, color: GOLD, borderRadius: '6px', padding: '0.45rem 1.1rem', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Add credits
        </button>
      )}
    </div>
  )
}
