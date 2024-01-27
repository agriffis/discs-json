/**
 * Scrape the mint HTML for discs.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import * as mint from '../lib/mint'

const parseDiscPages = (html: string): {[title: string]: string} => {
  const $ = cheerio.load(html, null, false)
  return Object.fromEntries(
    $('a.product-block-title')
      .map<cheerio.Element, [string, string]>(function () {
        return [[$(this).text(), $(this).attr('href')]]
      })
      .toArray(),
  )
}

const f = (s: string): Promise<string> => {
  s = s.startsWith('/') ? `https://mintdiscs.com${s}` : s
  console.log('fetching', s)
  return fetch(s).then(r => r.text())
}

async function main() {
  const productHtml = await f('/')
  const discPages = parseDiscPages(productHtml)
  const discHtmls = await Promise.all(
    Object.entries(discPages).map(([title, href]) => {
      return f(href)
        .then(html => {
          // There's a bunch of products in each collection, including clothing, etc.
          // First item should be representative disc page, except for Jackalope
          // for some reason which has NO DISCS on its disc page...
          const $ = cheerio.load(html, null, false)
          const href =
            title === 'Jackalope'
              ? 'https://mintdiscs.com/collections/newest-products/products/jackalope-apex-plastic-ap-jl01-22'
              : $('a.product-block-title').attr('href')
          if (href) {
            return f(href)
          } else {
            console.warn("couldn't find disc link on", href)
          }
        })
        .then(html => ({title, html}))
    }),
  )
  const html = discHtmls
    .flatMap(({title, html}) => {
      const $ = cheerio.load(html, null, false)
      return [`<title>${title}</title>`, $('div.descriptionunder').html()]
    })
    .join('\n')
  await assets.writeHtml(mint.scraped.discs, html)
}

main()

export {}
