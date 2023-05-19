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

**Search**:
 * `.autocompleteDataset(query, limit)`: searches for a dataset, and returns its autocomplete results. [docs]()
 * `.autocompleteFormat(query, limit)`: searches for a file format, and returns its autocomplete results. [docs]()
 * `.autocompleteGroup(query, limit)`: searches for a group, and returns its autocomplete results. [docs]()
 * `.autocompleteOrganization(query, limit)`: searches for an organization, and returns its autocomplete results. [docs]()
 * `.autocompleteTag(query, limit)`: searches for a tag, and returns its autocomplete results. [docs]()
 * `.autocompleteUser(query, limit)`: searches for a user, and returns its autocomplete results. [docs]()
 * `.searchDataset(query, options)`: searches for a given dataset with additional options, and returns its details. [docs]()
 * `.searchResource(query, options)`: searches for a given resource with additional options, and returns its detaisl. [docs]()

**Lists**:
 * `.datasets(settings?)`: returns the IDs of all datasets on the server. [docs]()
 * `.detailedDatasets(settings?)`: returns information about all datasets on the server, including their included resources. [docs]()
 * `.detailedGroups(settings?)`: returns information about all groups on the server. [docs]()
 * `.detailedOrganizations(settings?)`: returns information about all organizations on the server. [docs]()
 * `.detailedTags(settings?)`: returns information about all tags on the server. [docs]()
 * `.detailedUsers(settings?)`: returns a list of users on the server with detailed information. [docs]()
 * `.groups(settings?)`: returns the IDs of all groups on the server. [docs]()
 * `.licenses()`: returns all the licenses used across datasets. [docs]()
 * `.organizations(settings?)`: returns the IDs of all organizations on the server. [docs]()
 * `.tags(settings?)`: returns the name of all tags on the server. [docs]()
 * `.users(settings?)`: returns a list of user IDs on the server. [docs]()
 * `.vocabularies()`: returns a list of vocabularies on the server. [docs]()

**Single items**:
 * `.dataset(id)`: returns the metadata of a dataset with a given ID. [docs]()
 * `.group(id, settings?)`: returns information pertaining to a group. [docs]()
 * `.organization(id, settings?)`: returns information pertaining to an organization. [docs]()
 * `.resource(id)`: returns the metadata of a resource with a given ID. [docs]()
 * `.user(id)`: returns information about a given user. [docs]()
 * `.vocabulary(id)`: returns information about a given vocabulary. [docs]()

**Miscellaneous**:
 * `.action(action, data?, method?)`: carries out a generic action. Used in case it has not been implemented in the CKAN-TS yet. [docs]()
 * `.available()`: checks whether an API endpoint is currently available. [docs]()

For more information about these methods, check the [documentation]().

## License

ckan-ts is released under the MIT license. For more information, see the LICENSE file.