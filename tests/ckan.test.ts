import CKAN from "../src/ckan";

describe("setup", () => {
	it("handles url variability correctly", () => {
		const ckan1 = new CKAN("https://demo.ckan.org/api/3/action");
		expect(ckan1.baseUrl).toBe("https://demo.ckan.org/api/3/action/");
		ckan1.baseUrl = "https://data.overheid.nl/data/api/3/";
		expect(ckan1.baseUrl).toBe("https://data.overheid.nl/data/api/3/action/");
		ckan1.baseUrl = "https://demo.ckan.org/api";
		expect(ckan1.baseUrl).toBe("https://demo.ckan.org/api/3/action/");
		ckan1.baseUrl = "https://data.overheid.nl/data";
		expect(ckan1.baseUrl).toBe("https://data.overheid.nl/data/api/3/action/");
		ckan1.baseUrl = "https://demo.ckan.org/api/3/action/";
		expect(ckan1.baseUrl).toBe("https://demo.ckan.org/api/3/action/");
		const ckan2 = new CKAN("https://example.org/api/", {skipEndpointCorrection: true});
		expect(ckan2.baseUrl).toBe("https://example.org/api/");
	});
});

describe("endpoints work as intended", () => {
	const ckan = new CKAN("https://demo.ckan.org/api/3/action");
	test("can read site activity", async () => {
		const isActive = ckan.siteRead();
		expect(isActive).resolves.toBe(true);
	});
	test("can get package lists", async () => {
		const baseDetails = await ckan.getPackageList();
		expect(Array.isArray(baseDetails)).toBe(true);
		expect(baseDetails.every(x => typeof x === "string"));
	})
});