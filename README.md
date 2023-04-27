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
	const datasets = await parser.datasets({limit: 100});
}
```

For the most part, ckan-ts is intended to retrieve data from unauthenticated endpoints. However, you can also pass it headers to use throughout, i.e.
```javascript
const parser = new CKAN("https://demo.ckan.org/api/3/", {
	requestOptions: {
		headers: {} // the desired http headers go here
	}
});
````

Currently supported methods:

 * `.available()`: checks whether an API endpoint is currently available. [docs]()
 * `.dataset(id)`: returns the metadata of a dataset with a given ID. [docs]()
 * `.datasets(limit?)`: returns the IDs of all datasets on the server. [docs]()
 * `.detailedDatasets(limit?)`: returns information about all datasets on the server, including their included resources. [docs]()
 * `.groups(options?)`: returns the IDs of all groups on the server. [docs]()
 * `.detailedGroups(options?)`: returns information about all groups on the server. [docs]()
 * `.licenses()`: returns all the licenses used across datasets. [docs]()
 * `.organizations(options?)`: returns the IDs of all organizations on the server. [docs]()
 * `.detailedOrganizations(options?)`: returns information about all organizations on the server. [docs]()
 * `.resource(id)`: returns the metadata of a resource with a given ID. [docs]()
 * `.tags(options?)`: returns the name of all tags on the server. [docs]()
 * `.detailedTags(options?)`: returns information about all tags on the server. [docs]()

For a full list of available methods, their parameters, and returned data, check the documentation.

## License

ckan-ts is released under the MIT license. For more information, see the LICENSE file.