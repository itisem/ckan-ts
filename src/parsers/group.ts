import type {RawGroup, Group} from "../types";

import parseUser from "./user";
import parseExtras from "./extras";

/** Parses a group
 * @param {RawGroup} group
 * @returns {Group}
 */
export default function parseGroup(group: RawGroup): Group{
	const {
		approval_status, created, dataset_count, description, display_name, extras,
		groups, id, image_display_url, is_organization, name, num_followers,
		package_count, state, title, type, users, ...rest
	} = group;
	delete rest.image_url;
	return {
		approvalStatus: approval_status,
		description: description ?? "",
		displayName: display_name,
		id,
		imageUrl: image_display_url,
		groups,
		name: name ?? "",
		organization: is_organization,
		state,
		stats: {
			datasets: dataset_count,
			followers: num_followers,
			packages: package_count
		},
		type,
		title: title ?? "",
		users: users ? users.map(x => parseUser(x)) : [],
		additionalData: {...rest, ...parseExtras(extras)}
	};
}