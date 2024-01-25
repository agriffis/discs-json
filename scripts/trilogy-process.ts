/**
 * Process the Trilogy HTML.
 */
import * as cheerio from 'cheerio'
import * as assets from './lib/assets'
import {processed, scraped} from './lib/trilogy'
import {Disc} from './lib/types'
import * as R from 'rambdax'

interface DiscWithPriority extends Disc {
  priority: number
}

const normalizedMakers = {
  d: 'Dynamic Discs',
  l: 'Latitude 64',
  w: 'Westside',
}

const splitMakerMold = (s: string) => {
  const m = s.match(
    /^\s*(?:(D)ynamic\s*Discs|(L)atitude\s*64|(W)estside\s*Discs)\s+(\w.*?)\s*$/i,
  )
  if (!m) {
    throw new Error(`Couldn't split: ${s}`)
  }
  const makerKey = (m[1] || m[2] || m[3])!.toLowerCase()
  return {
    maker: normalizedMakers[makerKey],
    mold: m[4].toLowerCase(),
  }
}

const splitNums = (s: string) => {
  const nums = [...s.matchAll(/[-+]?(?:\d+[.]\d+|\d+|[.]\d+)/g)].map(m =>
    parseFloat(m[0]),
  )
  if (nums.length !== 4 || !nums.every(n => n || n === 0)) {
    throw new Error(`Couldn't parse: ${s}`)
  }
  return nums
}

async function dd() {
  const html = await assets.read(scraped.dynamic.discs)
  const $ = cheerio.load(html, null, false)
  const discs: DiscWithPriority[] = $('h5')
    .map(function () {
      const full = $(this).text()
      let {maker, mold} = splitMakerMold(full)
      if (['giant', 'sampo'].includes(mold)) {
        maker = 'westside' // silly dynamic
      }
      const nums = $(this).next().text()
      const [speed, glide, turn, fade] = splitNums(nums)
      return {
        maker,
        mold,
        speed,
        glide,
        turn,
        fade,
        plastic: '',
        priority: maker === 'dynamic' ? 1 : 0,
      }
    })
    .toArray()
  return discs
}

async function lat() {
  const html = await assets.read(scraped.latitude.discs)
  const $ = cheerio.load(html, null, false)
  const discs: DiscWithPriority[] = $('h2 a')
    .map(function () {
      const $link = $(this)
      const mold = $link.text().trim().toLowerCase()
      const nums = $link.parent().nextAll('p:contains("SPEED:"):first').text()
      if (nums) {
        const [speed, glide, turn, fade] = splitNums(nums)
        return {
          maker: 'latitude',
          mold,
          speed,
          glide,
          turn,
          fade,
          plastic: '',
          priority: 1,
        }
      }
      console.warn(`couldn't find numbers for ${mold}`)
    })
    .toArray()
    .filter(Boolean)
  return discs
}

async function westside() {
  const html = await assets.read(scraped.westside.discs)
  const $ = cheerio.load(html, null, false)
  const discs: DiscWithPriority[] = $('a')
    .map(function () {
      const $link = $(this)
      const mold = $link.attr('title').trim().toLowerCase()
      const nums = $link.text()
      if (nums) {
        const [speed, glide, turn, fade] = splitNums(nums)
        return {
          maker: 'westside',
          mold,
          speed,
          glide,
          turn,
          fade,
          plastic: '',
          priority: 1,
        }
      }
      console.warn(`couldn't find numbers for ${mold}`)
    })
    .toArray()
    .filter(Boolean)
  return discs
}

async function main() {
  const allDiscs = (await Promise.all([dd(), lat(), westside()])).flat()
  const discs = R.piped(
    allDiscs,
    R.sortBy<DiscWithPriority>(R.compose(R.negate, R.prop('priority'))),
    R.uniqBy<DiscWithPriority, string>(R.prop('mold')),
    R.map(R.omit('priority')),
    R.sortBy<Disc>(R.prop('mold')),
  )
  const check = R.piped(
    allDiscs,
    R.map(R.omit('priority')),
    R.uniqWith<Disc, Disc>(R.equals),
  )
  if (check.length !== discs.length) {
    R.difference(check, discs).forEach(d => {
      console.warn(`\nWarning: multiple entries for ${d.mold.toUpperCase()}:`)
      allDiscs
        .filter(dd => dd.mold === d.mold)
        .forEach(dd => {
          console.log(JSON.stringify(dd))
        })
    })
  }
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
