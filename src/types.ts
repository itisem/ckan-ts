import type {AxiosRequestConfig} from "axios";

/////// Settings types

/** Allowed HTTP request methods */
export type AllowedMethods = "GET" | "POST" | "PATCH" | "DELETE";

/** Expected field options */
export interface ExpectedFieldsOptions{
	expectedFields?: string[];
};

/** Group inclusion settings */
export interface GroupOptions extends SortOptions, ExpectedFieldsOptions{
	include?: {
		datasetCount?: boolean;
		extras?: boolean;
		users?: boolean;
	};
};

/** Single group data settings */
export interface SingleGroupOptions{
	include?: {
		datasets?: boolean;
		datasetCount?: boolean;
		followers?: boolean;
		extras?: boolean;
		subgroups?: boolean;
		tags?: boolean;
		users?: boolean;
	};
};

/** Limit and offset settings */
export interface LimitOptions{
	limit?: number;
	offset?: number;
};

/** Simple sort options */
export interface BaseSortOptions{
	by: "title" | "name" | "datasets";
	order?: "asc" | "desc";
};

/** Basic organization & group sort settings */
export interface SortOptions extends LimitOptions{
	sort?: BaseSortOptions | string;
};

/** Organization inclusion settings */
export interface OrganizationOptions extends SortOptions, ExpectedFieldsOptions{
	include?: {
		datasetCount?: boolean;
		extras?: boolean;
		users?: boolean;
	}
};

/** User settings */
export interface UserOptions{
	search?: string;
	email?: string;
	sort?: "about" | "created" | "displayName" | "fullName" | "id" | "name" | "datasets" | "sysadmin";
};

/** Settings for the tag search */
export interface TagOptions{
	query?: string;
	vocabularyId?: string;
};

/** Settings for the CKAN module */
export interface Settings{
	/** Request options to pass along to got. For more info, see the documentation: https://axios-http.com/docs/req_config */
	requestOptions?: AxiosRequestConfig;
	/** Ignore automatic API URL correction. Used for endpoints which don't follow the standard endpoint format. */
	skipEndpointCorrection?: boolean
};

/////// Parsed output types

/** Autocomplete group result type */
export interface AutocompleteGroup{
	id: string;
	name: string;
	title: string;
};

/** Autocomplete dataset type */
export interface AutocompleteDataset{
	name: string;
	title: string;
	match?: {
		field?: string;
		displayed?: string;
	};
};

/** Autocomplete user result type */
export interface AutocompleteUser{
	id: string;
	name: string;
	fullName?: string;
};

