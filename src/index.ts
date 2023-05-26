// exporting the ckan module as the default
import CKAN from "./ckan.js";
export default CKAN;

// exporting response types
export type {AutocompleteDataset} from "./parsers/autocomplete-dataset.js";
export type {AutocompleteGroup} from "./ckan.js";
export type {AutocompleteUser} from "./parsers/autocomplete-user.js";
export type {Dataset} from "./parsers/dataset.js";
export type {Group} from "./parsers/group.js";
export type {License} from "./parsers/license.js";
export type {Metadata, StringIndexedObject} from "./types.js";
export type {Organization} from "./parsers/organization.js";
export type {Resource} from "./parsers/resource.js";
export type {Tag} from "./parsers/tag.js";
export type {User} from "./parsers/user.js";
export type {Vocabulary} from "./parsers/vocabulary.js";

// exporting options types
export type {Settings} from "./ckan.js";
export type {
	AllowedMethods, GroupOptions, LimitOptions, SortOptions, TagOptions, UserOptions,
	SingleGroupOptions, BaseSortOptions, DatasetSearchOptions,
} from "./types.js";