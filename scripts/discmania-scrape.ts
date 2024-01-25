/**
 * Scrape the Discmania HTML for discs.
 */
import * as assets from './lib/assets'
import * as discmania from './lib/discmania'

async function main() {
  const html = await fetch('https://www.discmania.net/').then(r => r.text())
  await assets.writeHtml(discmania.scraped.discs, html)
}

main()

export {}
