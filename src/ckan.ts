import axios, {AxiosResponse} from "axios";

import parseGroup from "./parsers/group";
import parseLicense from "./parsers/license";
import parsePackage from "./parsers/package";

import type {
	Settings, AllowedMethods, GroupInclusionOptions, LimitOptions, TagOptions, GenericResponse,
	Group, License, Organization, Package, Resource, Tag, User,
	RawGroup, RawLicense, RawPackage
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
	 * @param {LimitOptions?} [limit]
	 * @returns {Promise<string[]>}
	 */
	async groups(limit?: LimitOptions): Promise<string[]>{
		return this.action("group_list", limit)
	}

	/** Gets the API's group list with details.
	 * @param {GroupInclusionOptions} [params={}]
	 * @returns {Promise<Group[]>}
	 */
	async detailedGroups(params: GroupInclusionOptions = {}): Promise<Group[]>{
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
		return this.action("tag_list", settings);
	}
};