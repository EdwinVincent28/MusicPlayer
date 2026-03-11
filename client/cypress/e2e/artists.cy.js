// cypress/e2e/artists.cy.js

const PROXY = "https://corsproxy.io/?";
const DEEZER = "https://api.deezer.com";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const FEATURED_IDS = [
	27, 13, 384236, 1118489, 246791, 75798, 9635624, 4050205, 7706891, 1424602,
	564, 1032, 3928, 145, 43,
];

const mockFeaturedArtists = FEATURED_IDS.map((id) => ({
	id,
	name: `Artist ${id}`,
	nb_fan: 1200000,
	picture_medium: `https://picsum.photos/seed/${id}/200/200`,
	picture_big: `https://picsum.photos/seed/${id}/400/400`,
	picture_xl: `https://picsum.photos/seed/${id}/800/800`,
}));

const mockSearchResults = {
	data: [
		{
			id: 27,
			name: "Daft Punk",
			nb_fan: 5800000,
			picture_medium: "https://picsum.photos/seed/27/200/200",
			picture_big: "https://picsum.photos/seed/27/400/400",
			picture_xl: "https://picsum.photos/seed/27/800/800",
		},
		{
			id: 9999,
			name: "Daft Punk Tribute",
			nb_fan: 50000,
			picture_medium: "https://picsum.photos/seed/9999/200/200",
			picture_big: "https://picsum.photos/seed/9999/400/400",
			picture_xl: "https://picsum.photos/seed/9999/800/800",
		},
	],
};

// ─── Helper: stub all featured artist API calls ───────────────────────────────
const stubFeaturedArtists = () => {
	FEATURED_IDS.forEach((id) => {
		cy.intercept("GET", `${PROXY}${DEEZER}/artist/${id}*`, {
			statusCode: 200,
			body: mockFeaturedArtists.find((a) => a.id === id),
		}).as(`featured_${id}`);
	});
};

// =============================================================================
describe("Artists Page", () => {
	// ── 1. Page Load ─────────────────────────────────────────────────────────────
	describe("1. Page Load", () => {
		beforeEach(() => {
			stubFeaturedArtists();
			cy.visit("/artists");
		});

		it("renders the Artists heading", () => {
			cy.contains("Artists").should("be.visible");
		});

		it("renders the 'Featured & popular artists' subtitle", () => {
			cy.contains("Featured & popular artists").should("be.visible");
		});

		it("renders the search input", () => {
			cy.get('input[placeholder="Search artists..."]').should("be.visible");
		});

		it("shows skeleton loaders before data arrives", () => {
			// Re-visit with delayed responses so skeletons are visible
			FEATURED_IDS.forEach((id) => {
				cy.intercept("GET", `${PROXY}${DEEZER}/artist/${id}*`, (req) => {
					req.reply({
						delay: 2000,
						body: mockFeaturedArtists.find((a) => a.id === id),
					});
				});
			});
			cy.visit("/artists");
			cy.get(".animate-pulse").should("have.length.greaterThan", 0);
		});
	});

	// ── 2. Featured Artists ───────────────────────────────────────────────────────
	describe("2. Featured Artists", () => {
		beforeEach(() => {
			stubFeaturedArtists();
			cy.visit("/artists");
			cy.wait("@featured_27");
		});

		it("shows the Featured Artists section label", () => {
			cy.contains("Featured Artists").should("be.visible");
		});

		it("renders artist cards in a grid", () => {
			cy.get(".grid .cursor-pointer").should("have.length.greaterThan", 0);
		});

		it("displays the artist name on each card", () => {
			cy.contains("Artist 27").should("be.visible");
		});

		it("displays fan count formatted in millions", () => {
			cy.contains("1.2M fans").should("exist");
		});

		it("renders an image on each card", () => {
			cy.get(".grid .cursor-pointer")
				.first()
				.find("img")
				.should("have.attr", "src")
				.and("not.be.empty");
		});
	});

	// ── 3. Search Artist ──────────────────────────────────────────────────────────
	describe("3. Search Artist", () => {
		beforeEach(() => {
			stubFeaturedArtists();
			cy.intercept("GET", `${PROXY}${DEEZER}/search/artist*q=Daft*`, {
				statusCode: 200,
				body: mockSearchResults,
			}).as("searchArtists");
			cy.visit("/artists");
		});

		it("shows search results after typing a query", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft Punk");
			cy.wait("@searchArtists");
			cy.contains("Daft Punk").should("be.visible");
		});

		it("updates the subtitle with the result count and query", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft Punk");
			cy.wait("@searchArtists");
			cy.contains(/results for "Daft Punk"/i).should("be.visible");
		});

		it("switches the section label to Search Results", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft Punk");
			cy.wait("@searchArtists");
			cy.contains("Search Results").should("be.visible");
			cy.contains("Featured Artists").should("not.exist");
		});

		it("shows the X clear button while a query is typed", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft");
			cy.get('input[placeholder="Search artists..."]')
				.siblings("button")
				.should("exist");
		});

		it("clears input and restores Featured Artists when X is clicked", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft Punk");
			cy.wait("@searchArtists");
			cy.get('input[placeholder="Search artists..."]')
				.siblings("button")
				.click();
			cy.get('input[placeholder="Search artists..."]').should("have.value", "");
			cy.contains("Featured Artists").should("be.visible");
		});

		it("shows 'No artists found' when the search returns empty", () => {
			cy.intercept("GET", `${PROXY}${DEEZER}/search/artist*q=xyznonexistent*`, {
				statusCode: 200,
				body: { data: [] },
			}).as("emptySearch");
			cy.get('input[placeholder="Search artists..."]').type("xyznonexistent");
			cy.wait("@emptySearch");
			cy.contains("No artists found").should("be.visible");
			cy.contains("Try a different name").should("be.visible");
		});
	});

	// ── 4. Click Artist → Redirect ────────────────────────────────────────────────
	describe("4. Click Artist and Verify Redirect", () => {
		beforeEach(() => {
			stubFeaturedArtists();
			cy.intercept("GET", `${PROXY}${DEEZER}/search/artist*q=Daft*`, {
				statusCode: 200,
				body: mockSearchResults,
			}).as("searchArtists");
			cy.visit("/artists");
		});

		it("navigates to /artist/:id when a search result card is clicked", () => {
			cy.get('input[placeholder="Search artists..."]').type("Daft Punk");
			cy.wait("@searchArtists");
			cy.get(".grid").children().first().click();
			cy.url().should("include", "/artist/27");
		});

		it("navigates to /artist/:id when a featured artist card is clicked", () => {
			cy.wait("@featured_27");
			cy.contains("Artist 27").click();
			cy.url().should("include", "/artist/27");
		});
	});
});
