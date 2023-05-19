import type {StringIndexedObject} from "../types";

/** Raw extras type */
export interface RawExtra{
	key: string;
	value: any;
};

/** Processes a raw extras field into a dictionary
 * @param {RawExtra[]} [extras]
 * @returns {StringIndexedObject}
 */
export default function parseExtras(extras?: RawExtra[]): StringIndexedObject{
	let obj = {};
	if(!extras) return obj;
	for(let extra of extras){
		obj[extra.key] = extra.value;
	}
	return obj;
}