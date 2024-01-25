export interface Disc {
  mold: string
  plastic: string
  fade: number
  glide: number
  speed: number
  turn: number
  maker: string
}

// plastics, mold, flight numbers
export type DiscEntry = [number[], string, [number, number, number, number]]

export type DB = {
  plastics: string[]
  discs: {[maker: string]: DiscEntry[]}
}
