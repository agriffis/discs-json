/**
 * Scrape the Kastplast HTML for discs.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets.ts'
import * as kastaplast from '../lib/kastaplast.ts'

const parseDiscPages = (html: string) => {
  const $ = cheerio.load(html, null, false)
  return $('#product-gallery a')
    .map(function () {
      return $(this).attr('href')
    })
    .toArray()
}

async function main() {
  const productHtml = await fetch('https://www.kastaplast.se/products/').then(
    r => r.text(),
  )
  const discHtmls = await Promise.all(
    parseDiscPages(productHtml).map(href => fetch(href).then(r => r.text())),
  )
  const html = discHtmls
    .flatMap(html => {
      const $ = cheerio.load(html, null, false)
      return ['<div>', $('#heading').html(), $('#content').html(), '</div>']
    })
    .join('\n')
  await assets.writeHtml(kastaplast.scraped.discs, html)
}

main()

export {}
