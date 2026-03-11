describe("Search and play song and like it", () => {

  before(() => {
    // ── 1. Login with real credentials ──────────────────────────────────────
    cy.visit("/");
    cy.wait(600);

    cy.get('input[id="email"]').type("cypress@gmail.com", { delay: 60 });
    cy.wait(400);

    cy.get('input[id="password"]').type("cypress", { delay: 60 });
    cy.wait(400);

    cy.get('button[type="submit"]').click();
    cy.wait(800);

    cy.url().should("include", "/home");
    cy.wait(800);
  });

  it("searches for 'Am I Dreaming', plays the first result, and likes it", () => {

    // ── 2. Click the search bar ──────────────────────────────────────────────
    cy.get('input[placeholder="Search songs, artists..."]')
      .should("be.visible")
      .click();
    cy.wait(500);

    // ── 3. Type the song name ────────────────────────────────────────────────
    cy.get('input[placeholder="Search songs, artists..."]')
      .type("Am I Dreaming", { delay: 80 });
    cy.wait(700);

    // ── 4. Wait for real search results ─────────────────────────────────────
    cy.get(".absolute.top-12", { timeout: 10000 })
      .should("be.visible");
    cy.wait(500);

    // ── 5. Click the first result title ─────────────────────────────────────
    // Target the <p> tag with the track title text inside the dropdown
    cy.get(".absolute.top-12")
      .find("p.text-sm.text-white.font-medium")
      .first()
      .click();
    cy.wait(800);

    // ── 6. Music player appears ──────────────────────────────────────────────
    cy.get(".fixed.bottom-0.left-0.right-0", { timeout: 8000 })
      .should("be.visible");
    cy.wait(600);

    // ── 7. Click the like button (id="like-button") ──────────────────────────
    cy.get("#like-button")
      .should("be.visible")
      .click();
    cy.wait(600);

    // ── 8. Heart turns violet confirming the song is liked ───────────────────
    cy.get("#like-button")
      .should("have.class", "text-violet-400");
    cy.wait(400);
  });
});