describe("Login Flow", () => {
  const validUser = {
    email: "testuser@gmail.com",
    password: "Test@1234",
  };

  beforeEach(() => {
    cy.visit("/");
    cy.wait(600); // let page settle
  });

  it("displays the login form correctly", () => {
    // Check card title
    cy.contains("Login").should("be.visible");
    cy.wait(400);

    // Check subtitle
    cy.contains("Enter your email and password").should("be.visible");
    cy.wait(400);

    // Check fields
    cy.get('input[id="email"]').should("be.visible");
    cy.wait(300);

    cy.get('input[id="password"]').should("be.visible");
    cy.wait(300);

    // Check buttons
    cy.get('button[type="submit"]').contains("Sign In").should("be.visible");
    cy.wait(300);

    cy.contains("Create an account").should("be.visible");
    cy.wait(300);
  });

  it("navigates to signup when 'Create an account' is clicked", () => {
    cy.contains("Create an account").click();
    cy.wait(600);

    cy.url().should("include", "/signup");
    cy.wait(400);
  });

  it("shows validation for missing fields", () => {
    // Try submitting empty form
    cy.get('button[type="submit"]').click();
    cy.wait(600);

    // Should remain on login page
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
    cy.wait(400);
  });

  it("successfully logs in and redirects to /home", () => {
    cy.intercept("POST", "/api/public/login", {
      statusCode: 200,
      body: { token: "fake-jwt-token-login" },
    }).as("loginRequest");

    cy.wait(400);

    // Type email
    cy.get('input[id="email"]').type(validUser.email, { delay: 60 });
    cy.wait(500);

    // Type password
    cy.get('input[id="password"]').type(validUser.password, { delay: 60 });
    cy.wait(500);

    // Click Sign In
    cy.get('button[type="submit"]').click();
    cy.wait(400);

    // Wait for API
    cy.wait("@loginRequest");
    cy.wait(500);

    // Should go to /home
    cy.url().should("include", "/home");
    cy.wait(400);

    // Token should be in localStorage
    cy.window().its("localStorage").invoke("getItem", "token").should("eq", "fake-jwt-token-login");
    cy.wait(400);
  });

  it("shows error message on invalid credentials", () => {
    cy.intercept("POST", "/api/public/login", {
      statusCode: 401,
      body: { error: "Invalid email or password" },
    }).as("loginFailed");

    cy.wait(400);

    cy.get('input[id="email"]').type("wrong@gmail.com", { delay: 60 });
    cy.wait(500);

    cy.get('input[id="password"]').type("wrongpassword", { delay: 60 });
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(400);

    cy.wait("@loginFailed");
    cy.wait(500);

    // Error should be displayed
    cy.contains("Invalid email or password").should("be.visible");
    cy.wait(400);
  });

  it("shows error message on network failure", () => {
    cy.intercept("POST", "/api/public/login", {
      forceNetworkError: true,
    }).as("networkError");

    cy.wait(400);

    cy.get('input[id="email"]').type(validUser.email, { delay: 60 });
    cy.wait(500);

    cy.get('input[id="password"]').type(validUser.password, { delay: 60 });
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(400);

    cy.wait("@networkError");
    cy.wait(500);

    cy.contains("Network error. Please try again.").should("be.visible");
    cy.wait(400);
  });

  it("disables button and shows loading state during login", () => {
    cy.intercept("POST", "/api/public/login", (req) => {
      req.reply((res) => {
        res.setDelay(1500);
        res.send({ statusCode: 200, body: { token: "fake-token" } });
      });
    }).as("slowLogin");

    cy.wait(400);

    cy.get('input[id="email"]').type(validUser.email, { delay: 60 });
    cy.wait(400);

    cy.get('input[id="password"]').type(validUser.password, { delay: 60 });
    cy.wait(400);

    cy.get('button[type="submit"]').click();
    cy.wait(300);

    // Button should be disabled
    cy.get('button[type="submit"]').should("be.disabled");
    cy.wait(300);

    // Button text changes to loading
    cy.get('button[type="submit"]').should("contain", "Signing in...");
    cy.wait(400);
  });
});