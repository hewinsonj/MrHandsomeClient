import React, { useState } from 'react'
import { Link } from 'react-router-dom'

// CSS reels + a little JS for the brains (random result, staggered stops, wins).
const SYMBOLS = ['🎸', '🎤', '💿', '🎩', '⭐', '🎵', '🍒']
const S = SYMBOLS.length
const LOOPS = 24
const STRIP = Array.from({ length: LOOPS * S }, (_, i) => SYMBOLS[i % S])
const H = 100          // symbol height (px)
const SPIN_COST = 5
const SMALL_WIN = 15   // two of a kind
const JACKPOT = 150    // three of a kind
const GOLD = '#f5c96b'

export default function SlotMachine() {
  const [positions, setPositions] = useState([0, 1, 2])   // flat index each reel shows
  const [durations, setDurations] = useState([0, 0, 0])   // per-reel transition seconds
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

    // Snap each reel to a low copy of its current symbol (no animation) so the
    // spin distance stays inside the strip.
    const bases = positions.map((p) => ((p % S) + S) % S)
    setDurations([0, 0, 0])
    setPositions(bases)

    // Next frame, spin down to random targets with staggered stops.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const results = [0, 1, 2].map(() => Math.floor(Math.random() * S))
      const targets = bases.map((b, i) => {
        const delta = ((results[i] - (b % S)) + S) % S
        return b + (5 + i * 2) * S + delta     // several full loops, then land on results[i]
      })
      const durs = [2.2, 2.8, 3.4]
      setDurations(durs)
      setPositions(targets)
      setTimeout(() => finish(results), durs[2] * 1000 + 150)
    }))
  }

  const finish = (r) => {
    setSpinning(false)
    if (r[0] === r[1] && r[1] === r[2]) {
      setCredits((c) => c + JACKPOT)
      setWin(true)
      setMessage(`JACKPOT!  ${SYMBOLS[r[0]]}${SYMBOLS[r[0]]}${SYMBOLS[r[0]]}  +${JACKPOT}`)
    } else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) {
      setCredits((c) => c + SMALL_WIN)
      setWin(true)
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
        .reels { position: relative; display: flex; gap: 0.75rem; background: #0a0705; border-radius: 8px; padding: 0.5rem; }
        .reel { width: ${H}px; height: ${H}px; overflow: hidden; border-radius: 6px; background: radial-gradient(circle at 50% 38%, #211710, #0a0705); box-shadow: inset 0 8px 14px rgba(0,0,0,0.85), inset 0 -8px 14px rgba(0,0,0,0.85); }
        .reel-strip { will-change: transform; }
        .symbol { height: ${H}px; display: flex; align-items: center; justify-content: center; font-size: 54px; line-height: 1; }
        .payline { position: absolute; left: 0.35rem; right: 0.35rem; top: 50%; height: 2px; transform: translateY(-1px); background: rgba(245,201,107,0.55); box-shadow: 0 0 8px rgba(245,201,107,0.6); pointer-events: none; }
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
          {positions.map((pos, i) => (
            <div className='reel' key={i}>
              <div
                className='reel-strip'
                style={{ transform: `translateY(${-pos * H}px)`, transition: durations[i] ? `transform ${durations[i]}s cubic-bezier(0.15, 0.85, 0.25, 1)` : 'none' }}
              >
                {STRIP.map((sym, j) => <div className='symbol' key={j}>{sym}</div>)}
              </div>
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
