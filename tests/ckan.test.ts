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

// helper method tests
describe("response assertions", () => {
	test("object arrays", () => {
		expect(() => parser.assertObjectArray([1, 2, 3])).toThrow(Error);
		expect(() => parser.assertObjectArray([{a: 1}], ["a", "b"])).toThrow(Error);
		expect(parser.assertObjectArray([])).toEqual([]);
		expect(parser.assertObjectArray([{a: 1, b: 2}], ["a", "b"])).toEqual([{a: 1, b: 2}]);
	});
	test("string arrays", () => {
		expect(() => parser.assertStringArray([1, 2, 3])).toThrow(Error);
		expect(parser.assertStringArray([])).toEqual([]);
		expect(parser.assertStringArray(["1", "2", "3"])).toEqual(["1", "2", "3"]);
	})
});


// endpoint tests

describe("autocomplete endpoints", () => {
	test("autocomplete package", async () => {
		const results = await parser.autocompleteDataset("sample");
		expect(results).toEqual([{
			name: "sample-dataset-1",
			title: "Sample Dataset",
			match: {field: "name", displayed: "sample-dataset-1"}
		}]);
	});
	test("autocomplete group", async () => {
		const results = await parser.autocompleteGroup("my");
		expect(results).toEqual([{
			id: "866b1d34-6414-4f6e-bcda-85e00c44fe42",
			name: "my-group",
			title: "My Group"
		}]);
	});
	test("autocomplete format", async () => {
		expect(await parser.autocompleteFormat("csv")).toEqual(["csv"]);
	});
	test("autocomplete tag", async () => {
		expect(await parser.autocompleteFormat("geo")).toEqual(["geojson"]);
	});
	test("autocomplete organization", async () => {
		expect(await parser.autocompleteOrganization("sample")).toEqual([{
			id: "1fa89238-ee96-4439-a885-22d15244d070",
			name: "sample-organization",
			title: "Sample Organization"
		}]);
	});
	test("autocomplete user", async() => {
		const results = await parserItaly.autocompleteUser("admin");
		expect(results[0]).toMatchObject({id: "b549687d-3768-4e8a-b3a9-f0f94d0b96d9", name: "ckanadmin"});
	});
});

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
});

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
		// sadly, the process doesn't work the other way round as full details may stay end up being undefined when a method is not implemented
		// once again, the correct handling of such data is therefore left to the parser tests
	});
	test("single organization", async() => {
		const results = await parser.organization("sample-organization");
		expect(results.title).toBe("Sample Organization");
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

// needs the italian parser for testing since the demo doesn't have vocabularies
describe("vocabulary-related endpoints", () => {
	test("can get vocabularies", async () => {
		const results = await parserItaly.vocabularies();
		expect(results.some(x => typeof x === "string")).toBe(false);
	});
	test("can get vocabulary", async () => {
		const results = await parserItaly.vocabulary("ae537949-d633-46c0-b41b-c9580aacd178");
		expect(results.id).toBe("ae537949-d633-46c0-b41b-c9580aacd178");
		expect(results.name).toBe("languages");
		const tags = results.tags.map(x => x.name);
		expect(tags.includes("ITA")).toBe(true);
	}, 20000);
})

describe("malformed responses", () => {
	// the italian endpoint has a faulty implementation for all_fields=false, meaning that it will never be an array of strings
	test("errors on malformed response", () => {
		expect(parserItaly.users()).rejects.toThrow();
	}, 20000);
});