import parseTag, {Tag, RawTag} from "./tag.js";
import type {StringIndexedObject} from "../types.js";

/** Vocabulary type */
export interface Vocabulary{
	/** The vocabulary's id */
	id: string;
	/** The vocabulary's name */
	name: string;
	/** The tags associated with the vocabulary */
	tags: Tag[];
	/** Non-standard additional data provided by the API. */
	additionalData: StringIndexedObject;
};

/** Raw vocabulary type */
export interface RawVocabulary{
	id: string;
	name: string;
	tags: RawTag[];
	[key:string]: any;
};

export default function parseVocabulary(vocabulary: RawVocabulary): Vocabulary{
	const {id, name, tags, ...rest} = vocabulary;
	return {id, name, tags: tags.map(x => parseTag(x)), additionalData: rest};
}