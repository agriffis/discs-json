/**
 * Scrape the Westside HTML for discs.
 */
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import * as assets from './lib/assets'
import * as trilogy from './lib/trilogy'

async function main() {
  const htmls = await Promise.all(
    [
      'discs/',
      'distance-drivers/',
      'control-drivers/',
      'mid-range/',
      'putters/',
    ].map(page =>
      fetch(`https://westsidediscs.com/category/${page}`).then(r => r.text()),
    ),
  )

  const discs = htmls
    .flatMap(html => {
      const $ = cheerio.load(html, null, false)
      return $('.product-card__properties')
        .map(function () {
          return $(this).html()
        })
        .toArray()
    })
    .join('\n')

  await assets.writeHtml(trilogy.scraped.westside.discs, discs)
}

main()

export {}
