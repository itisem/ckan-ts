// exporting the ckan module as the default
import CKAN from "./ckan";
export default CKAN;

// exporting response types
export type {AutocompleteDataset} from "@/parsers/autocomplete-dataset";
export type {AutocompleteGroup} from "@/ckan";
export type {AutocompleteUser} from "@/parsers/autocomplete-user";
export type {Dataset} from "@/parsers/dataset";
export type {Group} from "@/parsers/group";
export type {License} from "@/parsers/license";
export type {Metadata, StringIndexedObject} from "@/types";
export type {Organization} from "@/parsers/organization";
export type {Resource} from "@/parsers/resource";
export type {Tag} from "@/parsers/tag";
export type {User} from "@/parsers/user";
export type {Vocabulary} from "@/parsers/vocabulary";
export type {RawSearchResult} from "@/parsers/search";

// exporting options types
export type {Settings} from "@/ckan";
export type {
	AllowedMethods, GroupOptions, LimitOptions, SortOptions, TagOptions, UserOptions,
	SingleGroupOptions, BaseSortOptions, DatasetSearchOptions,
} from "@/types";