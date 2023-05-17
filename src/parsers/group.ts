import type {RawGroup, Group} from "../types";

import parseUser from "./user";
import parseExtras from "./extras";
import parseDate from "./date";

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