import parseDate from "@/parsers/date";
import parseExtras from "@/parsers/extras";
import parseUser, {User, RawUser} from "@/parsers/user";
import type {StringIndexedObject} from "@/types";


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

/** Parses a group
 * @param {RawGroup} group
 * @returns {Group}
 */
export default function parseGroup(group: RawGroup): Group{
	const {
		approval_status, created, dataset_count, description, display_name, extras,
		groups, id, image_display_url, image_url, is_organization, name, num_followers,
		package_count, state, title, type, users, ...rest
	} = group;
	delete rest.image_url;
	return {
		approvalStatus: approval_status,
		created: parseDate(created),
		description: description ?? "",
		displayName: display_name,
		id,
		imageUrl: image_display_url ?? image_url,
		groups,
		name: name ?? "",
		organization: is_organization,
		state,
		stats: {
			// the vocabulary across the api is inconsistent
			datasets: dataset_count ?? package_count,
			followers: num_followers
		},
		type,
		title: title ?? "",
		users: users ? users.map(x => parseUser(x)) : [],
		additionalData: {...rest, ...parseExtras(extras)}
	};
}