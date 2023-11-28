# Lobbyist employer categories from Cal-Access

The Secretary of State's website has some lobbying data but no data files to download beyond the 4+ gigabyte daily updated ZIP file that contains the contents of the entire Cal-Access system. That's way too much to deal with when we just want to know questions like:

1. How much is the oil and gas industry spending to lobby California's government? What about the transportation industry?

The `scrape.ts` script will download all of the lobbyist employers that are ][categorized by the Secretary of State](https://cal-access.sos.ca.gov/Lobbying/Employers/list.aspx?view=category) for a session into a `.json` file.

It runs on Github Actions once a day to update the data for the current session. If the icon below is green, the last scrape was successful. If the scrape failed the icon will be red.

[![Scrape lobbyist employer categories](https://github.com/jeremiak/cal-access-lobbyist-employer-categories/actions/workflows/scrape.yml/badge.svg)](https://github.com/jeremiak/cal-access-lobbyist-employer-categories/actions/workflows/scrape.yml)