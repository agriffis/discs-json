/**
 * Scrape the Innova HTML for discs.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import {scraped} from '../lib/innova'

async function main() {
  const html = await fetch(
    'https://www.innovadiscs.com/disc-golf-discs/disc-comparison/',
  ).then(r => r.text())

  const $ = cheerio.load(html, null, false)

  const discs = $('#disc-comparison')
    .prop('outerHTML')
    .replace(/(?=<(?:\/?thead|\/?tbody|tr)>)/g, '\n')

  await assets.writeHtml(scraped.discs, discs)
}

main()

export {}
