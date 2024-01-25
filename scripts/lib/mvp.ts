import {Disc} from './types'

//----------------------------------------------------------------------
// Scraped types (sparse)
//----------------------------------------------------------------------

export interface MvpApiBrand {
  name: string
  id: number
}

export interface MvpApiDisc {
  brand: [number]
  content: {
    rendered: string
  }
  flightRatings: {
    fade: number
    glide: number
    speed: number
    turn: number
  }
  image: string
  link: string
  plastics: string[]
  title: {rendered: string}
}

type MvpApiConfigItems = {
  label: string
  value: number
  slug: string
}

export interface MvpApiConfig {
  discCategory: string
  discs: MvpApiConfigItems[]
  plastics: MvpApiConfigItems[]
  colors: MvpApiConfigItems[]
}

export interface MvpApiImage {
  id: number
  date_gmt: string
  modified_gmt: string
  slug: string
  colors: string[]
  mime_type: string
  width: number
  height: number
  source_url: string
}

export interface MvpApiImages {
  config: MvpApiConfig
  items: {
    [mold: string]: {
      [plastic: string]: MvpApiImage[]
    }
  }
}

//----------------------------------------------------------------------
// Processed types
//----------------------------------------------------------------------

export interface MvpMaker {
  name: string
  link: string
}

export interface MvpPlastic {
  name: string
  maker: string
  link: string
}

export interface MvpMold {
  name: string
  maker: string
  link: string
}

export interface MvpDisc extends Disc {}

//----------------------------------------------------------------------
// Lookup tables
//----------------------------------------------------------------------

export const makerPdgaManufacturers = {
  Axiom: 'Axiom Discs',
  MVP: 'MVP Disc Sports',
  Streamline: 'Streamline Discs',
}

export const makerLinks = {
  Axiom: 'https://axiomdiscs.com/',
  MVP: 'https://mvpdiscsports.com/',
  Streamline: 'https://streamlinediscs.com/',
  'MVP Circuit Events': 'https://mvpcircuitevents.com/',
  'Hive Disc Golf': 'https://hivediscgolf.net/',
}

// prettier-ignore
export const plasticLinks = {
  'Axiom Cosmic Electron': 'https://axiomdiscs.com/plastics/axiom-cosmic-electron/',
  'Axiom Cosmic Neutron': 'https://axiomdiscs.com/plastics/axiom-cosmic-neutron/',
  'Axiom Eclipse': 'https://axiomdiscs.com/plastics/axiom-eclipse/',
  'Axiom Electron': 'https://axiomdiscs.com/plastics/axiom-electron/',
  'Axiom Fission': 'https://axiomdiscs.com/plastics/axiom-fission/',
  'Axiom Neutron': 'https://axiomdiscs.com/plastics/axiom-neutron/',
  'Axiom Plasma': 'https://axiomdiscs.com/plastics/axiom-plasma/',
  'Axiom Prism': 'https://axiomdiscs.com/plastics/axiom-prism/',
  'Axiom Proton': 'https://axiomdiscs.com/plastics/axiom-proton/',
  'MVP Cosmic Electron': 'https://mvpdiscsports.com/plastics/mvp-cosmic-electron/',
  'MVP Cosmic Neutron': 'https://mvpdiscsports.com/plastics/mvp-cosmic-neutron/',
  'MVP Eclipse 2.0': 'https://mvpdiscsports.com/plastics/mvp-eclipse-2-0/',
  'MVP Eclipse': 'https://mvpdiscsports.com/plastics/mvp-eclipse/',
  'MVP Electron': 'https://mvpdiscsports.com/plastics/mvp-electron/',
  'MVP Fission': 'https://mvpdiscsports.com/plastics/mvp-fission/',
  'MVP Neutron': 'https://mvpdiscsports.com/plastics/mvp-neutron/',
  'MVP Plasma': 'https://mvpdiscsports.com/plastics/mvp-plasma/',
  'MVP Proton': 'https://mvpdiscsports.com/plastics/mvp-proton/',
  'MVP R2': 'https://mvpdiscsports.com/plastics/mvp-r2/',
  'Streamline Cosmic Neutron': 'https://streamlinediscs.com/plastics/streamline-cosmic-neutron/',
  'Streamline Eclipse': 'https://streamlinediscs.com/plastics/streamline-eclipse/',
  'Streamline Electron': 'https://streamlinediscs.com/plastics/streamline-electron/',
  'Streamline Cosmic Electron': 'https://streamlinediscs.com/plastics/streamline-electron/',
  'Streamline Neutron': 'https://streamlinediscs.com/plastics/streamline-neutron/',
  'Streamline Plasma': 'https://streamlinediscs.com/plastics/streamline-plasma/',
  'Streamline Proton': 'https://streamlinediscs.com/plastics/streamline-proton/',
}

