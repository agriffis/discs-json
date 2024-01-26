/**
 * Scrape the Discmania HTML for discs.
 */
import * as assets from '../lib/assets.ts'
import * as discmania from '../lib/discmania.ts'

async function main() {
  const html = await fetch('https://www.discmania.net/').then(r => r.text())
  await assets.writeHtml(discmania.scraped.discs, html)
}

main()

export {}
