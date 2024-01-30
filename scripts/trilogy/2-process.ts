/**
 * Process the Trilogy HTML.
 */
import * as cheerio from 'cheerio'
import * as R from 'rambdax'
import {titleCase} from 'title-case'
import * as assets from '../lib/assets'
import {processed, scraped} from '../lib/trilogy'
import {Disc} from '../lib/types'

interface DiscWithPriority extends Disc {
  priority: number
}

const normalizedMakers = {
  dyn: 'Dynamic Discs',
  lat: 'Latitude 64',
  wes: 'Westside',
}

const normalizeMaker = (s: string) => {
  const mk = s.substring(0, 3).toLowerCase() as keyof typeof normalizedMakers
  if (!(mk in normalizedMakers)) {
    throw new Error("can't resolve maker: " + s)
  }
  return normalizedMakers[mk]
}

const normalizeMold = (s: string) =>
  /[A-Z]/.test(s) && /[a-z]/.test(s)
    ? s
    : titleCase(s.toLowerCase()).replace('Spz', 'SPZ').replace('Xxx', 'XXX')

const splitMakerMold = (s: string) => {
  const m = s.match(
    /^\s*(Dynamic\s*Discs|Latitude\s*64|Westside\s*Discs)\s+(\w.*?)\s*$/i,
  )
  if (!m) {
    throw new Error(`Couldn't split: ${s}`)
  }
  return {
    maker: normalizeMaker(m[1]),
    mold: normalizeMold(m[2]),
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
      if (['Giant', 'Sampo'].includes(mold)) {
        maker = normalizedMakers.wes // silly dynamic
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
        priority: maker === normalizedMakers.dyn ? 1 : 0,
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
      const mold = normalizeMold($link.text().trim())
      const nums = $link.parent().nextAll('p:contains("SPEED:"):first').text()
      if (nums) {
        const [speed, glide, turn, fade] = splitNums(nums)
        return {
          maker: normalizedMakers.lat,
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
      const mold = normalizeMold($link.attr('title').trim())
      const nums = $link.text()
      if (nums) {
        const [speed, glide, turn, fade] = splitNums(nums)
        return {
          maker: normalizedMakers.wes,
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

const lowerDisc = (disc: Disc) =>
  R.map(
    v => (typeof v === 'string' ? v.toLowerCase() : v),
    disc as any,
  ) as unknown as Disc

async function main() {
  const allDiscs = (await Promise.all([dd(), lat(), westside()])).flat()

  // Collect the canonical entry for each disc, by looking for the highest
  // priority entry.
  const discs = R.piped(
    allDiscs,
    R.sortBy<DiscWithPriority>(R.compose(R.negate, R.prop('priority'))),
    R.uniqBy<DiscWithPriority, string>(R.prop('mold')),
    R.map(R.omit('priority')),
    R.sortBy<Disc>(R.prop('mold')),
  )

  // Collect a unique entry for each disc, by lowercasing.
  const check = R.piped(
    allDiscs,
    R.map(R.omit('priority')),
    R.uniqWith<Disc, Disc>((a, b) => R.equals(lowerDisc(a), lowerDisc(b))),
  )

  if (check.length !== discs.length) {
    R.difference(check, discs).forEach(d => {
      console.warn(`\nWarning: multiple entries for ${d.mold.toUpperCase()}:`)
      allDiscs
        .filter(dd => dd.mold.toLowerCase() === d.mold.toLowerCase())
        .forEach(dd => {
          console.log(JSON.stringify(dd))
        })
    })
  }
  await assets.writeJson(processed.discs, discs)
}

main()

export {}
