# ckan-ts

**ckan-ts** is a fully tested and documented TypeScript wrapper for retrieving data from v3 CKAN APIs asynchronously. Its main aim is to provide parsed outputs using a coherent and consistent vocabulary across all resource types, and handle non-standard data provided by different organizations.

## Usage

Install ckan-ts with `npm i ckan-ts` or `yarn add ckan-ts`.

Using ckan-ts is very simple. For instance, the following checks whether or not a site is functional, and retrieves its first 100 datasets if it is:
```javascript
import CKAN from "ckan-ts";
const parser = new CKAN("https://demo.ckan.org/api/3/");
const isAvailable = await parser.available();
if(isAvailable){
	const datasets = await parser.datasets(limit = 100);
}
```

For a full list of available methods, check the documentation.

## License

ckan-ts is released under the MIT license. For more information, see the LICENSE file.