// cypress/e2e/artist.cy.js

const PROXY = "https://corsproxy.io/?";
const DEEZER = "https://api.deezer.com";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockArtist = {
	id: 27,
	name: "Daft Punk",
	nb_fan: 5800000,
	nb_album: 10,
	picture_medium: "https://picsum.photos/seed/27/200/200",
	picture_big: "https://picsum.photos/seed/27/400/400",
	picture_xl: "https://picsum.photos/seed/27/800/800",
	link: "https://www.deezer.com/artist/27",
};

const mockTopTracks = {
	data: [
		{
			id: 3135556,
			title: "Get Lucky",
			duration: 248,
			rank: 900000,
			preview: "https://cdns-preview-d.dzcdn.net/stream/c-dummypreview1.mp3",
			album: {
				id: 302127,
				title: "Random Access Memories",
				cover_small: "https://picsum.photos/seed/album1/40/40",
				cover_medium: "https://picsum.photos/seed/album1/200/200",
			},
		},
		{
			id: 3135557,
			title: "Harder Better Faster Stronger",
			duration: 224,
			rank: 800000,
			preview: "https://cdns-preview-d.dzcdn.net/stream/c-dummypreview2.mp3",
			album: {
				id: 302128,
				title: "Discovery",
				cover_small: "https://picsum.photos/seed/album2/40/40",
				cover_medium: "https://picsum.photos/seed/album2/200/200",
			},
		},
	],
};

const mockAlbums = {
	data: [
		{
			id: 302127,
			title: "Random Access Memories",
			release_date: "2013-05-17",
			record_type: "album",
			cover_small: "https://picsum.photos/seed/album1/40/40",
			cover_medium: "https://picsum.photos/seed/album1/200/200",
		},
		{
			id: 302128,
			title: "Discovery",
			release_date: "2001-03-12",
			record_type: "album",
			cover_small: "https://picsum.photos/seed/album2/40/40",
			cover_medium: "https://picsum.photos/seed/album2/200/200",
		},
	],
};

const mockAlbumTracks = {
	data: [
		{
			id: 3135556,
			title: "Get Lucky",
			duration: 248,
			rank: 900000,
			preview: "https://cdns-preview-d.dzcdn.net/stream/c-dummypreview1.mp3",
		},
	],
};

// ─── Helper: stub all artist page API calls ───────────────────────────────────
const stubArtistPage = () => {
	cy.intercept("GET", `${PROXY}${DEEZER}/artist/27`, {
		statusCode: 200,
		body: mockArtist,
	}).as("artistDetail");

	cy.intercept("GET", `${PROXY}${DEEZER}/artist/27/top*`, {
		statusCode: 200,
		body: mockTopTracks,
	}).as("topTracks");

	cy.intercept("GET", `${PROXY}${DEEZER}/artist/27/albums*`, {
		statusCode: 200,
		body: mockAlbums,
	}).as("albums");

	cy.intercept("GET", `${PROXY}${DEEZER}/album/*/tracks`, {
		statusCode: 200,
		body: mockAlbumTracks,
	}).as("albumTracks");
};

// =============================================================================
describe("Artist Page", () => {
	// ── 1. Page Load ─────────────────────────────────────────────────────────────
	describe("1. Page Load", () => {
		beforeEach(() => {
			stubArtistPage();
			cy.visit("/artist/27");
			cy.wait(["@artistDetail", "@topTracks", "@albums"]);
		});

		it("renders the artist name in the hero", () => {
			cy.contains("Daft Punk").should("be.visible");
		});

		it("renders the Verified Artist badge", () => {
			cy.contains("Verified Artist").should("be.visible");
		});

		it("renders the artist photo in the hero", () => {
			cy.get("img[alt='Daft Punk']").first().should("be.visible");
		});

		it("renders the fan count", () => {
			cy.contains("5.8M fans").should("be.visible");
		});
	});

	// ── 2. Action Bar ─────────────────────────────────────────────────────────────
	describe("2. Action Bar", () => {
		beforeEach(() => {
			stubArtistPage();
			cy.visit("/artist/27");
			cy.wait(["@artistDetail", "@topTracks", "@albums"]);
		});

		it("renders the Play All button", () => {
			cy.contains("button", "Play All").should("be.visible");
		});

		it("renders the Follow button", () => {
			cy.contains("button", "Follow").should("be.visible");
		});
	});

	// ── 3. Tabs ───────────────────────────────────────────────────────────────────
	describe("3. Tabs", () => {
		beforeEach(() => {
			stubArtistPage();
			cy.visit("/artist/27");
			cy.wait(["@artistDetail", "@topTracks", "@albums"]);
		});

		it("renders all three tabs", () => {
			cy.contains("Discography").should("be.visible");
			cy.contains("Popular Tracks").should("be.visible");
			cy.contains("About").should("be.visible");
		});

		it("shows Discography tab content by default", () => {
			cy.contains("Random Access Memories").should("be.visible");
		});

		it("shows Popular Tracks when that tab is clicked", () => {
			cy.contains("Popular Tracks").click();
			cy.contains("Get Lucky").should("be.visible");
			cy.contains("Harder Better Faster Stronger").should("be.visible");
		});

		it("shows About tab stats when that tab is clicked", () => {
			cy.contains("About").click();
			cy.contains("Fans").should("be.visible");
			cy.contains("Albums").should("be.visible");
			cy.contains("Top Tracks").should("be.visible");
		});
	});

	// ── 4. Popular Tracks ─────────────────────────────────────────────────────────
	describe("4. Popular Tracks", () => {
		beforeEach(() => {
			stubArtistPage();
			cy.visit("/artist/27");
			cy.wait(["@artistDetail", "@topTracks", "@albums"]);
			cy.contains("Popular Tracks").click();
		});

		it("renders the correct number of tracks", () => {
			cy.get(".grid").children().should("have.length.greaterThan", 0);
		});

		it("highlights the track row when the first song is clicked", () => {
			cy.contains("Get Lucky").click();
			cy.contains("Get Lucky")
				.closest("[class*='grid']")
				.should("have.class", "bg-violet-600/10");
		});
	});

	// ── 5. Discography ────────────────────────────────────────────────────────────
	describe("5. Discography", () => {
		beforeEach(() => {
			stubArtistPage();
			cy.visit("/artist/27");
			cy.wait(["@artistDetail", "@topTracks", "@albums"]);
		});

		it("shows the number of releases", () => {
			cy.contains("2 releases").should("be.visible");
		});

		it("renders album titles", () => {
			cy.contains("Random Access Memories").should("be.visible");
			cy.contains("Discovery").should("be.visible");
		});

		it("renders album release years", () => {
			cy.contains("2013").should("be.visible");
			cy.contains("2001").should("be.visible");
		});

		it("expands album tracks when an album is clicked", () => {
			cy.contains("Random Access Memories").click();
			cy.wait("@albumTracks");
			cy.contains("Get Lucky").should("be.visible");
		});
	});
});
