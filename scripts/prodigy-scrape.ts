/**
 * Scrape the Prodigy HTML for discs.
 */
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import * as assets from './lib/assets'
import * as prodigy from './lib/prodigy'
import {tools} from './lib'

const {f} = tools({baseUrl: 'https://www.prodigydisc.com'})

async function main() {
  // prodigy uses boost.js for its browse interface
  // one of the calls is to "filter" on a 3rd party domain
  // that is the key first call, with the collection limited for all discs
  // then call once with each model selected, to get a representative disc page
  // note mx-1 missing from list at the moment
  /*
        "manualValues": [
          "D1",
          "D1 Max",
          "D2",
          "D3",
          "D4",
          "D6",
          "H1 V2",
          "H2 V2",
          "H3 V2",
          "H5",
          "F3",
          "F5",
          "F7",
          "M1",
          "M2",
          "M3",
          "M4",
          "M5",
          "A1",
          "A2",
          "A4",
          "A3",
          "PA-1",
          "PA-2",
          "PA-3",
          "PA-4",
          "X2",
          "X3",
          "X4",
          "X5",
          "D2 Max",
          "H4 V2",
          "D3 Max",
          "MX-3",
          "F1",
          "F2",
          "FX-2",
          "D Model S",
          "M Model OS",
          "P Model S",
          "F Model S",
          "D Model OS",
          "D Model US",
          "M Model S",
          "M Model US",
          "P Model US",
          "F Model OS",
          "F Model US"
        ],
  */
  // so
  // https://services.mybcapps.com/bc-sf-filter/filter?shop=prodigy-disc-store.myshopify.com&build_filter_tree=true&product_available=false&variant_available=false&collection_scope=35008774189
  // and then
  // https://services.mybcapps.com/bc-sf-filter/filter?t=1670155929924&_=pf&shop=prodigy-disc-store.myshopify.com&page=1&limit=24&sort=created-descending&display=grid&collection_scope=35008774189&tag=&product_available=true&variant_available=true&build_filter_tree=true&check_cache=false&callback=BoostPFSFilterCallback&event_type=filter&pf_t_model%5B%5D=A1
  // note pf_t_model[]=A1

  // get the list of disc models
  // fetch the page filtering by each disc model
  // get the first product link
  // fetch each product, extract flight numbers

  const html = await f('/collections/all-discs')
  await assets.writeHtml(prodigy.scraped.discs, discs)
}

main()

export {}
