import fs from 'fs/promises'
import * as R from 'rambdax'
import * as assets from './lib/assets'
import * as discmania from './lib/discmania'
import * as discraft from './lib/discraft'
import * as innova from './lib/innova'
import * as kastaplast from './lib/kastaplast'
import * as mint from './lib/mint'
import * as mvp from './lib/mvp'
import * as trilogy from './lib/trilogy'
import * as tsa from './lib/tsa'
import {Disc, DiscEntry} from './lib/types'

const normalizeString = (s: string) => s.trim()

/* Omit extra fields (such as InnovaDisc.link), simplify the string fields, and
 * put them in order, so that R.groupBy(JSON.stringify) works properly.
 */
const normalizeDisc = <T extends Disc>({
  maker,
  mold,
  plastic,
  speed,
  glide,
  turn,
  fade,
}: T): Disc => ({
  maker: normalizeString(maker),
  mold: normalizeString(mold),
  plastic: normalizeString(plastic),
  speed,
  glide,
  turn,
  fade,
})

async function main() {
  const allDiscs: Disc[] = (
    await Promise.all([
      assets.readJson(discmania.processed.discs) as Promise<Disc[]>,
      assets.readJson(innova.processed.discs) as Promise<innova.InnovaDisc[]>,
      assets.readJson(mvp.processed.discs) as Promise<mvp.MvpDisc[]>,
      assets.readJson(trilogy.processed.discs) as Promise<Disc[]>,
      assets.readJson(kastaplast.processed.discs) as Promise<Disc[]>,
      assets.readJson(tsa.processed.discs) as Promise<Disc[]>,
      assets.readJson(mint.processed.discs) as Promise<Disc[]>,
      assets.readJson(discraft.processed.discs) as Promise<Disc[]>,
    ])
  )
    .flat()
    .map(normalizeDisc)

  const plastics = R.piped(
    allDiscs.map(d => d.plastic),
    R.filter(Boolean), // Ignore blanks.
    R.uniqBy<string, string>(R.identity),
    // Sort plastics by length, so that shorter names (Champion) don't
    // accidentally match against longer names (Blizzard Champion).
    R.sortBy(p => -p.length),
  )
  const pi = Object.fromEntries(plastics.map((plastic, i) => [plastic, i])) as {
    [k: string]: number
  }

  const groupedByMold = R.piped(
    allDiscs,
    R.groupBy(R.compose(JSON.stringify, R.dissoc('plastic'))),
    R.values,
  )

  type MakerDisc = {maker: string; disc: DiscEntry}

  const groupedByMaker: {[maker: string]: DiscEntry[]} = R.piped(
    groupedByMold,
    R.map<Disc[], MakerDisc>(ds => {
      const ps = R.piped(
        ds,
        R.map(d => pi[d.plastic]),
        R.reject(R.isNil), // if plastic was blank in disc entry
      )
      const {maker, mold, speed, glide, turn, fade} = ds[0]
      return {maker, disc: [ps, mold, [speed, glide, turn, fade]]}
    }),
    // Run sorts in reverse order, since sorting is stable, it will maintain the
    // fallback ordering from the previous sort.
    // 3. number of plastics, so that flight number variants with more plastics
    // get higher priority when we are matching _without_ known plastic.
    R.sortBy<MakerDisc>(R.compose(R.negate, R.path('disc.0.length'))),
    // 2. mold name, for readability and consistency.
    R.sortBy<MakerDisc>(R.path('disc.1')),
    // 1. maker, for readability and consistency.
    R.sortBy<MakerDisc>(R.prop('maker')),
    // Group by maker.
    R.groupBy<{maker: string; disc: DiscEntry}>(d => d.maker),
    // Strip maker out of the value lists.
    // @ts-expect-error ¯\_(ツ)_/¯
    R.map<MakerDisc, DiscEntry[]>(R.map(R.prop('disc'))),
  )

  // Custom JSON formatting.
  const j =
    '{"plastics":' +
    JSON.stringify(plastics) +
    ',\n"discs":{\n' +
    Object.entries(groupedByMaker)
      .map(
        ([maker, ds]) =>
          JSON.stringify(maker) +
          ':[\n' +
          ds.map(d => JSON.stringify(d)).join(',\n') +
          '\n]',
      )
      .join(',\n') +
    '}}'

  // Sanity check
  JSON.parse(j)

  // Write to source file
  await fs.mkdir('dist', {recursive: true})
  await fs.writeFile('dist/db.json', j, {encoding: 'utf8'})
}

main()

export {}
