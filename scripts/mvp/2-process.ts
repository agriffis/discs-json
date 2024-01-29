import * as R from 'rambdax'
import {get, magicSort, myJsons} from '../lib'
import * as assets from '../lib/assets'
import {MvpApiBrand, MvpApiDisc, processed, scraped} from '../lib/mvp'
import {Disc} from '../lib/types'

async function main() {
  const mvpBrands = (await assets.readJson(scraped.brands)) as MvpApiBrand[]
  const mvpDiscs = (await assets.readJson(scraped.discs)) as MvpApiDisc[]

  // Brands are represented in the disc records by numeric ids.
  // Make a lookup table to resolve these to maker strings.
  const brandMaker = R.zipObj(
    mvpBrands.map(b => b.id.toString()),
    mvpBrands.map(b => b.name),
  )

  // Extract discs with associated makers from scraped discs. The JSON output
  // will be a list, but this is keyed for ease of use below.
  const discs: Disc[] = R.piped(
    mvpDiscs,
    R.map<MvpApiDisc, Disc>(d => {
      if (d.brand.length !== 1) {
        throw new Error('unexpected brands for ' + JSON.stringify(d))
      }
      return {
        maker: get(brandMaker)(d.brand[0]),
        mold: d.title.rendered,
        ...d.flightRatings,
      }
    }),
    magicSort(d => d.maker),
    magicSort(d => d.mold),
  )

  assets.write(processed.discs, myJsons(discs))
}

main()

export {}
