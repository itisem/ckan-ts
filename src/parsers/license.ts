import type {RawLicense, License} from "../types";
/** Processes a raw license
 * @private
 * @param {RawLicense} license
 * @returns {License}
 */
export default function parseLicense(license: RawLicense): License{
	const {
		is_okd_compliant, is_osi_compliant, od_conformance, osd_conformance,
		domain_content, domain_data, domain_software, family, is_generic, id, status, title, url,
		...rest
	} = license;
	return {
		compliance: {
			okd: is_okd_compliant,
			osi: is_osi_compliant
		},
		conformance: {
			od: od_conformance,
			osd: osd_conformance
		},
		domain: {
			content: domain_content,
			data: domain_data,
			software: domain_software
		},
		family,
		generic: is_generic,
		id,
		status,
		title: title ?? "",
		url,
		additionalData: rest
	};
}