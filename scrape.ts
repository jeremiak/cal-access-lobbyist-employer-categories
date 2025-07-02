// deno-lint-ignore-file no-explicit-any

import Queue from 'npm:p-queue@latest'
import _ from "npm:lodash@4.17";
import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";

interface Employer {
  id: string | undefined;
  name: string | undefined;
  category: string | undefined;
}

interface Category {
  name: string | undefined;
  id: string | undefined;
}

const args = parse(Deno.args);
const categories: Category[] = [
  {
    name: 'Agriculture',
    id: '40301'
  },
  {
    name: 'Education',
    id: '40302'
  },
  {
    name: 'Entertainment/Recreation',
    id: '40303'
  },
  {
    name: 'Finance/Insurance',
    id: '40304'
  },
  {
    name: 'Government',
    id: '40305'
  },
  {
    name: 'Health',
    id: '40306'
  },
  {
    name: 'Labor Unions',
    id: '40307'
  },
  {
    name: 'Legal',
    id: '40308'
  },
  {
    name: 'Lodging/Restaurants',
    id: '40309'
  },
  {
    name: 'Manufacturing/Industrial',
    id: '40310'
  },
  {
    name: 'Merchandise/Retail',
    id: '40311'
  },
  {
    name: 'Miscellaneous',
    id: '40312'
  },
  {
    name: 'Oil and Gas',
    id: '40313'
  },
  {
    name: 'Political Organizations',
    id: '40314'
  },
  {
    name: 'Professional/Trade',
    id: '40315'
  },
  {
    name: 'Public Employees',
    id: '40316'
  },
  {
    name: 'Real Estate',
    id: '40317'
  },
  {
    name: 'Transportation',
    id: '40318'
  },
  {
    name: 'Utilities',
    id: '40319'
  }
]
const concurrency = 4
const queue = new Queue({ concurrency })
const employers: Employer[] = []
const session = args.session ? +args.session : 2025

async function scrapeLobbyistEmployersForCategory(category: Category): Promise<Employer> {
  console.log(`Scraping lobbyist employers categorized as "${category.name}"`)
  const url = `https://cal-access.sos.ca.gov/Lobbying/Employers/list.aspx?view=detail&id=${category.id}&session=${session}`
  const response = await fetch(url)
  const html = await response.text()
  const { status } = response
  const document: HTMLDocument | null = new DOMParser().parseFromString(
    html,
    "text/html",
  );

  const data: Employer[] = []
  const rows = document?.querySelectorAll('table[id$="_list"] tbody tr')

  if (rows.length === 0) {
    console.log('yikes', url, html)
  }

  rows?.forEach((row, i) => {
    if (i === 0) return
    const cells = row?.querySelectorAll('td')
    const name = cells[0].innerText
    const link = cells[0].querySelector('a')
    const href = link.getAttribute('href')
    const id = href.split('id=')[1].split('&')[0]
    data.push({
      id,
      name,
      category: category.name,
    })
  })

  return data
}

console.log(`Scraping for the ${session}-${session + 1} session`)

categories.forEach(category => {
  queue.add(async () => {
    const employersForCategory: Employer[] = await scrapeLobbyistEmployersForCategory(category)
    employers.push(...employersForCategory)
  })
})

await queue.onIdle()

if (employers.length === 0) {
  console.log('Found zero lobbyist employers - something messed up and not going to save anything')
  Deno.exit(0)
}

console.log(`Sorting`)
const sorted = _.orderBy(employers, ["category", "name", "id"]);
const fileName = `lobbyist-employer-categories-${session}.json`
console.log(`Saving to ${fileName}`);
await Deno.writeTextFile(`./${fileName}`, JSON.stringify(sorted, null, 2));
console.log(`All done`);
