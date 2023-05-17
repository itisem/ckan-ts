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