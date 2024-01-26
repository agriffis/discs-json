/**
 * Scrape the TSA HTML for discs.
 */
import * as assets from '../lib/assets.ts'
import * as tsa from '../lib/tsa.ts'

async function main() {
  let html = await fetch('https://thoughtspaceathletics.com/pages/molds').then(
    r => r.text(),
  )

  // Kill some invalid html that prettier won't format
  html = html.replaceAll(/<svg.*?<\/svg>/gis, '')

  await assets.writeHtml(tsa.scraped.discs, html)
}

main()

export {}
