import parseDate from "./date.js";
import parseLanguages from "./languages.js";
import type {StringIndexedObject, Metadata} from "../types.js";

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

/** Processes a resource into consistent, parsed outputs.
 * @param {RawResource} resource
 * @returns {Resource}
 */
export default function parseResource(resource: RawResource): Resource{
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
			updated: parseDate(cache_last_updated)
		},
		created: parseDate(created),
		description,
		format,
		hash,
		id,
		languages: parseLanguages(language),
		metadata: {
			created: parseDate(metadata_created),
			modified: parseDate(metadata_modified),
			language: metadata_language
		},
		mimeType: {
			resource: mimetype,
			inner: mimetype_inner
		},
		modified: parseDate(last_modified),
		name: name ?? "",
		dataset: {
			id: package_id,
			position
		},
		size,
		state,
		url: url ?? "",
		additionalData: rest
	};
}