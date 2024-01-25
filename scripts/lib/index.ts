import * as R from 'rambdax'

let arrKeys: (x: any[]) => string[]
let flatKeys: (x: any) => string[]
let objKeys: (x: any) => string[]

objKeys = R.converge(R.concat, [
  // keys of this object
  R.keys,
  // recursive keys of values
  R.compose(
    R.flatten,
    R.map(x => flatKeys(x)),
    R.values,
  ),
])

// recursive keys of values
// @ts-ignore
arrKeys = R.compose(
  R.flatten,
  R.map(x => flatKeys(x)),
)

// @ts-ignore
flatKeys = R.compose(
  Array.from,
  R.reduce((set, value) => {
    set.add(value)
    return set
  }, new Set()),
  R.cond([
    [Array.isArray, arrKeys],
    [R.is(Object), objKeys],
    [R.T, R.always([])],
  ]),
)

export const stableJson = (x, {indent = 0, sort = arr => arr.sort()} = {}) =>
  JSON.stringify(x, sort(flatKeys(x)), indent)

/**
 * Sort items alphabetically, ignoring stuff that doesn't matter.
 */
export const magicSort =
  <T>(kfn: (k: T) => any) =>
  (arr: T[]): T[] => {
    const result = arr.slice()
    const kstr = (x: T) => {
      x = kfn(x)
      return x === null || x === undefined ? '' : `${x}`
    }
    result.sort((a, b) => {
      const sa = kstr(a)
      const sb = kstr(b)
      return sa.localeCompare(sb, undefined, {
        sensitivity: 'base',
        ignorePunctuation: true,
        numeric: true,
      })
    })
    return result
  }

export type Opt<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type Req<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export type ValueOf<T> = T[keyof T]

export const assert = (x: any, msg?: string) => {
  if (!x) {
    throw new Error(msg ?? '')
  }
  return x
}

export const get =
  <T>(mapping: {[k: string]: T}) =>
  (key: any): T => {
    const value = mapping[key]
    if (value === undefined) {
      throw new Error(`lookup failed: ${key}`)
    }
    return value
  }

const sortedUniq = <T>(input: T[]): T[] =>
  R.reduce(
    (output, item) => {
      if (output[output.length - 1] !== item) {
        output.push(item)
      }
      return output
    },
    [] as T[],
    input,
  )

// Manual conversion to JSON for easier vimdiffable formatting.
export const myJson = d =>
  stableJson(d, {indent: 1})
    .replace(/(?<=[\[{])\n\s*/g, '')
    .replace(/\n\s*(?=[\]}])/g, '')
    .replace(/\n\s*/g, ' ')

export const myJsons = ds => {
  const json =
    '[\n  ' + sortedUniq(ds.map(myJson).sort()).join(',\n  ') + '\n]\n'
  JSON.parse(json) // sanity
  return json
}

interface ToolsOptions {
  baseUrl?: string
}

export const tools = (options: ToolsOptions = {}) => {
  const baseUrl = options.baseUrl?.replace(/\/$/, '') || ''
  return {
    f: (s: string): Promise<string> => {
      s = s.startsWith('/') ? `${baseUrl}${s}` : s
      console.log('fetching', s)
      return fetch(s).then(r => r.text())
    },
  }
}
