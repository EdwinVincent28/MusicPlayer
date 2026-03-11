// cypress/e2e/playlist-flow.cy.js

let createdPlaylistId = null;

describe("Playlist Flow (real APIs)", () => {

  beforeEach(() => {
    cy.request({
      method: "POST",
      url: "/api/public/login",
      body: { email: "cypress@gmail.com", password: "cypress" },
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.wrap(response.body.token).as("token");
    });
  });

  const visitWithToken = (path) => {
    cy.get("@token").then((token) => {
      cy.visit(path, {
        onBeforeLoad(win) {
          win.localStorage.setItem("token", token);
        },
      });
    });
    cy.wait(800);
  };

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  it("1 — navigates to Playlists page from the sidebar", () => {
    visitWithToken("/home");

    cy.get('[data-testid="nav-playlists"]', { timeout: 8000 })
      .should("be.visible")
      .click();
    cy.wait(600);

    cy.url().should("include", "/playlist");
  });

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  it("2 — creates a new playlist", () => {
    visitWithToken("/playlist");

    cy.get('[data-testid="new-playlist-btn"]', { timeout: 8000 })
      .should("be.visible")
      .click();
    cy.wait(500);

    // Scope to the modal specifically — not the empty-state button
    cy.get('.fixed.inset-0').within(() => {
      cy.contains("Create Playlist").should("be.visible");
    });

    cy.get('[data-testid="playlist-name-input"]').type("Cypress Playlist", { delay: 60 });
    cy.wait(400);

    // 👇 CHANGED: Using the specific testid to avoid clicking the background empty-state button
    cy.get('[data-testid="submit-playlist-btn"]').click({ force: true });

    // Wait for the modal overlay to disappear
    cy.get('.fixed.inset-0').should("not.exist");
    cy.wait(600);

    // Card should appear in the grid
    cy.get('[data-testid^="playlist-card-"]', { timeout: 10000 })
      .last()
      .should("be.visible")
      .then(($card) => {
        createdPlaylistId = $card.attr("data-testid").replace("playlist-card-", "");
        cy.log("Created playlist ID:", createdPlaylistId);
      });
  });

  // ── Step 3 ─────────────────────────────────────────────────────────────────
  it("3 — navigates back to Home from the sidebar", () => {
    visitWithToken("/playlist");

    cy.get('[data-testid="nav-home"]', { timeout: 8000 })
      .should("be.visible")
      .click();

    cy.url({ timeout: 8000 }).should("include", "/home");
  });

  // ── Step 4 ─────────────────────────────────────────────────────────────────
  it("4 — adds first 3 trending songs to the playlist", () => {
    visitWithToken("/home");

    cy.get('[data-testid^="trending-menu-btn-"]', { timeout: 12000 })
      .should("have.length.gte", 3);
    cy.wait(500);

    const addSongAtRow = (rowIndex) => {
      cy.get('[data-testid^="trending-menu-btn-"]')
        .eq(rowIndex)
        .click({ force: true });
      cy.wait(600);

      cy.get(`[data-testid="add-to-playlist-${createdPlaylistId}"]`, { timeout: 6000 })
        .should("be.visible")
        .click();
      cy.wait(800);

      cy.contains("Song added to playlist").should("be.visible");
      cy.wait(1600);
    };

    addSongAtRow(0);
    addSongAtRow(1);
    addSongAtRow(2);
  });

  // ── Step 5 ─────────────────────────────────────────────────────────────────
  it("5 — opens the created playlist", () => {
    visitWithToken("/playlist");

    cy.get(`[data-testid="playlist-card-${createdPlaylistId}"]`, { timeout: 8000 })
      .should("be.visible")
      .click();
    cy.wait(800);

    cy.url().should("include", `/playlist/${createdPlaylistId}`);
    cy.contains("3 songs").should("be.visible");
  });

  // ── Step 6 ─────────────────────────────────────────────────────────────────
    it("6 — clicks Play All and music player appears", () => {
        visitWithToken(`/playlist/${createdPlaylistId}`);

        // 👇 Tell Cypress to explicitly wait until the API has loaded the songs 
        // and the button is no longer disabled
        cy.get('[data-testid="play-all-btn"]', { timeout: 10000 })
        .should("not.be.disabled")
        .click();
        
        cy.wait(600);

        cy.get('[data-testid="music-player"]').should("be.visible");
    });

  // ── Step 7 ─────────────────────────────────────────────────────────────────
  it("7 — removes the first song from the playlist", () => {
    visitWithToken(`/playlist/${createdPlaylistId}`);

    cy.get('[data-testid^="remove-song-btn-"]', { timeout: 8000 })
      .first()
      .click({ force: true });
    cy.wait(600);

    cy.contains("Song removed from playlist").should("be.visible");
    cy.contains("2 songs").should("be.visible");
  });

  // ── Step 8 ─────────────────────────────────────────────────────────────────
  it("8 — deletes the playlist", () => {
    visitWithToken("/playlist");

    cy.get(`[data-testid="playlist-card-${createdPlaylistId}"]`, { timeout: 8000 })
      .trigger("mouseover");
    cy.wait(400);

    cy.get(`[data-testid="playlist-card-${createdPlaylistId}"]`)
      .find("button")
      .last()
      .click({ force: true });
    cy.wait(600);

    cy.get(`[data-testid="playlist-card-${createdPlaylistId}"]`)
      .should("not.exist");
  });

});