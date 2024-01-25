import * as cheerio from 'cheerio'
import * as R from 'rambdax'
import {assert, get, myJsons} from './lib'
import * as assets from './lib/assets'
import {
  InnovaDisc,
  InnovaMold,
  InnovaPlastic,
  PlasticId,
  plasticNames,
  processed,
  pseudoMolds,
  scraped,
} from './lib/innova'

type PlasticsTable = {[K in PlasticId]: InnovaPlastic}

type DiscsTable = {
  [mold: string]: {
    maker: string
    link: string
    fade: number
    glide: number
    speed: number
    turn: number
    pids: PlasticId[]
  }
}

const maker = 'Innova'

async function processPlastics(): Promise<PlasticsTable> {
  const html = await assets.read(scraped.plastics)
  const $ = cheerio.load(html, null, false)
  const link =
    'https://www.innovadiscs.com/home/disc-golf-faq/plastic-types-overview/'
  const pids = $('.plastic-nav a img[id]')
    .map((_i, el) => $(el).attr('id'))
    .toArray()
    .concat(['jk pro', 'kc pro', 'yeti pro']) as PlasticId[]
  assert(
    pids.length === Object.keys(plasticNames).length,
    `unexpected pids length`,
  )
  return R.zipObj(
    pids,
    R.map(id => ({link, maker, name: get(plasticNames)(id)}), pids),
  )
}

async function processDiscs(pt: PlasticsTable): Promise<DiscsTable> {
  const html = await assets.read(scraped.discs)
  const $ = cheerio.load(html, null, false)
  return R.fromPairs(
    R.piped(
      $('tbody tr').toArray(),
      R.map(el => {
        const $tds = $(el).find('td')
        const d = $tds.toArray().map(el => $(el).text().trim())
        const mold = d[0]
        const link = $tds.find('a').attr('href')
        const speed = parseInt(d[1])
        const glide = parseInt(d[2])
        const turn = parseInt(d[3])
        const fade = parseInt(d[4])
        let pids = R.piped(
          [...d[6].matchAll(/!(\w[^!]*)!/g)],
          R.map(([_, p]) => p),
          R.map(p => p.trim().replace(/\s+/g, ' ')),
          R.reject(
            // Invader available in luster plastic, but this isn't in our table.
            // https://www.reddit.com/r/discgolf/comments/shv1v9/an_almost_complete_guide_to_innova_plastics/
            p => !(p in pt) && p === 'luster',
          ),
          R.uniq,
        ) as PlasticId[]
        return [mold, {maker, link, fade, glide, speed, turn, pids}]
      }),
    ),
  )
}

async function main() {
  const pt = await processPlastics()
  const dt = await processDiscs(pt)

  const plastics: InnovaPlastic[] = Object.values(pt)
  const molds: InnovaMold[] = R.piped(
    R.toPairs(dt),
    R.reject(([name]) => name in pseudoMolds),
    R.map(([name, {maker, link}]) => ({name, link, maker})),
  )
  const discs: InnovaDisc[] = R.piped(
    R.toPairs(dt),
    R.chain(([mold, {pids, fade, glide, link, speed, turn, maker}]) => {
      const pm = pseudoMolds[mold]
      return (pm?.pids ?? pids).map(p => ({
        mold: pm?.mold ?? mold,
        fade,
        glide,
        speed,
        turn,
        maker,
        plastic: get(pt)(p).name,
        link: pm ? link : '',
      }))
    }),
  )

  assets.write(processed.plastics, myJsons(plastics))
  assets.write(processed.discs, myJsons(discs))
  assets.write(processed.molds, myJsons(molds))
}

main()

export {}
