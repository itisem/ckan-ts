/** Autocomplete user result type */
export interface AutocompleteUser{
	id: string;
	name: string;
	fullName?: string;
};

export interface RawAutocompleteUser{
	id: string;
	name: string;
	full_name?: string;
};

export default function autocompleteUser(user: RawAutocompleteUser): AutocompleteUser{
	const {id, name, full_name} = user;
	return {id, name, fullName: full_name};
}