import axios, {AxiosResponse, AxiosRequestConfig} from "axios";

import parseAutocompleteDataset, {AutocompleteDataset, RawAutocompleteDataset} from "@/parsers/autocomplete-dataset";
import parseAutocompleteUser, {AutocompleteUser, RawAutocompleteUser} from "@/parsers/autocomplete-user";
import parseDataset, {Dataset, RawDataset} from "@/parsers/dataset";
import parseGroup, {Group, RawGroup} from "@/parsers/group";
import parseLicense, {License, RawLicense} from "@/parsers/license";
import parseOrganization, {Organization, RawOrganization} from "@/parsers/organization";
import parseResource, {Resource, RawResource} from "@/parsers/resource";
import parseTag, {Tag, RawTag} from "@/parsers/tag";
import parseUser, {User, RawUser} from "@/parsers/user";
import parseVocabulary, {Vocabulary, RawVocabulary} from "@/parsers/vocabulary";

import type {
	AllowedMethods, GroupOptions, LimitOptions, SortOptions, TagOptions, UserOptions,
	SingleGroupOptions, BaseSortOptions, DatasetSearchOptions,
} from "./types";
import { RawSearchResult } from "@/parsers/search";

/** Settings for the CKAN module */
export interface Settings{
	/** Request options to pass along to got. For more info, see the documentation: https://axios-http.com/docs/req_config */
	requestOptions?: AxiosRequestConfig;
	/** Ignore automatic API URL correction. Used for endpoints which don't follow the standard endpoint format. */
	skipEndpointCorrection?: boolean
};


// response types
/** Autocomplete group result type */
export interface AutocompleteGroup{
	id: string;
	name: string;
	title: string;
};

// miscellaneous helper types

/** Generic CKAN response type */
interface GenericResponse<T>{
	help: string;
	success: boolean;
	result?: T;
	error?: {
		__type: string;
		message: string;
	};
};

/**
 * Implements the CKAN action API as per the latest documentation: https://docs.ckan.org/en/2.10/api/
 */
export default class CKAN{
	/** The base URL for the API */
	private _baseUrl: string;
	/** Settings for the API handler.*/
	options: Settings;

	static readonly malformedApiResponse = "Malformed API response, cannot parse data.";

	/**
	 * @constructor
	 * @param {string} baseUrl - The url for the CKAN API endpoint.
	 * @param {Settings} [options={}] - Base settings for CKAN
	 * @param {}
	 */
	constructor(baseUrl: string, options: Settings = {}){
		// standardise the url for our purposes: replace ending slashes and add /api/3/action at the end
		this.options = options;
		// add a default paramsSerializer if none is provided to prevent axios from encoding characters
		if (!this.options.requestOptions || !this.options.requestOptions?.paramsSerializer) {
			this.options.requestOptions = {
				paramsSerializer : {
					encode: (string) => {
						return string
					}
				}
			}
		}
		this.setBaseUrl(baseUrl);
	}

	/**
	 * @type {string}
	 */
	get baseUrl(){
		return this._baseUrl;
	}
	set baseUrl(newUrl: string){
		this.setBaseUrl(newUrl);
	}

