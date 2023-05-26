import parseDate from "./date.js";
import parseExtras from "./extras.js";
import parseGroup, {Group, RawGroup} from "./group.js";
import parseLanguages from "./languages.js";
import parseOrganization, {Organization, RawOrganization} from "./organization.js";
import parseResource, {Resource, RawResource} from "./resource.js";
import parseTag, {Tag, RawTag} from "./tag.js";
import type {StringIndexedObject, Metadata} from "../types.js";

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
	relationships_as_subject?: any[];
	relationships_as_object?: any[];
	tags?: RawTag[];
	[key:string]: any;
};

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