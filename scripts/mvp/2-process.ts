import * as R from 'rambdax'
import {assert, get, magicSort, myJsons} from '../lib/index.ts'
import * as assets from '../lib/assets.ts'
import {
  derivePlasticVariant,
  flightRatingOverrides,
  makerLinks,
  MvpApiBrand,
  MvpApiDisc,
  MvpApiImages,
  MvpDisc,
  MvpMaker,
  MvpMold,
  MvpPlastic,
  plasticLinks,
  processed,
  scraped,
  splitPlastic,
} from '../lib/mvp.ts'

async function main() {
  const mvpBrands = (await assets.readJson(scraped.brands)) as MvpApiBrand[]
  const mvpDiscs = (await assets.readJson(scraped.discs)) as MvpApiDisc[]
  const mvpImages = (await assets.readJson(scraped.images)) as MvpApiImages

  // Brands are represented in the disc records by numeric ids.
  // Make a lookup table to resolve these to maker strings.
  const brandMaker = R.zipObj(
    mvpBrands.map(b => b.id.toString()),
    mvpBrands.map(b => b.name),
  )

  // Extract makers from scraped discs, instead of using the brand mapping
  // directly. That way we don't end up with extra makers in the DB that have no
  // associated discs.
  const makers: MvpMaker[] = R.piped(
    mvpDiscs,
    R.chain(R.prop('brand')),
    R.uniq,
    R.map(R.toString),
    R.map(get(brandMaker)),
    R.uniq,
    magicSort(R.identity),
    R.map(name => ({name, link: get(makerLinks)(name)})),
  )

  // Extract molds with associated makers from scraped discs. The JSON output
  // will be a list, but this is keyed for ease of use below.
  const molds: {[key: string]: MvpMold} = R.piped(
    mvpDiscs,
    R.chain(d =>
      d.brand.map<MvpMold>(b => ({
        name: d.title.rendered,
        maker: get(brandMaker)(b),
        link: d.link,
      })),
    ),
    magicSort(mold => mold.maker),
    magicSort(mold => mold.name),
    R.mapToObject(mold => ({[`${mold.maker} ${mold.name}`]: mold})),
  )

  // Extract plastics from images config. The JSON output will be a list, but
  // this is keyed for ease of use below.
  const plastics: {[key: string]: MvpPlastic} = R.piped(
    mvpImages,
    R.path(['config', 'plastics']),
    R.map(R.prop('label')),
    magicSort<string>(R.identity),
    R.uniq, // should be already...
    R.reduce(
      (plastics, nameWithMaker) => {
        const {maker, plastic} = splitPlastic(nameWithMaker)
        const link = get(plasticLinks)(nameWithMaker)
        const variants = plastic.endsWith('Electron')
          ? [plastic, `${plastic} Firm`, `${plastic} Soft`]
          : plastic.endsWith('Neutron') && !plastic.includes('Cosmic')
            ? [plastic, `${plastic} Soft`]
            : [plastic]
        variants.forEach(v => {
          plastics[`${maker} ${v}`] = {name: v, maker, link}
        })
        return plastics
      },
      {} as {[key: string]: MvpPlastic},
    ),
  )

  // Extract discs (combined molds, plastics, flight numbers and colors) from
  // combined discs and images. Note that there are links to plastics in the
  // scraped discs, but they're ambiguous and not necessarily complete, so
  // prefer the ones from the scraped images.
  const discs: MvpDisc[] = []
  for (const d of mvpDiscs) {
    assert(d.brand.length === 1, 'unexpected brands')
    const maker = get(brandMaker)(d.brand[0])
    const name = d.title.rendered
    const discImagesByBasePlastic = get(mvpImages.items)(name)
    for (const [k, items] of Object.entries(discImagesByBasePlastic)) {
      const {maker: plasticMaker, plastic} = splitPlastic(k)
      if (maker !== plasticMaker) {
        console.warn(
          `maker mismatch: ${name} maker=${maker} plastic=${plasticMaker}`,
        )
      }
      for (const item of items) {
        const variant = derivePlasticVariant(plastic, item.source_url)
        discs.push({
          maker,
          mold: name,
          plastic: variant,
          ...d.flightRatings,
          ...flightRatingOverrides(name, variant),
        })
      }
    }
  }

  assets.write(processed.makers, myJsons(makers))
  assets.write(processed.plastics, myJsons(Object.values(plastics)))
  assets.write(processed.molds, myJsons(Object.values(molds)))
  assets.write(processed.discs, myJsons(discs))
}

main()

export {}
