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
	GroupOptions, LimitOptions, OrganizationOptions, SortOptions, TagOptions, UserOptions,
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
		const result: RawPackage = await this.action("package_show", {id, "use_default_schema": true});
		return parsePackage(result);
	}

	/** Gets the API's package list.
	 * @param {LimitOptions?} [limit]
	 * @returns {Promise<string[]>}
	 */
	async datasets(limit?: LimitOptions): Promise<string[]>{
		return this.action("package_list", limit);
	}

	/** Gets the API's package list with additional information.
	 * @param {LimitOptions?} [limit]
	 * @returns {Promise<Package[]>}
	 */
	async detailedDatasets(limit?: LimitOptions): Promise<Package[]>{
		const results: RawPackage[] = await this.action("current_package_list_with_resources", limit);
		let newResults: Package[];
		newResults = results.map(x => parsePackage(x));
		return newResults;
	}

	/** Gets the API's group list by only names.
	 * @param {SortOptions?} [settings]
	 * @returns {Promise<string[]>}
	 */
	async groups(settings?: SortOptions): Promise<string[]>{
		return this.action("group_list", settings)
	}

	/** Gets the API's group list with details.
	 * @param {GroupOptions} [params={}]
	 * @returns {Promise<Group[]>}
	 */
	async detailedGroups(params: GroupOptions = {}): Promise<Group[]>{
		if(!params.include) params.include = {};
		const settings = {
			limit: params.limit,
			offset: params.offset,
			all_fields: true,
			include_dataset_count: params.include.datasetCount,
			include_extras: params.include.extras,
			include_users: params.include.users
		};
		const groups: RawGroup[] = await this.action("group_list", settings);
		return groups.map(x => parseGroup(x));
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
		return this.action("organization_list", settings);
	}

	/** 
	 * @param {OrganizationOptions} [params={}]
	 */
	async detailedOrganizations(params: OrganizationOptions = {}): Promise<Organization[]>{
		if(!params.include) params.include = {};
		const settings = {
			limit: params.limit,
			offset: params.offset,
			all_fields: true,
			include_dataset_count: params.include.datasetCount,
			include_extras: params.include.extras,
			include_users: params.include.users
		};
		const results: RawOrganization[] = await this.action("organization_list", settings);
		return results.map(x => parseOrganization(x));
	}

	/** Gets the details of a resource from the API.
	 * @param {string} id
	 * @returns {Promise<Resource>}
	 */
	async resource(id: string): Promise<Resource>{
		const result: RawResource = await this.action("resource_show", {id, "use_default_schema": true});
		return parseResource(result);
	}

	/** Gets the API's tag list.
	 * @param {TagOptions} [settings]
	 * @returns {Promise<string[]>}
	 */
	async tags(settings?: TagOptions): Promise<string[]>{
		return this.action("tag_list", settings);
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
		return this.action("user_list", {...this.convertUserOptions(settings), all_fields: false});
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