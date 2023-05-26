import type {StringIndexedObject} from "../types.js";

/** Tag type */
export interface Tag{
	/** The tag's full, human-readable display name */
	displayName: string;
	/** The tag's id (usually a UUID) */
	id: string;
	/** The tag's short name, often not human-readable */
	name: string;
	/** What status is the tag in */
	state?: string;
	/** The tag's vocabulary ID */
	vocabularyId?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
};

/** Raw tag type */
export interface RawTag{
	display_name?: string;
	id: string;
	name?: string;
	state?: string;
	vocabulary_id?: string;
	[key: string]: any;
};

/** Processes a tag
 * @private
 * @param {RawTag} tag
 * @returns {Tag}
 */
export default function parseTag(tag: RawTag): Tag{
	const {id, name, display_name, state, vocabulary_id, ...rest} = tag;
	return {
		displayName: display_name ?? "",
		id,
		name: name ?? "",
		state,
		vocabularyId: vocabulary_id,
		additionalData: rest
	};
}