// Master toggle for the live Three.js background. Set SCENE_ENABLED = true to
// bring the animated corridor back; false shows a static screenshot instead.
export const SCENE_ENABLED = false
export const STATIC_BG = '/background/background.png'

// Background video sequence (shown while SCENE_ENABLED is false): the intro clip
// plays once after the look-fade, runs straight into the loop clip, which then
// loops forever crossfading into itself. STATIC_BG doubles as the poster/fallback.
export const BG_CLIP_INTRO = '/background/openingClipTony1st.mp4'
export const BG_CLIP_LOOP  = '/background/openingClipTony2nd.mp4'
