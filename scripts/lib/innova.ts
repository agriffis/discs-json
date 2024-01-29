//----------------------------------------------------------------------
// Lookup tables
//----------------------------------------------------------------------

// These discs are represented separately in the Innova website, but they're
// actually the same mold with a special plastic blend.
export const pseudoMolds: {[k: string]: string} = {
  'JK Aviar': 'Aviar Driver',
  'KC Aviar': 'Aviar Driver',
  // Aviar with puddle top, probably combination of plastic blend and special
  // cooling process.
  'Yeti Aviar': 'Aviar Driver',
}

export const scraped = {
  discs: 'innova/scraped/discs.html',
} as const

export const processed = {
  discs: 'innova/processed/discs.json',
} as const
