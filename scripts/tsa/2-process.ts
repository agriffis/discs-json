/**
 * Process the TSA HTML.
 */
import * as cheerio from 'cheerio'
import * as assets from '../lib/assets'
import {processed, scraped} from '../lib/tsa'
import {Disc} from '../lib/types'

const normalizeMold = async (s: string) =>
  /[A-Z]/.test(s) && /[a-z]/.test(s)
    ? s
    : (await import('title-case')).titleCase(s.toLowerCase())

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
  const discs: Disc[] = await Promise.all(
    $('.multicolumn-card__info h3')
      .filter(function () {
        return !/mini/i.test($(this).text())
      })
      .map(async function () {
        const mold = await normalizeMold($(this).text().trim())
        const numString = $(this)
          .next()
          .text()
          .replace(/^.*?([\d.]+\s+\|.*\|\s+[\d.]+).*$/s, '$1')
        const [speed, glide, turn, fade] = splitNums(numString)
        return {maker: 'tsa', plastic: '', mold, speed, glide, turn, fade}
      })
      .toArray(),
  )
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