/** Group type */
export interface Group{
	/** The group's approval status */
	approvalStatus?: string;
	/** When was the group created */
	created?: Date;
	/** A long-form description of the group */
	description: string;
	/** The group's full, human-readable display name */
	displayName: string;
	/** The groups this group belongs to */
	groups?: string[];
	/** The group's id (usually a UUID) */
	id: string;
	/** The group's display image */
	imageUrl?: string;
	/** The group's short name, often not human-readable */
	name: string;
	/** Is the group an organization */
	organization?: boolean;
	/** The group's state */
	state?: string;
	/** The group's numerical statistics */
	stats: {
		datasets?: number;
		followers?: number;
	};
	/** The group's full title */
	title: string;
	/** The group's type */
	type?: string;
	/** The group's members */
	users?: User[];
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** License type */
export interface License{
	/** The license's compliance with other standards */
	compliance: {
		/** Is the license OKD compliant */
		okd?: boolean;
		/** Has the licence been approved by the Open Source Initiative */
		osi?: boolean;
	};
	/** The license's conformance with other standards */
	conformance: {
		/** Is the license conformant with the Open Definition */
		od?: string;
		/** Is the license conformant with the Open Source Definition */
		osd?: string;
	};
	/** The license's usage on the domain */
	domain: {
		content?: boolean;
		data?: boolean;
		software?: boolean;
	};
	/** The license's id */
	id: string;
	/** The license's human-readable title */
	title: string;
	/** Which family of licenses this license belongs to */
	family?: string;
	/** Is the license generic? */
	generic?: boolean;
	/** The license's status */
	status?: string;
	/** The license's URL */
	url?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
}

/** Organization CKAN type */
export interface Organization{
	/** A long-form description of the organization */
	description: string;
	/** The group's full, human-readable display name */
	displayName: string;
	/** The organization's ID (usually a UUID) */
	id: string;
	/** Is the organization an organization? (Almost always true) */
	isOrganization: boolean;
	/** The organization's short name, often not human-readable */
	name: string;
	/** The organization's numerical statistics */
	stats: {
		datasets?: number;
		followers?: number;
	};
	/** The organization's full, human-readable title */
	title: string;
	/** Has the organization been approved in the database */
	approvalStatus?: string;
	/** When was the organization created in the database */
	created?: Date;
	/** The organization's display image */
	imageUrl?: string;
	/** The organization's state */
	state?: string;
	/** The organization's type */
	type?: string;
	/** The organization's members */
	users?: User[];
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** Processed CKAN dataset type */
export interface Dataset{
	/** The dataset's author */
	author: {
		name?: string;
		email?: string;
	};
	/** Creator information */
	creator: {
		id?: string;
	};
	/** Group information */
	groups: Group[];
	/** The identification of the dataset */
	id: string;
	/** A list of languages the dataset is available in */
	languages: string[];
	/** The license under which the resource was released */
	license: {
		id?: string;
		title?: string;
		url?: string;
	};
	/** The dataset's maintainer */
	maintainer: {
		name?: string;
		email?: string;
	};
	/** Meta-metadata */
	metadata: Metadata;
	/** The dataset's name, often not human-readable. */
	name: string;
	/** Information about the publishing organisation */
	organization?: Organization;
	/** Resources for the given dataset. */
	resources: Resource[];
	/** The object's relationships */
	relationships: {
		subject?: any[];
		object?: any[];
	};
	/** The dataset's tags */
	tags: Tag[];
	/** The dataset's title, human-readable */
	title: string;
	/** The dataset's permanent URL */
	url: string;
	/** When the dataset was first issued */
	created?: Date;
	/** When the dataset was last modified */
	modified?: Date;
	/** Notes the publisher has released about the dataset */
	notes?: string;
	/** Is the dataset open */
	open?: boolean;
	/** Is the dataset private? */
	private?: boolean;
	/** What is the dataset's state */
	state?: string;
	/** What type of dataset is it (usually, but not always "dataset") */
	type?: string;
	/** The dataset's current version number */
	version?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** Processed resource type */
export interface Resource{
	/** Information about the resource's accessibility */
	access: {
		active?: boolean;
		urlType?: string;
	};
	/** Information about the document's cached version */
	cache: {
		url?: string;
		updated?: Date;
	};
	/** The dataset the resource belongs to */
	dataset: {
		/** The dataset's ID */
		id?: string;
		/** The resource's position within the dataset */
		position?: number;
	};
	/** The resource's ID */
	id: string;
	/** Which languages the resource was published in */
	languages: string[];
	/** Meta-metadata */
	metadata: Metadata;
	/** Information about the document's MIME type */
	mimeType: {
		/** The resource's direct MIME type */
		resource?: string;
		/** The MIME type of resources contained within archives */
		inner?: string;
	};
	/** The resource's short name, may not be human-readable */
	name: string;
	/** The resource's url */
	url: string;
	/** When the resource was created */
	created?: Date;
	/** The resource's long-form description */
	description?: string;
	/** The resource's file format */
	format?: string;
	/** The resource's hash */
	hash?: string;
	/** When the resource was last modified */
	modified?: Date;
	/** The resource's size */
	size?: number | null;
	/** The resource's state */
	state?: string;
	/** Non-standard additional data provided by the API. */
	additionalData: StringIndexedObject;
};

/** Tag type */
export interface Tag{
	/** The tag's full, human-readable display name */
	displayName: string;
	/** The tag's id (usually a UUID) */
	id: string;
	/** The tag's short name, often not human-readable */
	name: string;
	/** What status is the tag in */
	state?: string;
	/** The tag's vocabulary ID */
	vocabularyId?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** User type */
export interface User{
	/** The user's display name */
	displayName: string;
	/** The user's id */
	id: string;
	/** The user's rights */
	rights: {
		role?: string;
		sysadmin?: boolean;
	};
	/** The user's statistics */
	stats: {
		edits?: number;
		datasets?: number;
	};
	/** When the user account was created */
	created?: Date;
	/** The user's full name */
	fullName?: string;
	/** The user's openid */
	openid?: string;
	/** The user's status */
	state?: string;
	/** Non-standard additional data provided by the API. */
	additionalData: StringIndexedObject;
};

/** Vocabulary type */
export interface Vocabulary{
	/** The vocabulary's id */
	id: string;
	/** The vocabulary's name */
	name: string;
	/** The tags associated with the vocabulary */
	tags: Tag[];
	/** Non-standard additional data provided by the API. */
	additionalData: StringIndexedObject;
};

/////// Raw output types

/** Raw autocomplete dataset type */
export interface RawAutocompleteDataset{
	match_field?: string;
	match_displayed?: string;
	name: string;
	title: string;
};

export interface RawAutocompleteUser{
	id: string;
	name: string;
	full_name?: string;
};

/** Raw extras type */
export interface RawExtra{
	key: string;
	value: any;
};

/** Raw group type */
export interface RawGroup{
	approval_status?: string;
	created?: string;
	dataset_count?: number;
	description?: string;
	display_name: string;
	groups?: string[];
	id: string;
	image_url?: string;
	is_organization?: boolean;
	name?: string;
	num_followers?: number;
	package_count?: number;
	revision_id?: string;
	state?: string;
	title?: string;
	users?: RawUser[];
	image_display_url?: string;
	[key: string]: any;
};

/** Raw License type */
export interface RawLicense{
	domain_content?: boolean;
	domain_data?: boolean;
	domain_software?: boolean;
	family?: string;
	id: string;
	is_generic?: boolean;
	maintainer?: string;
	od_conformace?: string;
	osd_conformance?: string;
	status?: string;
	title?: string;
	url?: string;
	is_okd_compliant?: boolean;
	is_osi_compliant?: boolean;
	[key: string]: any;
};

/** Raw organization CKAN type */
export interface RawOrganization{
	id: string;
	approval_status?: string;
	created?: string;
	dataset_count?: number;
	description?: string;
	displayName: string;
	image_url?: string;
	is_organization?: boolean;
	name?: string;
	num_followers?: number;
	package_count?: number;
	state?: string;
	title?: string;
	type?: string;
	users?: RawUser[];
	[key: string]: any;
};

/** Raw CKAN dataset type for processing */
export interface RawDataset{
	id: string;
	name: string;
	title: string;
	url: string;
	resources: RawResource[];
	organization: RawOrganization;
	groups?: RawGroup[];
	author?: string;
	author_email?: string;
	maintainer?: string;
	maintainer_email?: string;
	metadata_created?: string;
	metadata_modified?: string;
	metadata_language?: string;
	language?: string | string[];
	notes?: string;
	issued?: string;
	modified?: string;
	private?: boolean;
	state?: string;
	version?: string;
	num_resources?: number;
	num_tags?: number;
	isopen?: boolean;
	creator_user_id?: string;
	owner_org?: string;
	extras?: RawExtra[];
	relationships_as_subject?: any[];
	relationships_as_object?: any[];
	tags?: RawTag[];
	[key:string]: any;
};

/** Raw resource type */
export interface RawResource{
	cache_last_updated?: string;
	cache_url?: string;
	created?: string;
	datastore_active?: boolean;
	description?: string;
	format?: string;
	hash?: string;
	id?: string;
	language?: string | string[];
	last_modified?: string;
	metadata_created?: string;
	metadata_modified?: string;
	metadata_language?: string;
	mimetype?: string;
	mimetype_inner?: string;
	package_id?: string;
	position?: number;
	size?: number | null,
	state?: string;
	url: string;
	url_type?: string;
	[key:string]: any;
};

/** Raw tag type */
export interface RawTag{
	display_name?: string;
	id: string;
	name?: string;
	state?: string;
	vocabulary_id?: string;
	[key: string]: any;
};

/** Raw user type */
export interface RawUser{
	activity_streams_email_notifications?: boolean;
	about?: string;
	capacity?: string;
	display_name?: string;
	fullname?: string;
	email_hash?: string;
	id: string;
	number_created_packages?: number;
	number_of_edits?: number;
	openid?: string;
	state?: string;
	sysadmin?: boolean;
	[key:string]: any;
};

/** Vocabulary type */
export interface RawVocabulary{
	id: string;
	name: string;
	tags: RawTag[];
	[key:string]: any;
};

/////// Miscellaneous types used in responses

/** Generic CKAN response type */
export interface GenericResponse<T>{
	help: string;
	success: boolean;
	result?: T;
	error?: {
		__type: string;
		message: string;
	};
};

export interface Metadata{
	created?: Date;
	modified?: Date;
	language?: string;
};


export interface StringIndexedObject{
	[key: string]: any;
};