import parseDate from "./date";
import parseExtras from "./extras";
import parseUser, {User, RawUser} from "./user";
import type {StringIndexedObject} from "../types";

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

/**
 * Processes an organization into consistent, parsed outputs.
 * @private
 * @param {RawOrganization} [organization]
 * @returns {Organization}
 */
export default function parseOrganization(organization: RawOrganization): Organization{
	const {
		approval_status, created, dataset_count, description, display_name, extras, id, image_display_url, image_url,
		is_organization, name, num_followers, package_count, state, title, type, users,
		...rest
	} = organization;
	return {
		approvalStatus: approval_status,
		created: parseDate(created),
		description: description ?? "",
		displayName: display_name,
		id,
		imageUrl: image_display_url ?? image_url,
		isOrganization: is_organization ?? true,
		name: name ?? "",
		state,
		stats: {
			// the vocabulary across the api is inconsistent
			datasets: dataset_count ?? package_count,
			followers: num_followers,
		},
		title: title ?? "",
		type,
		users: users ? users.map(x => parseUser(x)) : [],
		additionalData: {...rest, ...parseExtras(extras)}
	};
}