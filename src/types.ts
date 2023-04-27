import type {AxiosRequestConfig} from "axios";

/** Settings for the CKAN module */
export interface Settings{
	/** Request options to pass along to got. For more info, see the documentation: https://axios-http.com/docs/req_config */
	requestOptions?: AxiosRequestConfig;
	/** Ignore automatic API URL correction. Used for endpoints which don't follow the standard endpoint format. */
	skipEndpointCorrection?: boolean
};

/** Allowed HTTP request methods */
export type AllowedMethods = "GET" | "POST" | "PATCH" | "DELETE";

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

/** Group type */
export interface Group{
	/** A long-form description of the group */
	description: string;
	/** The group's full, human-readable display name */
	displayName: string;
	/** The group's id (usually a UUID) */
	id: string;
	/** The group's short name, often not human-readable */
	name: string;
	/** The group's full title */
	title: string;
	/** The group's display image */
	imageUrl?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** Organization CKAN type */
export interface Organization{
	/** A long-form description of the organization */
	description: string;
	/** The organization's ID (usually a UUID) */
	id: string;
	/** Is the organization an organization? (Almost always true) */
	isOrganization: boolean;
	/** The organization's short name, often not human-readable */
	name: string;
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
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** Processed CKAN package type */
export interface Package{
	/** The package's author */
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
	/** The identification of the package */
	id: string;
	/** A list of languages the package is available in */
	languages: string[];
	/** The license under which the resource was released */
	license: {
		id?: string;
		title?: string;
		url?: string;
	};
	/** The package's maintainer */
	maintainer: {
		name?: string;
		email?: string;
	};
	/** Meta-metadata */
	metadata: Metadata;
	/** The package's name, often not human-readable. */
	name: string;
	/** Information about the publishing organisation */
	organization?: Organization;
	/** Resources for the given package. */
	resources: Resource[];
	/** The object's relationships */
	relationships: {
		subject?: any[];
		object?: any[];
	};
	/** The package's tags */
	tags: Tag[];
	/** The package's title, human-readable */
	title: string;
	/** The package's permanent URL */
	url: string;
	/** When the package was first issued */
	created?: Date;
	/** When the package was last modified */
	modified?: Date;
	/** Notes the publisher has released about the package */
	notes?: string;
	/** Is the package open */
	open?: boolean;
	/** Is the package private? */
	private?: boolean;
	/** What is the package's state */
	state?: string;
	/** What type of package is it (usually, but not always "dataset") */
	type?: string;
	/** The package's current version number */
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
	/** The package the resource belongs to */
	package: {
		/** The package's ID */
		id?: string;
		/** The resource's position within the package */
		position?: number;
	};
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
	/** What state is the tag in */
	state?: string;
	/** The tag's vocabulary ID */
	vocabularyId?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
}

/////// Raw output types

/** Raw extras type */
export interface RawExtra{
	key: string;
	value: any;
};

/** Raw group type */
export interface RawGroup{
	description?: string;
	display_name?: string;
	id: string;
	name?: string;
	title?: string;
	image_display_url?: string;
	[key: string]: any;
};

/** Raw organization CKAN type */
export interface RawOrganization{
	id: string;
	approval_status?: string;
	created?: string;
	description?: string;
	image_url?: string;
	is_organization?: boolean;
	name?: string;
	state?: string;
	title?: string;
	type?: string;
	[key: string]: any;
};

/** Raw CKAN package type for processing */
export interface RawPackage{
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
}

/////// Miscellaneous types nested in responses

export interface Metadata{
	created?: Date;
	modified?: Date;
	language?: string;
};


export interface StringIndexedObject{
	[key: string]: any;
};