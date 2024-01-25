/**
 * Scrape the Latitude 64 HTML for discs.
 */
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import * as assets from './lib/assets'
import * as trilogy from './lib/trilogy'

async function main() {
  const htmls = await Promise.all(
    [
      'distance-drivers/',
      'fairway-drivers/',
      'midrange/',
      'puttapproach/',
      'easy-to-use/',
      'dog-disc/',
    ].map(page =>
      fetch(
        `https://www.latitude64.se/disc-golf-products/golf-discs/${page}`,
      ).then(r => r.text()),
    ),
  )

  const discs = htmls
    .flatMap(html => {
      const $ = cheerio.load(html, null, false)
      return $('p:contains("SPEED:")')
        .map(function () {
          return $(this).parent().html()
        })
        .toArray()
    })
    .join('\n')

  await assets.writeHtml(trilogy.scraped.latitude.discs, discs)
}

main()

export {}
