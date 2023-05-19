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
	by: string;
	order?: "asc" | "desc";
};

/** Basic organization & group sort settings */
export interface SortOptions extends LimitOptions{
	sort?: BaseSortOptions | BaseSortOptions[] | string;
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

/** Settings for the dataset search */
export interface DatasetSearchOptions extends SortOptions{
	filterQuery?: string | string[];
	limit?: number;
	offset?: number;
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

/** Raw tag type */
export interface RawTag{
	display_name?: string;
	id: string;
	name?: string;
	state?: string;
	vocabulary_id?: string;
	[key: string]: any;
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