// Plastics are represented in the disc records by URLs to icons. This leads
// to some ambiguities, called out below.
//
// prettier-ignore
export const plasticUrlToPlastic = {
  // This can be Eclipse or Eclipse 2.0, there's nothing in the disc record to
  // disambiguate. Use Eclipse for now.
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-eclipse.png': 'Eclipse',
  // This can be Soft, Medium, Firm, and we don't have a way of knowing yet.
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-electron.png': 'Electron',
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-fission.png': 'Fission',
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-neutron-1.png': 'Neutron',
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-plasma.png': 'Plasma',
  'https://mvpdiscsports.com/wp-content/uploads/2017/11/icon-plastic-proton.png': 'Proton',
  'https://mvpdiscsports.com/wp-content/uploads/2019/03/prism_dark_bug142x135px.png': 'Prism',
  // This can be Cosmic Electron or Cosmic Neutron. We really can't tell from
  // here, so leave it out for now.
  'https://mvpdiscsports.com/wp-content/uploads/2019/04/cosmic_dark_142x135-2.png': null,
  'https://mvpdiscsports.com/wp-content/uploads/2021/05/R2_Black_bug_2.png': 'R2 Neutron',
}

const basename = (s: string) => s.replace(/.*\//, '')

const wordsOf = (s: string): string[] =>
  Array.from(s.matchAll(/\w+?(?=\b|[A-Z])/g)).map(m => m[0].toLowerCase())

export const derivePlasticVariant = (plastic: string, url: string): string => {
  switch (plastic) {
    case 'Electron':
    case 'Cosmic Electron': {
      const words = wordsOf(basename(url))
      return words.includes('soft')
        ? `${plastic} Soft`
        : words.includes('firm')
        ? `${plastic} Firm`
        : plastic
    }
    case 'Neutron':
    case 'Cosmic Neutron': {
      const words = wordsOf(basename(url))
      return words.includes('soft') ? `${plastic} Soft` : plastic
    }
    default:
      return plastic
  }
}

export const deriveBasePlastic = (variant: string) =>
  variant.replace(/\s+(?Firm|Soft)$/, '')

export const splitPlastic = (
  nameWithMaker: string,
): {maker: string; plastic: string} => {
  const plastic = nameWithMaker.replace(/^(?:Axiom|MVP|Streamline)\s+/, '')
  const maker = nameWithMaker.replace(plastic, '').trim()
  if (!maker || !plastic || maker === plastic) {
    throw new Error(`can't split plastic: ${nameWithMaker}`)
  }
  return {maker, plastic}
}

export const scraped = {
  brands: 'mvp/scraped/brands.json',
  discs: 'mvp/scraped/discs.json',
  images: 'mvp/scraped/images.json',
} as const

export const processed = {
  discs: 'mvp/processed/discs.json',
  makers: 'mvp/processed/makers.json',
  molds: 'mvp/processed/molds.json',
  plastics: 'mvp/processed/plastics.json',
} as const

const flightRatingOverridesTable: {
  [mold: string]: {
    [plastic: string]: Partial<MvpApiDisc['flightRatings']>
  }
} = {
  Envy: {
    _: {turn: 0},
    Electron: {turn: -1},
  },
  Spin: {
    _: {turn: -2},
    Electron: {turn: -2.5},
  },
}

export const flightRatingOverrides = (
  name: string,
  plastic: string,
): Partial<MvpApiDisc['flightRatings']> => {
  if (plastic.includes('Electron')) {
    plastic = 'Electron'
  }
  return (
    flightRatingOverridesTable[name]?.[plastic] ??
    flightRatingOverridesTable[name]?._ ??
    {}
  )
}
