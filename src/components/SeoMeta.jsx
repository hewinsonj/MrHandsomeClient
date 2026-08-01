import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Now that each route has a real, crawlable URL (BrowserRouter), give each page
// its own <title>, meta description, and canonical so they can rank on their own
// terms instead of all sharing the homepage's tags. Google renders JS, so these
// client-side updates are picked up; social scrapers don't run JS, so the static
// Open Graph tags in index.html stay as the homepage defaults.
const SITE = 'https://mrhandsomesings.netlify.app'

const DEFAULT_DESC =
  "Mr. Handsome is a rock, soul, and folk artist based in Atlanta, GA. Stream 'singing Shortcomings, and other songs' and shop music and merch."

const DEFAULT_TITLE = 'Mr. Handsome — Rock, Soul & Folk Artist in Atlanta, GA'

const PAGES = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESC },
  '/welcome': { title: DEFAULT_TITLE, description: DEFAULT_DESC },
  '/home': {
    title: 'Music, Links & Merch — Mr. Handsome | Atlanta, GA',
    description:
      'Stream Mr. Handsome on Spotify, Apple Music, Amazon, Pandora & Deezer, and shop music and merch. Atlanta rock, soul & folk.',
  },
  '/listen': {
    title: "Listen: 'singing Shortcomings, and other songs' — Mr. Handsome",
    description:
      "Stream the full album 'singing Shortcomings, and other songs' by Atlanta rock, soul & folk artist Mr. Handsome.",
  },
  '/shop': {
    title: 'Shop Music & Merch — Mr. Handsome',
    description: 'Buy digital downloads, CDs, and merch from Atlanta rock/soul artist Mr. Handsome.',
  },
}

// Account/checkout flows carry no public content — keep them out of the index.
const NOINDEX = new Set(['/sign-in', '/sign-up', '/sign-out', '/change-password', '/checkout'])

const upsertMeta = (name, content) => {
  let el = document.head.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const SeoMeta = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    const page = PAGES[pathname] || { title: DEFAULT_TITLE, description: DEFAULT_DESC }
    document.title = page.title
    upsertMeta('description', page.description)
    upsertMeta('robots', NOINDEX.has(pathname) ? 'noindex, nofollow' : 'index, follow')
    setCanonical(SITE + (pathname === '/' ? '/' : pathname))
  }, [pathname])

  return null
}

export default SeoMeta
