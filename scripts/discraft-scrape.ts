/**
 * Scrape the mint HTML for discs.
 */
import * as cheerio from 'cheerio'
import * as assets from './lib/assets'
import * as discraft from './lib/discraft'

const parseDiscPages = (html: string): string[] => {
  const $ = cheerio.load(html, null, false)
  return $('.l-products-item')
    .map(function () {
      return $(this).find('a.product-title').attr('href')
    })
    .toArray()
}

async function f(s: string): Promise<string> {
  s = s.startsWith('/') ? `https://www.discraft.com${s}` : s
  console.log('fetching', s)
  return await fetch(s).then(r => r.text())
}

async function main() {
  const productHtml = await f('/disc-golf/?count=1000')
  const htmls = await Promise.all(
    parseDiscPages(productHtml).map(href => {
      return f(href).then(html => {
        const $ = cheerio.load(html, null, false)
        return $('.product-bottom-info').html()
      })
    }),
  )
  await assets.writeHtml(discraft.scraped.discs, htmls.join('\n'))
}

main()

export {}
