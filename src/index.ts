import axios, {AxiosResponse} from "axios";
import type {
	Settings,
	AllowedMethods, GroupInclusionOptions, LimitOptions, TagOptions,
	Group, License, Organization, Package, Resource, Tag,
	RawExtra, RawGroup, RawLicense, RawOrganization, RawPackage, RawResource, RawTag,
	GenericResponse, Metadata, StringIndexedObject
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

	/** Processes a date
	 * @private
	 * @param {string} [date]
	 * @returns {Date|undefined}
	 */
	private processDate(date?: string){
		return date ? new Date(date) : undefined;
	}

	/**
	 * Processes the extras field
	 * @private
	 * @param {RawExtra[]} [extras]
	 * @returns {StringIndexedObject: any}
	 */
	private processExtras(extras?: RawExtra[]): StringIndexedObject{
		if(!extras) return [];
		let obj: StringIndexedObject = {};
		for(let extra of extras){
			obj[extra.key] = extra.value;
		}
		return obj;
	}

	/** Processes a group
	 * @private
	 * @param {RawGroup} group
	 * @returns {Group}
	 */
	private processGroup(group: RawGroup): Group{
		const {
			approval_status, created, dataset_count, description, display_name, extras,
			groups, id, image_display_url, is_organization, name, num_followers,
			package_count, state, title, type, ...rest
		} = group;
		delete rest.image_url;
		return {
			approvalStatus: approval_status,
			description: description ?? "",
			displayName: display_name ?? "",
			id,
			imageUrl: image_display_url,
			groups,
			name: name ?? "",
			organization: is_organization,
			state,
			stats: {
				datasets: dataset_count,
				followers: num_followers,
				packages: package_count
			},
			type,
			title: title ?? "",
			additionalData: {...rest, ...this.processExtras(extras)}
		};
	}

	/** Ensures that the language is an array at all times
	 * @private
	 * @param {string | string[]} [language]
	 * @returns {string[]}
	 */
	private processLanguages(language?: string | string[]): string[]{
		return language ? (Array.isArray(language) ? language : [language]) : undefined;
	}

	/** Processes a raw license
	 * @private
	 * @param {RawLicense} license
	 * @returns {License}
	 */
	private processLicense(license: RawLicense): License{
		const {is_okd_compliant, is_osi_compliant, od_conformance, osd_conformance,
		domain_content, domain_data, domain_software, family, is_generic, id, status, title, url,
		...rest} = license;
		return {
			compliance: {
				okd: is_okd_compliant,
				osi: is_osi_compliant
			},
			conformance: {
				od: od_conformance,
				osd: osd_conformance
			},
			domain: {
				content: domain_content,
				data: domain_data,
				software: domain_software
			},
			family,
			generic: is_generic,
			id,
			status,
			title: title ?? "",
			url,
			additionalData: rest
		};
	}

	/**
	 * Processes an organization into consistent, parsed outputs.
	 * @private
	 * @param {RawOrganization} [organization]
	 * @returns {Organization}
	 */
	private processOrganization(organization: RawOrganization): Organization{
		const {
			approval_status, created, description, id, image_url,
			is_organization, name, state, title, type,
			...rest
		} = organization;
		return {
			approvalStatus: approval_status,
			created: this.processDate(created),
			description: description ?? "",
			id,
			imageUrl: image_url,
			isOrganization: is_organization ?? true,
			name: name ?? "",
			state,
			title: title ?? "",
			type,
			additionalData: rest
		};
	}

	/** Processes a resource into consistent, parsed outputs.
	 * @private
	 * @param {RawResource} resource
	 * @returns {Resource}
	 */
	private processResource(resource: RawResource): Resource{
		const {
			datastore_active, url_type, cache_url, cache_last_updated, created, description,
			format, hash, id, language, metadata_created, metadata_modified, metadata_language,
			mimetype, mimetype_inner, last_modified, name, package_id, position,
			size, state, url,
			...rest
		} = resource;
		return {
			access: {
				active: datastore_active,
				urlType: url_type
			},
			cache: {
				url: cache_url,
				updated: this.processDate(cache_last_updated)
			},
			created: this.processDate(created),
			description,
			format,
			hash,
			id,
			languages: this.processLanguages(language),
			metadata: {
				created: this.processDate(metadata_created),
				modified: this.processDate(metadata_modified),
				language: metadata_language
			},
			mimeType: {
				resource: mimetype,
				inner: mimetype_inner
			},
			modified: this.processDate(last_modified),
			name: name ?? "",
			package: {
				id: package_id,
				position
			},
			size,
			state,
			url: url ?? "",
			additionalData: rest
		};
	}

	/** Processes a tag
	 * @private
	 * @param {RawTag} tag
	 * @returns {Tag}
	 */
	private processTag(tag: RawTag): Tag{
		const {id, name, display_name, state, vocabulary_id, ...rest} = tag;
		return {
			displayName: display_name ?? "",
			id,
			name: name ?? "",
			state,
			vocabularyId: vocabulary_id,
			additionalData: rest
		};
	}

	/**
	 * Processes a package into consistent, parsed outputs.
	 * @private
	 * @param {RawPackage} ckanPackage
	 * @returns {Package}
	 */
	private processPackage(ckanPackage: RawPackage): Package{
		const {
				author, author_email, issued, creator_user_id, groups, id, language,
				license_id, license_title, license_url, maintainer, maintainer_email,
				modified, metadata_created, metadata_modified, metadata_language,
				name, notes, isopen, organization, resources,
				relationships_as_object, relationships_as_subject, state,
				tags, title, type, url, version,
				extras, ...rest
			} = ckanPackage;
			// workaround since "private" can't be destructured due to being a reserved keyword 
			const isPrivate = rest.private;
			delete rest.private;
			// removing unnecessary information - just use .resources.length and .tags.length instead
			delete rest.num_resources;
			delete rest.num_tags;
			delete rest.owner_org;
			return {
				author: {
					name: author,
					email: author_email
				},
				created: this.processDate(issued),
				creator: {
					id: creator_user_id
				},
				groups: groups ? groups.map(x => this.processGroup(x)) : [],
				id,
				languages: this.processLanguages(language),
				license: {
					id: license_id,
					title: license_title,
					url: license_url
				},
				maintainer: {
					name: maintainer,
					email: maintainer_email
				},
				modified: this.processDate(modified),
				metadata: {
					created: this.processDate(metadata_created),
					modified: this.processDate(metadata_modified),
					language: metadata_language
				},
				name,
				notes,
				open: isopen,
				organization: this.processOrganization(organization),
				private: isPrivate,
				resources: resources ? resources.map(x => this.processResource(x)) : [],
				relationships:{
					subject: relationships_as_subject,
					object: relationships_as_object
				},
				state,
				tags: tags ? tags.map(x => this.processTag(x)) : [],
				title,
				type,
				url,
				version,
				additionalData: {...rest, ...this.processExtras(extras)}
			};
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
		newResults = results.map(x => this.processPackage(x));
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
			include_extras: params.include.extras
		};
		const groups: RawGroup[] = await this.action("group_list", settings);
		return groups.map(x => this.processGroup(x));
	}

	/** Gets the API's license list.
	 * @returns {Promise<License[]>}
	 */
	async licenses(): Promise<License[]>{
		const results: RawLicense[] = await this.action("license_list");
		return results.map(x => this.processLicense(x));
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