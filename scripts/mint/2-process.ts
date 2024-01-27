/**
 * Process the TSA HTML.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import {processed, scraped} from '../lib/mint'
import {Disc} from '../lib/types'

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
  const discs: Disc[] = $('title')
    .map(function () {
      const mold = $(this).text().trim()
      const numString = $(this)
        .next()
        .children()
        .filter(function () {
          console.log(mold)
          console.log($(this).text())
          // Profit doesn't mention speed...?
          return /glide.*turn.*fade/is.test($(this).text())
        })
        .text()
      const [speed, glide, turn, fade] = splitNums(numString)
      return {maker: 'mint', plastic: '', mold, speed, glide, turn, fade}
    })
    .toArray()
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
