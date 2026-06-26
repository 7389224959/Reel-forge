import { search } from 'duck-duck-scrape';
import * as scrape from 'duck-duck-scrape';

console.log(Object.keys(scrape));

async function run() {
  const searchResults = await scrape.search('apple', {
    safeSearch: scrape.SafeSearchType.STRICT
  });
  console.log('Search:', searchResults.images);
}
run().catch(console.error);
