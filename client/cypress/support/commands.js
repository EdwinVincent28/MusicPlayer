// Reusable login command
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/");
  cy.wait(500);

  cy.get('input[id="email"]').type(email, { delay: 60 });
  cy.wait(400);

  cy.get('input[id="password"]').type(password, { delay: 60 });
  cy.wait(400);

  cy.get('button[type="submit"]').click();
  cy.wait(500);
});

// Reusable signup command
Cypress.Commands.add("signup", (username, email, password) => {
  cy.visit("/signup");
  cy.wait(500);

  cy.get('input[id="username"]').type(username, { delay: 60 });
  cy.wait(400);

  cy.get('input[id="email"]').type(email, { delay: 60 });
  cy.wait(400);

  cy.get('input[id="password"]').type(password, { delay: 60 });
  cy.wait(400);

  cy.get('button[type="submit"]').click();
  cy.wait(500);
});