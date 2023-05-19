/////// Miscellaneous types used in responses

export interface Metadata{
	created?: Date;
	modified?: Date;
	language?: string;
};


export interface StringIndexedObject{
	[key: string]: any;
};

/////// Settings types

/** Allowed HTTP request methods */
export type AllowedMethods = "GET" | "POST" | "PATCH" | "DELETE";

/** Expected field options */
export interface ExpectedFieldsOptions{
	expectedFields?: string[];
};

/** Group inclusion settings */
export interface GroupOptions extends SortOptions{
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
export interface OrganizationOptions extends SortOptions{
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