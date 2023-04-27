/** Processes a date
 * @private
 * @param {string} [date]
 * @returns {Date|undefined}
 */
export default function parseDate(date?: string){
	return date ? new Date(date) : undefined;
}