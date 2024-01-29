/**
 * Process the Discmania HTML.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import {processed, scraped} from '../lib/discmania'
import {Disc} from '../lib/types'

const splitNums = (s: string) => {
  const nums = [...s.matchAll(/[-+]?\b(?:\d+[.]\d+|\d+|[.]\d+)\b/g)].map(m =>
    parseFloat(m[0]),
  )
  if (nums.length !== 4 || !nums.every(n => n || n === 0)) {
    throw new Error(`Couldn't parse: ${s}`)
  }
  return nums
}

async function main() {
  const html = await assets.read(scraped.discs)
  const $ = cheerio.load(html, null, false)
  const discs: Disc[] = $('.mobile-nav__sub-t__link')
    .filter(function () {
      return /\|\s+\d+\s+\|/.test($(this).text())
    })
    .map(function () {
      const t = $(this).text()
      const mold = t.split(/\s+[^\s\w]/)[0]
      const [speed, glide, turn, fade] = splitNums(t)
      return {maker: 'Discmania', mold, speed, glide, turn, fade}
    })
    .toArray()
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
