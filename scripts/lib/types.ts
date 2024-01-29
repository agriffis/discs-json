export interface Disc {
  mold: string
  fade: number
  glide: number
  speed: number
  turn: number
  maker: string
}

// mold, flight numbers
export type DiscEntry = [string, [number, number, number, number]]

export type DB = {
  [maker: string]: DiscEntry[]
}
