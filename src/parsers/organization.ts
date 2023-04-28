import type {RawOrganization, Organization} from "../types";

import parseDate from "./date";
import parseExtras from "./extras";
import parseUser from "./user";

/**
 * Processes an organization into consistent, parsed outputs.
 * @private
 * @param {RawOrganization} [organization]
 * @returns {Organization}
 */
export default function parseOrganization(organization: RawOrganization): Organization{
	const {
		approval_status, created, dataset_count, description, display_name, extras, id, image_url,
		is_organization, name, num_followers, package_count, state, title, type, users,
		...rest
	} = organization;
	return {
		approvalStatus: approval_status,
		created: parseDate(created),
		description: description ?? "",
		displayName: display_name,
		id,
		imageUrl: image_url,
		isOrganization: is_organization ?? true,
		name: name ?? "",
		state,
		stats: {
			datasets: dataset_count,
			followers: num_followers,
			packages: package_count
		},
		title: title ?? "",
		type,
		users: users ? users.map(x => parseUser(x)) : [],
		additionalData: {...rest, ...parseExtras(extras)}
	};
}