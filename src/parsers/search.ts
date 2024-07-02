/* Generic search result type used for both Package and Resource */
export interface RawSearchResult<T>{
    /** ordered list of object matching the query, where the ordering defined by the sort parameter used in the query. **/
	results: T;
    /**  the number of results found. **/
    /** Note, this is the total number of results found, not the total number of results returned (which is affected by limit and row parameters used in the input). **/ 
	count: number;
	sort: string;
    /** DEPRECATED in v2.10. Aggregated information about facet counts. **/
	facets: any;
    /** aggregated information about facet counts. **/
    /** The outer dict is keyed by the facet field name (as used in the search query). **/
    /** Each entry of the outer dict is itself a dict, with a “title” key, and an “items” key. The “items” key’s value is a list of dicts, each with “count”, “display_name” and “name” entries. The display_name is a form of the name that can be used in titles. **/
	search_facets: any;
};