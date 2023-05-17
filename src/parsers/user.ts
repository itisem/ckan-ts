import type {RawUser, User} from "../types";

import parseDate from "./date";

/** Processes a user from raw data to parsed data
 * @param {RawUser} user
 * @returns {User}
 */
export default function parseUser(user: RawUser): User{
	const {
		display_name, id, capacity, sysadmin, number_of_edits, number_created_packages,
		created, fullname, openid, state, ...rest
	} = user;
	return {
		displayName: display_name ?? "",
		id,
		rights: {
			role: capacity,
			sysadmin
		},
		stats: {
			edits: number_of_edits,
			datasets: number_created_packages
		},
		created: parseDate(created),
		fullName: fullname,
		openid,
		state,
		additionalData: rest
	};
}