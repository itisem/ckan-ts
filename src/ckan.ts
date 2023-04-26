import axios, {AxiosResponse} from "axios";
import * as CKANTypes from "./types";

/**
 * Implements the CKAN action API as per the latest documentation: https://docs.ckan.org/en/2.10/api/
 */
export default class CKAN{
	/** The base URL for the API */
	private _baseUrl: string;
	/** Settings for the API handler.*/
	options: CKANTypes.Settings;

	/**
	 * @constructor
	 * @param {string} baseUrl - The url for the CKAN API endpoint.
	 * @param {CKANSettings} [options={}] - Base settings for CKAN
	 * @param {}
	 */
	constructor(baseUrl: string, options: CKANTypes.Settings = {}){
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
	 * Carries out a generic CKAN action. Should generally be avoided in favour of specific functions.
	 * @template T
	 * @template U
	 * @param {string} action - The API action to use.
	 * @param {AllowedMethods} [method="GET"] - The HTTP request method to use for this endpoint
	 * @param {T} [data] - The data to pass onto the API
	 * @returns {Promise<U>}
	 */
	async action<T, U>(action: string, method: CKANTypes.AllowedMethods = "GET", data?: T): Promise<U>{
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
		const responseData: CKANTypes.GenericResponse<U> = result.data;
		if(!responseData.success){
			throw new Error(responseData.error?.message ?? "Unknown API error");
		}
		return responseData.result;
	}

	/**
	 * Checks whether an API is accessible.
	 * @returns {Promise<boolean>}
	 */
	async siteRead(): Promise<boolean>{
		return this.action("site_read");
	}

	/** Gets the API's package list.
	 * @param {int?} [limit] - The number of resources per page.
	 * @param {int?} [offset] - The number of resources that should be ignored.
	 */
	async getPackageList(limit?: number, offset?: number): Promise<string[]>{
		let data: {limit?: number, offset?: number} = {};
		if(limit) data.limit = limit;
		if(offset) data.offset = offset;
		return this.action("package_list");
	}
};