import type {RawDataset, Dataset} from "../types";

import parseDate from "./date";
import parseExtras from "./extras";
import parseGroup from "./group";
import parseLanguages from "./languages";
import parseOrganization from "./organization";
import parseResource from "./resource";
import parseTag from "./tag";

/**
 * Processes a dataset into consistent, parsed outputs.
 * @param {RawDataset} ckanDataset
 * @returns {Dataset}
 */
export default function parseDataset(ckanDataset: RawDataset): Dataset{
	const {
			author, author_email, issued, creator_user_id, groups, id, language,
			license_id, license_title, license_url, maintainer, maintainer_email,
			modified, metadata_created, metadata_modified, metadata_language,
			name, notes, isopen, organization, resources,
			relationships_as_object, relationships_as_subject, state,
			tags, title, type, url, version,
			extras, ...rest
		} = ckanDataset;
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
			created: parseDate(issued),
			creator: {
				id: creator_user_id
			},
			groups: groups ? groups.map(x => parseGroup(x)) : [],
			id,
			languages: parseLanguages(language),
			license: {
				id: license_id,
				title: license_title,
				url: license_url
			},
			maintainer: {
				name: maintainer,
				email: maintainer_email
			},
			modified: parseDate(modified),
			metadata: {
				created: parseDate(metadata_created),
				modified: parseDate(metadata_modified),
				language: metadata_language
			},
			name,
			notes,
			open: isopen,
			organization: parseOrganization(organization),
			private: isPrivate,
			resources: resources ? resources.map(x => parseResource(x)) : [],
			relationships:{
				subject: relationships_as_subject,
				object: relationships_as_object
			},
			state,
			tags: tags ? tags.map(x => parseTag(x)) : [],
			title,
			type,
			url,
			version,
			additionalData: {...rest, ...parseExtras(extras)}
		};
}