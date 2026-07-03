import React from 'react'

// Gaudy gilt picture frame (Rijksmuseum SK-L-2049, CC0) rendered around the
// whole viewport via CSS border-image, with a neon glow tuned to the corridor
// lights. Fixed + pointer-events:none so it frames everything without ever
// intercepting clicks. Layout/z-index live inline (they must beat the
// `#root > *` rule in index.css); the ornament + glow live in the .gold-frame
// class. See index.css and public/frames/gold-frame.webp.
const GoldFrame = () => (
  <div
    className='gold-frame'
    aria-hidden='true'
    style={{ position: 'fixed', inset: 0, zIndex: 9998, pointerEvents: 'none' }}
  />
)

export default GoldFrame
