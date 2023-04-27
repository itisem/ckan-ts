import type {RawTag, Tag} from "../types";

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