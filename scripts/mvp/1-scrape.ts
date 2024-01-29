/**
 * Scrape the MVP API for discs and plastics.
 */
import * as R from 'rambdax'
import {magicSort} from '../lib'
import * as assets from '../lib/assets'
import {MvpApiBrand, MvpApiDisc, scraped} from '../lib/mvp'

const dbg = <T>(s: T) => {
  console.log(s)
  return s
}

async function fetchBrands(): Promise<MvpApiBrand[]> {
  const d = (await fetch(
    dbg('https://mvpdiscsports.com/wp-json/wp/v2/brand'),
  ).then(r => r.json())) as any
  return d
}

async function fetchDiscs(): Promise<MvpApiDisc[]> {
  const discs: MvpApiDisc[] = []
  for (let page = 1; ; page++) {
    const d = (await fetch(
      dbg(
        `https://mvpdiscsports.com/wp-json/wp/v2/discs?page=${page}&per_page=50`,
      ),
    ).then(r => r.json())) as any
    if (d.code === 'rest_post_invalid_page_number' || d.length === 0) {
      break
    }
    for (const {posts} of d) {
      for (const disc of posts) {
        discs.push(disc)
      }
    }
  }
  return magicSort(R.path('title.rendered'))(discs)
}

async function main() {
  const brands = await fetchBrands()
  const discs = await fetchDiscs()
  await assets.writeJson(scraped.brands, brands)
  await assets.writeJson(scraped.discs, discs)
}

main()

export {}
