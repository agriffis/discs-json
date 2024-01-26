/**
 * Process the Kastaplast HTML.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets.ts'
import {processed, scraped} from '../lib/kastaplast.ts'
import {Disc} from '../lib/types.ts'

const splitNums = (s: string) => {
  const nums = [...s.matchAll(/[-+]?\b(?:\d+[.,]\d+|\d+|[.,]\d+)\b/g)]
    .map(m => m[0].replace(/,/, '.'))
    .map(s => parseFloat(s))
  if (nums.length !== 4 || !nums.every(n => n || n === 0)) {
    throw new Error(`Couldn't parse: ${s}`)
  }
  return nums
}

async function main() {
  const html = await assets.read(scraped.discs)
  const $ = cheerio.load(html, null, false)
  const discs: Disc[] = $('h1')
    .filter(function () {
      return !/mini/i.test($(this).text())
    })
    .map(function () {
      const mold = $(this).text().trim()
      const numString = $(this)
        .siblings('.wrap')
        .children(':contains("Flight specs:")')
        .text()
      const [speed, glide, turn, fade] = splitNums(numString)
      return {maker: 'kastaplast', plastic: '', mold, speed, glide, turn, fade}
    })
    .toArray()
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
