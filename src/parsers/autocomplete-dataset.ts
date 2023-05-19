/** Autocomplete dataset type */
export interface AutocompleteDataset{
	name: string;
	title: string;
	match?: {
		field?: string;
		displayed?: string;
	};
};

/** Raw autocomplete dataset type */
export interface RawAutocompleteDataset{
	match_field?: string;
	match_displayed?: string;
	name: string;
	title: string;
};

export default function parseAutocompleteDataset(dataset: RawAutocompleteDataset): AutocompleteDataset{
	const {match_field, match_displayed, name, title} = dataset;
	return {
		name,
		title,
		match: {
			field: match_field,
			displayed: match_displayed
		}
	};
}