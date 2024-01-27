/**
 * Process the discraft HTML.
 */
import * as cheerio from 'cheerio'
import * as R from 'rambdax'
import * as assets from '../lib/assets'
import {processed, scraped} from '../lib/discraft'
import {Disc} from '../lib/types'

const splitNums = (s: string) => {
  const nums = [...s.matchAll(/[-+]?\b(?:\d+[.]\d+|\d+|[.]\d+)\b/g)].map(m =>
    parseFloat(m[0]),
  )
  // discraft has extra "stability" num
  if (nums.length < 4 || nums.length > 5 || !nums.every(n => n || n === 0)) {
    return
  }
  return nums
}

async function main() {
  const html = await assets.read(scraped.discs)
  const $ = cheerio.load(html, null, false)
  const foundDiscs: Disc[] = $('#specifications:contains("MODEL")')
    .map(function () {
      const mold = $(this).find('td:contains("MODEL")').next().text().trim()
      const $numses = $(this)
        .prev()
        .find('p')
        .filter(function () {
          return !!splitNums($(this).text())
        })
      if ($numses.length > 1) {
        throw new Error(mold)
      }
      if ($numses.length) {
        const [speed, glide, turn, fade] = splitNums($numses.text())
        return {maker: 'Discraft', plastic: '', mold, speed, glide, turn, fade}
      }
    })
    .toArray()
    .filter(Boolean)
  const discs = R.piped(foundDiscs, R.uniq, R.sortBy<Disc>(R.prop('mold')))
  const check = R.uniqBy(R.prop('mold'), foundDiscs)
  const extras = R.difference(discs, check)
  if (extras.length) {
    console.log('uh oh')
    console.log(extras)
  }
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
