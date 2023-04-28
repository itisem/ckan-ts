import axios, {AxiosResponse} from "axios";

import parseGroup from "./parsers/group";
import parseLicense from "./parsers/license";
import parseOrganization from "./parsers/organization";
import parsePackage from "./parsers/package";
import parseResource from "./parsers/resource";
import parseTag from "./parsers/tag";
import parseUser from "./parsers/user";

import type {
	Settings, AllowedMethods, GenericResponse,
	ExpectedFieldsOptions, GroupOptions, LimitOptions, OrganizationOptions, SortOptions, TagOptions, UserOptions,
	Group, License, Organization, Package, Resource, Tag, User,
	RawGroup, RawLicense, RawOrganization, RawPackage, RawResource, RawTag, RawUser,
} from "./types";

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
			"packages": "number_created_packages"
		};
		return {
			email: options.email,
			order_by: options.sort ? (conversions[options.sort] ?? options.sort) : undefined,
			q: options.search,
		}
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
	private assertStringArray<T>(check: T): string[]{
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
	private assertObjectArray<T>(check: T, expectedFields?: string[]): T{
		if(!Array.isArray(check)) throw new Error(CKAN.malformedApiResponse);
		if(check.some(x => {
			if(typeof x !== "object" || x === null) return true;
			for(let field of expectedFields) if(x[field] === undefined) return true;
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
	}

	/**
	 * Checks whether an API is accessible.
	 * @returns {Promise<boolean>}
	 */
	async available(): Promise<boolean>{
		return this.action("site_read");
	}

	/** Gets the details of a data set from the API.
	 * @param {string} id
	 * @returns {Promise<Package>}
	 */
	async dataset(id: string): Promise<Package>{
		const results: RawPackage = await this.action("package_show", {id, "use_default_schema": true});
		return parsePackage(results);
	}

	/** Gets the API's package list.
	 * @param {LimitOptions?} [settings]
	 * @returns {Promise<string[]>}
	 */
	async datasets(settings?: LimitOptions): Promise<string[]>{
		const results = await this.action("package_list", settings);
		return this.assertStringArray(results);
	}

	/** Gets the API's package list with additional information.
	 * @param {LimitOptions & ExpectedFieldsOptions} [settings]
	 * @returns {Promise<Package[]>}
	 */
	async detailedDatasets(settings?: LimitOptions & ExpectedFieldsOptions): Promise<Package[]>{
		if(settings === undefined) settings = {};
		if(settings.expectedFields === undefined) settings.expectedFields = ["id", "title", "url"];
		let {expectedFields, ...params} = settings;
		const results: RawPackage[] = await this.action("current_package_list_with_resources", params);
		const parsedResults: Package[] = this.assertObjectArray(results.map(x => parsePackage(x)), expectedFields);
		return parsedResults;
	}

	/** Gets the API's group list by only names.
	 * @param {SortOptions?} [settings]
	 * @returns {Promise<string[]>}
	 */
	async groups(settings?: SortOptions): Promise<string[]>{
		const results = await this.action("group_list", settings);
		return this.assertStringArray(results);
	}

	/** Gets the API's group list with details.
	 * @param {GroupOptions} [settings={}]
	 * @returns {Promise<Group[]>}
	 */
	async detailedGroups(settings: GroupOptions = {}): Promise<Group[]>{
		if(!settings.include) settings.include = {};
		if(!settings.expectedFields) settings.expectedFields = ["id", "displayName"];
		const params = {
			limit: settings.limit,
			offset: settings.offset,
			all_fields: true,
			include_dataset_count: settings.include.datasetCount,
			include_extras: settings.include.extras,
			include_users: settings.include.users
		};
		const results: RawGroup[] = await this.action("group_list", params);
		const parsedResults: Group[] = this.assertObjectArray(results.map(x => parseGroup(x)), settings.expectedFields);
		return parsedResults;
	}

	/** Gets the API's license list.
	 * @returns {Promise<License[]>}
	 */
	async licenses(): Promise<License[]>{
		const results: RawLicense[] = await this.action("license_list");
		return results.map(x => parseLicense(x));
	}

	/** Gets the API's organizations list.
	 * @param {SortOptions} [settings]
	 * @returns {Promise<string[]>}
	 */
	async organizations(settings?: SortOptions): Promise<string[]>{
		const results = await this.action("organization_list", settings);
		return this.assertStringArray(results);
	}

	/** 
	 * @param {OrganizationOptions} [params={}]
	 */
	async detailedOrganizations(settings: OrganizationOptions = {}): Promise<Organization[]>{
		if(!settings.include) settings.include = {};
		if(!settings.expectedFields) settings.expectedFields = ["id", "displayName"];
		const params = {
			limit: settings.limit,
			offset: settings.offset,
			all_fields: true,
			include_dataset_count: settings.include.datasetCount,
			include_extras: settings.include.extras,
			include_users: settings.include.users
		};
		const results: RawOrganization[] = await this.action("organization_list", params);
		const parsedResults: Organization[] = this.assertObjectArray(results.map(x => parseOrganization(x)), settings.expectedFields);
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
};