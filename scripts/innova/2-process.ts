import * as cheerio from 'cheerio'
import * as R from 'rambdax'
import {myJsons} from '../lib'
import * as assets from '../lib/assets'
import {processed, pseudoMolds, scraped} from '../lib/innova'
import {Disc} from '../lib/types'

async function main() {
  const html = await assets.read(scraped.discs)

  const $ = cheerio.load(html, null, false)

  const discs: Disc[] = R.piped(
    $('tbody tr').toArray(),
    R.map(el => {
      const $tds = $(el).find('td')
      const d = $tds.toArray().map(el => $(el).text().trim())
      const mold = d[0]
      const speed = parseInt(d[1])
      const glide = parseInt(d[2])
      const turn = parseInt(d[3])
      const fade = parseInt(d[4])
      return {maker: 'Innova', mold, fade, glide, speed, turn}
    }),
    R.reject(({mold}) => mold in pseudoMolds),
  )

  await assets.write(processed.discs, myJsons(discs))
}

main()

export {}
