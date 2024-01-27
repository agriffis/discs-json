/**
 * Scrape the Innova HTML for discs and plastics.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import {scraped} from '../lib/innova'

async function main() {
  const html = await fetch(
    'https://www.innovadiscs.com/disc-golf-discs/disc-comparison/',
  ).then(r => r.text())

  const $ = cheerio.load(html, null, false)

  const plastics = $('.plastic-nav').first().parents('table').prop('outerHTML')

  const discs = $('#disc-comparison')
    .prop('outerHTML')
    .replace(/(?=<(?:\/?thead|\/?tbody|tr)>)/g, '\n')

  await assets.writeHtml(scraped.plastics, plastics)
  await assets.writeHtml(scraped.discs, discs)
}

main()

export {}
