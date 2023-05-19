import parseDate from "./date";

import type {StringIndexedObject} from "../types";

/** User type */
export interface User{
	/** The user's display name */
	displayName: string;
	/** The user's id */
	id: string;
	/** The user's rights */
	rights: {
		role?: string;
		sysadmin?: boolean;
	};
	/** The user's statistics */
	stats: {
		edits?: number;
		datasets?: number;
	};
	/** When the user account was created */
	created?: Date;
	/** The user's full name */
	fullName?: string;
	/** The user's openid */
	openid?: string;
	/** The user's status */
	state?: string;
	/** Non-standard additional data provided by the API. */
	additionalData: StringIndexedObject;
};

/** Raw user type */
export interface RawUser{
	activity_streams_email_notifications?: boolean;
	about?: string;
	capacity?: string;
	display_name?: string;
	fullname?: string;
	email_hash?: string;
	id: string;
	number_created_packages?: number;
	number_of_edits?: number;
	openid?: string;
	state?: string;
	sysadmin?: boolean;
	[key:string]: any;
};

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