import type {RawResource, Resource} from "../types";

import parseDate from "./date";
import parseLanguages from "./languages";

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