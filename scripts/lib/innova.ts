import {Disc} from './types'

//----------------------------------------------------------------------
// Processed types
//----------------------------------------------------------------------

export interface InnovaPlastic {
  name: string
  link: string
  maker: string
}

export interface InnovaMold {
  name: string
  link: string
  maker: string
}

export interface InnovaDisc extends Disc {
  link: string
}

//----------------------------------------------------------------------
// Lookup tables
//----------------------------------------------------------------------

export const makerPdgaManufacturers = {
  Innova: 'Innova Champion Discs',
}

export const plasticNames = {
  star: 'Star',
  gstar: 'GStar',
  starlite: 'StarLite',
  echostar: 'Echo Star',
  champion: 'Champion',
  'metal flake': 'Metal Flake',
  blizzard: 'Blizzard Champion',
  'glow champion': 'Glow Champion',
  xt: 'XT Pro',
  pro: 'Pro',
  'r-pro': 'R-Pro',
  glow: 'Glow DX',
  dx: 'DX',
  // Extras not in the HTML table
  'jk pro': 'Pro (JK blend)',
  'kc pro': 'Pro (KC blend)',
  'yeti pro': 'Pro (Yeti blend)',
  'halo star': 'Halo Star',
  nexus: 'Nexus',
} as const

export type PlasticId = keyof typeof plasticNames

// These discs are represented separately in the Innova website, but they're
// actually the same mold with a special plastic blend.
export const pseudoMolds: {[k: string]: {mold: string; pids: PlasticId[]}} = {
  'JK Aviar': {
    mold: 'Aviar Driver',
    pids: ['jk pro'],
  },
  'KC Aviar': {
    mold: 'Aviar Driver',
    pids: ['kc pro'],
  },
  'Yeti Aviar': {
    // Aviar with puddle top, probably combination of plastic blend and special
    // cooling process.
    mold: 'Aviar Driver',
    pids: ['yeti pro'],
  },
}

export const scraped = {
  discs: 'innova/scraped/discs.html',
  plastics: 'innova/scraped/plastics.html',
} as const

export const processed = {
  discs: 'innova/processed/discs.json',
  molds: 'innova/processed/molds.json',
  plastics: 'innova/processed/plastics.json',
} as const
