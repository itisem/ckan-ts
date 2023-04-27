/** Ensures that the language is an array at all times
 * @param {string | string[]} [language]
 * @returns {string[]}
 */
export default function parseLanguages(language?: string | string[]): string[]{
	return language ? (Array.isArray(language) ? language : [language]) : undefined;
}