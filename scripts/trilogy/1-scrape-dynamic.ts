/**
 * Scrape the Dynamic HTML for discs.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import * as trilogy from '../lib/trilogy'

async function main() {
  const htmls = await Promise.all(
    [
      'disc-golf-distance-drivers',
      'disc-golf-fairway-drivers',
      'disc-golf-midrange',
      'disc-golf-putters',
      'retired',
    ].map(page =>
      fetch(`https://www.dynamicdiscs.com/pages/${page}`).then(r => r.text()),
    ),
  )

  const discs = htmls
    .flatMap(html => {
      const $ = cheerio.load(html, null, false)
      return $('h5.txt-upper')
        .map(function () {
          return $(this).parent().html()
        })
        .toArray()
    })
    .join('\n')

  await assets.writeHtml(trilogy.scraped.dynamic.discs, discs)
}

main()

export {}
