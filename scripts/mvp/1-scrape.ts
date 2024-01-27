/**
 * Scrape the MVP API for discs and plastics.
 */
import * as R from 'rambdax'
import {magicSort} from '../lib'
import * as assets from '../lib/assets'
import {
  MvpApiBrand,
  MvpApiConfig,
  MvpApiDisc,
  MvpApiImage,
  MvpApiImages,
  scraped,
} from '../lib/mvp'

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

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchImages(): Promise<MvpApiImages> {
  const html = await fetch(
    dbg('https://mvpdiscsports.com/download/products/'),
  ).then(r => r.text())
  let configJson = html.replace(
    /^.*?\nvar themeExports = (\{[^\n]*\}).*$/s,
    (_, j) => j,
  )
  // Parse and stringify to replace unicode escapes with UTF-8.
  configJson = JSON.stringify(JSON.parse(configJson))
  // Beware the Fission registered trademark.
  configJson = configJson.replaceAll('®', '')
  const config: MvpApiConfig = JSON.parse(configJson)

  const items: MvpApiImages['items'] = {}
  for (const disc of config.discs) {
    const discItems = (items[disc.label] = {})
    for (const plastic of config.plastics) {
      for (let page = 1; ; page++) {
        // Promise.all so that we don't hit the API server too hard. This is
        // rate-limiting, not an API call timeout (which would be Promise.any).
        const [d] = await Promise.all([
          fetch(
            dbg(
              `https://mvpdiscsports.com/wp-json/wp/v2/media?download_category=${config.discCategory}&media_type=image&per_page=16&page=${page}&disc=${disc.value}&plastic=${plastic.value}`,
            ),
          ).then(r => r.json()) as any,
          timeout(500),
        ])
        if (d.code === 'rest_post_invalid_page_number' || d.length === 0) {
          break
        }
        discItems[plastic.label] ||= []
        for (const dd of d) {
          const item: MvpApiImage = {
            id: dd.id,
            date_gmt: dd.date_gmt,
            modified_gmt: dd.modified_gmt,
            slug: dd.slug,
            colors: R.piped(
              dd.download_color,
              R.map(cid => config.colors.find(c => c.value === cid)?.label),
              R.reject(R.isNil),
            ),
            mime_type: dd.mime_type,
            width: dd.media_details.width,
            height: dd.media_details.height,
            source_url: dd.source_url,
          }
          discItems[plastic.label].push(item)
        }
      }
    }
  }

  return {config, items}
}

async function main() {
  const brands = await fetchBrands()
  const discs = await fetchDiscs()
  const images = await fetchImages()
  await assets.writeJson(scraped.brands, brands)
  await assets.writeJson(scraped.discs, discs)
  await assets.writeJson(scraped.images, images)
}

main()

export {}
