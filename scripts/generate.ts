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
  speed,
  glide,
  turn,
  fade,
}: T): Disc => ({
  maker: normalizeString(maker),
  mold: normalizeString(mold),
  speed,
  glide,
  turn,
  fade,
})

async function main() {
  const allDiscs: Disc[] = (
    await Promise.all([
      assets.readJson<Disc[]>(discmania.processed.discs),
      assets.readJson<Disc[]>(discraft.processed.discs),
      assets.readJson<Disc[]>(innova.processed.discs),
      assets.readJson<Disc[]>(kastaplast.processed.discs),
      assets.readJson<Disc[]>(mint.processed.discs),
      assets.readJson<Disc[]>(mvp.processed.discs),
      assets.readJson<Disc[]>(trilogy.processed.discs),
      assets.readJson<Disc[]>(tsa.processed.discs),
    ])
  )
    .flat()
    .map(normalizeDisc)

  const byMaker: {[maker: string]: DiscEntry[]} = R.piped(
    allDiscs,
    // Run sorts in reverse order, since sorting is stable, it will maintain the
    // fallback ordering from the previous sort.
    R.sortBy(d => d.mold),
    R.sortBy(d => d.maker),
    R.groupBy(d => d.maker),
    R.map((ds: Disc[], _k: string) =>
      ds.map(d => [d.mold, [d.speed, d.glide, d.turn, d.fade]] as DiscEntry),
    ),
  )

  // Custom JSON formatting.
  const j =
    '{\n' +
    Object.entries(byMaker)
      .map(
        ([maker, ds]) =>
          JSON.stringify(maker) +
          ':[\n' +
          ds.map(d => JSON.stringify(d)).join(',\n') +
          '\n]',
      )
      .join(',\n') +
    '}'

  // Sanity check
  JSON.parse(j)

  // Write to source file
  await fs.mkdir('dist', {recursive: true})
  await fs.writeFile('dist/db.json', j, {encoding: 'utf8'})
}

main()

export {}
