import type {StringIndexedObject} from "@/types";

/** License type */
export interface License{
	/** The license's compliance with other standards */
	compliance: {
		/** Is the license OKD compliant */
		okd?: boolean;
		/** Has the licence been approved by the Open Source Initiative */
		osi?: boolean;
	};
	/** The license's conformance with other standards */
	conformance: {
		/** Is the license conformant with the Open Definition */
		od?: string;
		/** Is the license conformant with the Open Source Definition */
		osd?: string;
	};
	/** The license's usage on the domain */
	domain: {
		content?: boolean;
		data?: boolean;
		software?: boolean;
	};
	/** The license's id */
	id: string;
	/** The license's human-readable title */
	title: string;
	/** Which family of licenses this license belongs to */
	family?: string;
	/** Is the license generic? */
	generic?: boolean;
	/** The license's status */
	status?: string;
	/** The license's URL */
	url?: string;
	/** Non-standard additional data provided by the API. */
	additionalData?: StringIndexedObject;
}

/** Raw License type */
export interface RawLicense{
	domain_content?: boolean;
	domain_data?: boolean;
	domain_software?: boolean;
	family?: string;
	id: string;
	is_generic?: boolean;
	maintainer?: string;
	od_conformace?: string;
	osd_conformance?: string;
	status?: string;
	title?: string;
	url?: string;
	is_okd_compliant?: boolean;
	is_osi_compliant?: boolean;
	[key: string]: any;
};

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