	/**
	 * Changes the base url
	 * @private
	 * @param {string} baseUrl  - The url for the CKAN API endpoint.
	 */
	private setBaseUrl(baseUrl: string){
		if(this.options.skipEndpointCorrection){
			if(!baseUrl.endsWith("/")) baseUrl += "/";
			this._baseUrl = baseUrl;
		}
		else{
			baseUrl = baseUrl.replace(/(\/api)?(\/3)?(\/action)?\/*$/, "");
			this._baseUrl = baseUrl + "/api/3/action/";
		}
	}

	/**
	 * Converts the user options to parameters that CKAN can handle
	 * @private
	 * @param {UserOptions} options
	 */
	private convertUserOptions(options: UserOptions){
		const conversions = {
			"displayName": "display_name",
			"fullName": "fullname",
			"datasets": "number_created_packages"
		};
		return {
			email: options.email,
			order_by: options.sort ? (conversions[options.sort] ?? options.sort) : undefined,
			q: options.search,
		}
	}

	/** Converts one sort option to parameters that CKAN can handle
	 * @private
	 * @param {BaseSortOptions|string} options
	 * @returns {string}
	 */
	private convertSingleSortOption(options: BaseSortOptions | string): string{
		const mapping = {
			datasets: "package_count"
		};
		if(typeof options === "string") return options;
		const optionValue = mapping[options.by] ?? options.by;
		if(options.order) return `${optionValue} ${options.order}`;
		return `${optionValue} asc`;
	}

	/** Converts the sort options to parameters that CKAN can handle
	 * @private
	 * @param {BaseSortOptions|string|undefined} options
	 * @returns {string|undefined}
	 */
	private convertSortOptions(options?: BaseSortOptions | BaseSortOptions[] | string): string | undefined{
		if(!options) return undefined;
		if(Array.isArray(options)){
			return options.map(x => this.convertSingleSortOption(x)).join(", ");
		}
		return this.convertSingleSortOption(options);
	}

	/**
	 * Checks that implementations are not faulty, and simplified endpoints are in fact simplified
	 * Must be used before returning a string array since there are 0 guarantees that responses are formatted correctly
	 * And according to my TypeScript definitions 
	 * @private
	 * @template T
	 * @param {T} check - the array that needs checking. Should be string[], but mis-implemented APIs can cause an error
	 * @returns {string[]}
	 */
	assertStringArray<T>(check: T): string[]{
		if(!Array.isArray(check)) throw new Error(CKAN.malformedApiResponse);
		if(check.some(x => typeof x !== "string")) throw new Error(CKAN.malformedApiResponse);
		return check;
	}

	/**
	 * Checks that implementations are not faulty, and detailed endpoints do, in fact, return details
	 * Must be used before returning a string array since there are 0 guarantees that responses are formatted correctly
	 * And according to my TypeScript definitions 
	 * @private
	 * @template T
	 * @param {T} check - the array that needs checking
	 * @param {string[]} [expectedFields]
	 * @returns {T}
	 */
	assertObjectArray<T>(check: T, expectedFields?: string[]): T{
		if(!Array.isArray(check)) throw new Error(CKAN.malformedApiResponse);
		if(!expectedFields) expectedFields = [];
		if(check.some(x => {
			if(typeof x !== "object" || x === null) return true;
			for(let field of expectedFields){
				if(x[field] === undefined)return true;
			}
			return false;
		})) throw new Error(CKAN.malformedApiResponse);
		return check;
	}

	/**
	 * Carries out a generic CKAN action. Should generally be avoided in favour of specific functions unless the action has not been implemented.
	 * @template T
	 * @template U
	 * @param {string} action - The API action to use.
	 * @param {T} [data] - The data to pass onto the API
	 * @param {AllowedMethods} [method="GET"] - The HTTP request method to use for this endpoint
	 * @returns {Promise<U>}
	 */
	async action<T, U>(action: string, data?: T, method: AllowedMethods = "GET"): Promise<U>{
		let result: AxiosResponse;
		let finalUrl = this._baseUrl + action;
		try {
			switch(method){
				case "GET":
					result = await axios.get(
						finalUrl,
						{...this.options.requestOptions, params: data}
					);
					break;
				case "POST":
					result = await axios.post(finalUrl, data, this.options.requestOptions);
					break;
			}
			const responseData: GenericResponse<U> = result.data;
			if(!responseData.success){
				throw new Error(responseData.error?.message ?? "Unknown API error");
			}
			return responseData.result;
		} catch (error) {
			if(error.response){
				throw new Error("Unknown API error: " + error.response);
			}
		}
	}

	/**
	 * Checks whether an API is accessible.
	 * @returns {Promise<boolean>}
	 */
	async available(): Promise<boolean>{
		return this.action("site_read");
	}

	/** Gets the autocomplete list for datasets (packages)
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <AutocompleteDataset[]>}
	 */
	async autocompleteDataset(query: string, limit?: number): Promise<AutocompleteDataset[]>{
		const expectedFields = ["name", "title", "match"];
		const results: RawAutocompleteDataset[] = await this.action("package_autocomplete", {q: query, limit});
		const parsedResults: AutocompleteDataset[] = this.assertObjectArray(
			results.map(x => parseAutocompleteDataset(x)),
			expectedFields
		);
		return parsedResults;
	}

	/** Gets the autocomplete list for formats
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <string[]>}
	 */
	async autocompleteFormat(query: string, limit?: number): Promise<string[]>{
		const results: string[] = await this.action("format_autocomplete", {q: query, limit});
		return this.assertStringArray(results);
	}

	/** Gets the autocomplete list for groups
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <AutocompleteGroup[]>}
	 */
	async autocompleteGroup(query: string, limit?: number): Promise<AutocompleteGroup[]>{
		const results: AutocompleteGroup[] = await this.action("group_autocomplete", {q: query, limit});
		return this.assertObjectArray(results, ["id", "name", "title"]) as AutocompleteGroup[];
	}

	/** Gets the autocomplete list for organizations
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <AutocompleteGroup[]>}
	 */
	async autocompleteOrganization(query: string, limit?: number): Promise<AutocompleteGroup[]>{
		const results: AutocompleteGroup[] = await this.action("organization_autocomplete", {q: query, limit});
		return this.assertObjectArray(results, ["id", "name", "title"]) as AutocompleteGroup[];
	}

	/** Gets the autocomplete list for tags
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <string[]>}
	 */
	async autocompleteTag(query: string, limit?: number): Promise<string[]>{
		const results: string[] = await this.action("tag_autocomplete", {q: query, limit});
		return this.assertStringArray(results);
	}

	/** Gets the autocomplete list for formats
	 * @param {string} query
	 * @param {number?} limit
	 * @returns {Promise <string[]>}
	 */
	async autocompleteUser(query: string, limit?: number): Promise<AutocompleteUser[]>{
		const results: RawAutocompleteUser[] = await this.action("user_autocomplete", {q: query, limit});
		return results.map(x => parseAutocompleteUser(x));
	}

	/** Searches for a given dataset (package). Does not handle faceted search.
	 * @param {string} query - A solr query string
	 * @param {DatasetSearchOptions} options
	 * @returns {Promise<Dataset[]>}
	 */
	async searchDataset(query: string, options?: DatasetSearchOptions, raw: boolean = false): Promise<Dataset[]>{
		const result = await this.searchDatasetRawResult(query, options);
		return result.results
	}

	async searchDatasetRawResult(query: string, options?: DatasetSearchOptions): Promise<RawSearchResult<Dataset[]>>{
		if(!options) options = {};
		let params: any = {q: query};
		// faceted search is not implemented due to its relative lack of usefulness
		// and the fact that it doesn't play nicely with how all other queries work
		params.facet = false;
		if(options.filterQuery) {
			if (Array.isArray(options.filterQuery)) params.fq = options.filterQuery.join("+");
			else params.fq = options.filterQuery;
		}
		if(options.limit) params.rows = options.limit;
		if(options.offset) params.start = options.offset;
		const results: RawSearchResult<RawDataset[]> = await this.action("package_search", params);
		const parsedResults: Dataset[] = this.assertObjectArray(
			results.results.map(x => parseDataset(x)),
			["id", "title"]
		);
		return {
			results: parsedResults,
			count: results.count,
			sort: results.sort,
			facets: results.facets,
			search_facets: results.search_facets
		}
	}


	/** Searches for a given resource.
	 * @param {string} query - A solr query string
	 * @param {SortOptions} options
	 * @returns {Promise<Resource[]>}
	 */
	async searchResource(query: string, options?: SortOptions): Promise<Resource[]>{
		if(!options) options = {};
		let params: any = {q: query};
		params.order_by = this.convertSortOptions(options.sort);
		params.limit = options.limit;
		params.offset = options.offset;
		const results: RawSearchResult<RawResource[]> = await this.action("resource_search", params);
		return results.results.map(x => parseResource(x));
	}

	/** Gets the details of a data set from the API.
	 * @param {string} id
	 * @returns {Promise<Dataset>}
	 */
	async dataset(id: string): Promise<Dataset>{
		const results: RawDataset = await this.action("package_show", {id, "use_default_schema": true});
		return parseDataset(results);
	}

	/** Gets the API's dataset (package) list.
	 * @param {LimitOptions?} [settings]
	 * @returns {Promise<string[]>}
	 */
	async datasets(settings?: LimitOptions): Promise<string[]>{
		const results = await this.action("package_list", settings);
		return this.assertStringArray(results);
	}

	/** Gets the API's dataset (package) list with additional information.
	 * @param {LimitOptions} [settings]
	 * @returns {Promise<Dataset[]>}
	 */
	async detailedDatasets(settings?: LimitOptions): Promise<Dataset[]>{
		if(settings === undefined) settings = {};
		const expectedFields = ["id", "title", "url"];
		const results: RawDataset[] = await this.action("current_package_list_with_resources", settings);
		const parsedResults: Dataset[] = this.assertObjectArray(results.map(x => parseDataset(x)), expectedFields);
		return parsedResults;
	}

	/** Gets a group from the API
	 * @param {string} id
	 * @param {SingleGroupOptions?} [settings]
	 * @returns {Promise<Group>}
	 */
	async group(id: string, settings: SingleGroupOptions): Promise<Group>{
		if(settings === undefined) settings = {};
		const params = {
			id,
			include_datasets: !!settings.include?.datasets,
			include_dataset_count: settings.include?.datasetCount ?? true,
			include_extras: settings.include?.extras ?? true,
			include_users: !!settings.include?.users,
			include_groups: settings.include?.subgroups ?? true,
			include_tags: settings.include?.tags ?? true,
			include_followers: settings.include?.followers ?? true
		};
		const results: RawGroup = await this.action("group_show", params);
		const parsedResults: Group = parseGroup(results);
		return parsedResults;
	}

	/** Gets the API's group list by only names.
	 * @param {SortOptions?} [settings]
	 * @returns {Promise<string[]>}
	 */
	async groups(settings?: SortOptions): Promise<string[]>{
		const sort = this.convertSortOptions(settings?.sort);
		const results = await this.action("group_list", {sort});
		return this.assertStringArray(results);
	}

	/** Gets the API's group list with details.
	 * @param {GroupOptions} [settings={}]
	 * @returns {Promise<Group[]>}
	 */
	async detailedGroups(settings: GroupOptions = {}): Promise<Group[]>{
		if(!settings.include) settings.include = {};
		const expectedFields = ["id", "displayName"];
		const params = {
			limit: settings.limit,
			offset: settings.offset,
			all_fields: true,
			include_dataset_count: settings.include.datasetCount,
			include_extras: settings.include.extras,
			include_users: settings.include.users,
			sort: this.convertSortOptions(settings.sort)
		};
		const results: RawGroup[] = await this.action("group_list", params);
		const parsedResults: Group[] = this.assertObjectArray(results.map(x => parseGroup(x)), expectedFields);
		return parsedResults;
	}

	/** Gets the API's license list.
	 * @returns {Promise<License[]>}
	 */
	async licenses(): Promise<License[]>{
		const results: RawLicense[] = await this.action("license_list");
		return results.map(x => parseLicense(x));
	}

	/** Gets an organization from the API.
	 * @param {string} id
	 * @param {SingleGroupOptions?} [settings]
	 * @returns {Promise<Organization>}
	 */
	async organization(id: string, settings?: SingleGroupOptions): Promise<Organization>{
		if(settings === undefined) settings = {};
		const params = {
			id,
			include_datasets: !!settings.include?.datasets,
			include_dataset_count: settings.include?.datasetCount ?? true,
			include_extras: settings.include?.extras ?? true,
			include_users: !!settings.include?.users,
			include_groups: settings.include?.subgroups ?? true,
			include_tags: settings.include?.tags ?? true,
			include_followers: settings.include?.followers ?? true
		};
		const results: RawOrganization = await this.action("organization_show", params);
		return parseOrganization(results);
	}

	/** Gets the API's organizations list.
	 * @param {SortOptions} [settings]
	 * @returns {Promise<string[]>}
	 */
	async organizations(settings?: SortOptions): Promise<string[]>{
		const sort = this.convertSortOptions(settings?.sort);
		const results = await this.action("organization_list", {sort});
		return this.assertStringArray(results);
	}

	/** 
	 * @param {OrganizationOptions} [params={}]
	 * @returns {Promise<Organization[]>}
	 */
	async detailedOrganizations(settings: GroupOptions = {}): Promise<Organization[]>{
		if(!settings.include) settings.include = {};
		const expectedFields = ["id", "displayName"];
		const params = {
			limit: settings.limit,
			offset: settings.offset,
			all_fields: true,
			include_dataset_count: settings.include.datasetCount,
			include_extras: settings.include.extras,
			include_users: settings.include.users,
			sort: this.convertSortOptions(settings.sort)
		};
		const results: RawOrganization[] = await this.action("organization_list", params);
		const parsedResults: Organization[] = this.assertObjectArray(results.map(x => parseOrganization(x)), expectedFields);
		return parsedResults;
	}

	/** Gets the details of a resource from the API.
	 * @param {string} id
	 * @returns {Promise<Resource>}
	 */
	async resource(id: string): Promise<Resource>{
		const results: RawResource = await this.action("resource_show", {id, "use_default_schema": true});
		return parseResource(results);
	}

	/** Gets the API's tag list.
	 * @param {TagOptions} [settings]
	 * @returns {Promise<string[]>}
	 */
	async tags(settings?: TagOptions): Promise<string[]>{
		const results = await this.action("tag_list", settings);
		return this.assertStringArray(results);
	}

	/** Gets the API's tag list with details.
	 * @param {TagOptions} [settings]
	 * @returns {Promise<Tag[]>}
	 */
	async detailedTags(settings?: TagOptions): Promise<Tag[]>{
		const results: RawTag[] = await this.action("tag_list", {...settings, all_fields: true});
		return results.map(x => parseTag(x));
	}

	/** Gets a user from the API.
	 * @param {string} id
	 * @returns {Promise<User>}
	 */
	async user(id: string): Promise<User>{
		const results: RawUser = await this.action("user_show", {id});
		return parseUser(results);
	}

	/** Gets the API's user list.
	 * @param {UserOptions} [settings={}]
	 * @returns {Promise<string[]>}
	 */
	async users(settings: UserOptions = {}): Promise<string[]>{
		const results = await this.action("user_list", {...this.convertUserOptions(settings), all_fields: false});
		return this.assertStringArray(results);
	}

	/** Gets the API's detailed user list.
	 * @param {UserOptions} [settings={}]
	 * @returns {Promise<User[]>}
	 */
	async detailedUsers(settings: UserOptions = {}): Promise<User[]>{
		const results: RawUser[] = await this.action("user_list", this.convertUserOptions(settings));
		return results.map(x => parseUser(x));
	}

	/** Gets a single vocabulary from the API
	 * @param {string} id
	 * @returns {Promise<Vocabulary>}
	 */
	async vocabulary(id: string): Promise<Vocabulary>{
		const results: Vocabulary = await this.action("vocabulary_show", {id});
		return parseVocabulary(results);
	}

	/** Gets the API's vocabulary list
	 * @returns {Promise<Vocabulary[]>}
	 */
	async vocabularies(): Promise<Vocabulary[]>{
		const results: RawVocabulary[] = await this.action("vocabulary_list");
		return results.map(x => parseVocabulary(x));
	}
};