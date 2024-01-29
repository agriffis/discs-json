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

//----------------------------------------------------------------------
// Lookup tables
//----------------------------------------------------------------------

export const scraped = {
  brands: 'mvp/scraped/brands.json',
  discs: 'mvp/scraped/discs.json',
} as const

export const processed = {
  discs: 'mvp/processed/discs.json',
} as const
