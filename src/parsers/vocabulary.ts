import type {Vocabulary, RawVocabulary} from "../types";

import parseTag from "./tag";

export default function parseVocabulary(vocabulary: RawVocabulary): Vocabulary{
	const {id, name, tags, ...rest} = vocabulary;
	return {id, name, tags: tags.map(x => parseTag(x)), additionalData: rest};
}