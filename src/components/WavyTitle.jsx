import React from 'react'

const TITLE_TEXT = 'MR. HANDSOME'

// Pause the animation on genuinely weak devices (or when the user prefers reduced
// motion) — otherwise it keeps moving. The movement is cheap GPU-composited CSS,
// so most phones animate fine; this is the "can't handle it -> hold still" fallback.
const SHOULD_PAUSE =
  typeof window !== 'undefined' && (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (navigator.hardwareConcurrency || 8) <= 2 ||
    (navigator.deviceMemory || 8) <= 2
  )

// Per-letter waving, drifting, multicolored title. Shared by the landing
// splash and the inner hub so the branding is identical in both places.
const WavyTitle = ({ text = TITLE_TEXT }) => (
  <>
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
        font-size: clamp(2.1rem, 11vw, 5rem);   /* fluid so it never overflows narrow screens */
        font-weight: 900;
        letter-spacing: 0.05em;
        margin-bottom: 0.5rem;
        display: inline-flex;
        max-width: 100%;
        white-space: pre;
        /* whole-title gentle drift + continuous color shift */
        animation: titleDrift 9s ease-in-out infinite, titleHue 8s linear infinite;
        text-shadow: 0 4px 14px rgba(0, 0, 0, 0.85);   /* dark shadow behind the letters, not a glow */
      }
      .wavy-title__letter {
        display: inline-block;
        animation: wavyLetter 1.6s ease-in-out infinite;
        will-change: transform;
      }
      /* On phones/touch screens, drop the hue-rotate filter animation — animating a
         filter repaints every frame and can stutter. The rainbow colours + the
         GPU-composited drift/wave stay, so it still moves, just smoothly. */
      @media (max-width: 820px), (pointer: coarse) {
        .wavy-title { animation: titleDrift 9s ease-in-out infinite; }
      }
      /* Fully static when the device can't handle it / reduced motion is requested. */
      .wavy-title--static,
      .wavy-title--static .wavy-title__letter {
        animation: none !important;
      }
      @media (prefers-reduced-motion: reduce) {
        .wavy-title, .wavy-title__letter { animation: none; }
      }
    `}</style>
    <h1 className={SHOULD_PAUSE ? 'wavy-title wavy-title--static' : 'wavy-title'}>
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
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </h1>
  </>
)

export default WavyTitle
