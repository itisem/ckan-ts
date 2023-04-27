import type {RawOrganization, Organization} from "../types";

import parseDate from "./date";

/**
 * Processes an organization into consistent, parsed outputs.
 * @private
 * @param {RawOrganization} [organization]
 * @returns {Organization}
 */
export default function parseOrganization(organization: RawOrganization): Organization{
	const {
		approval_status, created, description, id, image_url,
		is_organization, name, state, title, type,
		...rest
	} = organization;
	return {
		approvalStatus: approval_status,
		created: parseDate(created),
		description: description ?? "",
		id,
		imageUrl: image_url,
		isOrganization: is_organization ?? true,
		name: name ?? "",
		state,
		title: title ?? "",
		type,
		additionalData: rest
	};
}