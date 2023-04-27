import CKAN from "../src/index";

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
	const parser = new CKAN("https://demo.ckan.org/api/3/action");
	test("can read site activity", async () => {
		const isActive = parser.available();
		expect(isActive).resolves.toBe(true);
	});
	test("can get license lists", async () => {
		const baseDetails = await parser.licenses();
		expect(Array.isArray(baseDetails)).toBe(true);
	});
	test("can get group lists", async () => {
		const baseDetails = await parser.groups();
		expect(baseDetails.every(x => typeof x === "string"));
		const someDetails = await parser.detailedGroups();
		expect(Array.isArray(someDetails)).toBe(true);
		expect(someDetails[0].stats.datasets).toBeUndefined();
		// sadly, the process doesn't work the other way round as full details may stay end up being undefined when a method is not implemented
	});
	test("can get package lists", async () => {
		const baseDetails = await parser.datasets();
		expect(baseDetails.every(x => typeof x === "string"));
		const fullDetails = await parser.detailedDatasets();
		expect(Array.isArray(fullDetails)).toBe(true);
	});
	test("can get tag lists", async () => {
		const baseDetails = await parser.tags();
		expect(baseDetails.every(x => typeof x === "string"));
		const fullDetails = await parser.detailedTags();
		expect(Array.isArray(fullDetails)).toBe(true);
	});
});