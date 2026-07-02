import { chromium } from 'playwright'
const EXEC = '/private/tmp/pw-browsers/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'
const OUT = '/private/tmp/claude-501/-Users-justinhewinson-SoftEng-projects/scratchpad'
const browser = await chromium.launch({ executablePath: EXEC })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 20000 })
await page.waitForTimeout(5000)
await page.screenshot({ path: `${OUT}/track.png` })
console.log('errors:', errors.join('\n') || 'none')
await browser.close()
