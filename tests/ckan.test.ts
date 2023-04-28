import CKAN from "../src/index";

const parser = new CKAN("https://demo.ckan.org/api/3/action");
const parserItaly = new CKAN("https://dati.gov.it/opendata/api/3/action");

// setup and settings tests

describe("setup", () => {
	test("handles url variability correctly", () => {
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

// parser tests: TODO



// endpoint tests

describe("dataset-related endpoints", () => {
	test("basic package lists", async () => {
		const results = await parser.datasets();
		expect(results.every(x => typeof x === "string")).toBe(true);
		expect(results).toEqual(["sample-dataset-1"]);
	});
	test("detailed package lists", async () => {
		const results = await parser.detailedDatasets();
		expect(results.some(x => typeof x === "string")).toBe(false);
		expect(results.length).toBe(1);
		expect(results[0]).toMatchObject({
			author: {
				name: "Test Author",
				email: "test@email.com"
			},
			license: {
				id: "cc-by",
				title: "Creative Commons Attribution",
				url: "http://www.opendefinition.org/licenses/cc-by"
			},
			metadata: {
				created: new Date("2021-04-09T11:39:37.657233"),
				modified: new Date("2022-05-20T09:20:43.998956")
			},
			name: "sample-dataset-1"
		});
	});
});

describe("group-related endpoints", () => {
	test("can basic groups", async () => {
		const results = await parser.groups();
		expect(results.every(x => typeof x === "string")).toBe(true);
		expect(results).toEqual(["my-group", "test-group"]);
	});
	test("can get detailed groups without additional information", async () => {
		const results = await parser.detailedGroups();
		expect(results.some(x => typeof x === "string")).toBe(false);
		expect(results[0].stats.datasets).toBeUndefined();
	});
	// sadly, including fields may not always yield defined results as full details may stay undefined when a method is not implemented
	// indeed, all the testing endpoints return no additional data in at least one situation
	// therefore, the correct parsing of those is largely left to the parser tests
	// only the italian endpoint seems to allow user viewing without authorisation
	test("can get groups with additional details", async () => {
		const userDetails = await parserItaly.detailedGroups({include: {users: true}});
		expect(Array.isArray(userDetails[0].users)).toBe(true);
	});
});

describe("license-related endpoints", () => {
	test("can get license lists", async () => {
		const results = await parser.licenses();
		expect(Array.isArray(results)).toBe(true);
		expect(results.length).toBe(16);
		expect(results[0]).toMatchObject({
			id: "notspecified",
			title: "License Not Specified",
			family: "",
			domain: {
				content: false,
				data: false,
				software: false
			}
		});
	});
})

describe("meta-api endpoints", () => {
	test("can read site activity", async () => {
		const isActive = parser.available();
		expect(isActive).resolves.toBe(true);
	});
});

describe("organization-related endpoints", () => {
	test("basic organization lists", async () => {
		const results = await parser.organizations();
		expect(results.every(x => typeof x === "string")).toBe(true);
		expect(results).toEqual(["city-of-london", "sample-organization", "test_organization"]);
	});
	test("full organization lists", async () => {
		const results = await parser.detailedOrganizations();
		expect(results.some(x => typeof x === "string")).toBe(false);
		expect(results[0].stats.datasets).toBeUndefined();
		// sadly, the process doesn't work the other way round as full details may stay end up being undefined when a method is not implemented
		// once again, the correct handling of such data is therefore left to the parser tests
	});
});

describe("tag-related endpoints", () => {
	test("basic tag lists", async () => {
		const results = await parser.tags();
		expect(results.every(x => typeof x === "string")).toBe(true);
		expect(results).toEqual(["csv", "economy", "geojson", "kml", "pdf", "sample", "txt", "wms"]);
	});
	test("detailed tag lists", async () => {
		const results = await parser.detailedTags();
		expect(results.some(x => typeof x === "string")).toBe(false);
	});
});

describe("user-related endpoints", () => {
	test("can get user lists", async () => {
		const results = await parserItaly.detailedUsers();
		expect(results.some(x => typeof x === "string")).toBe(false);
	}, 20000);
});

describe("malformed responses", () => {
	// the italian endpoint has a faulty implementation for all_fields=false, meaning that it will never be an array of strings
	test("errors on malformed response", () => {
		expect(parserItaly.users()).rejects.toThrow();
	}, 20000);
	// we are asking for a nonexistent field
	test("errors on malformed object response", () => {
		expect(parser.detailedGroups({expectedFields: ["groningen"]})).rejects.toThrow();
	});
})