describe("Signup Flow", () => {
  const testUser = {
    username: "testuser",
    email: `testuser_${Date.now()}@gmail.com`, 
    password: "Test@1234",
  };

  beforeEach(() => {
    cy.visit("/signup");
    cy.wait(600); 
  });

  it("displays the signup form correctly", () => {
    // Check card title
    cy.contains("Create an account").should("be.visible");
    cy.wait(400);

    // Check subtitle
    cy.contains("Sign up to start listening").should("be.visible");
    cy.wait(400);

    // Check all fields are present
    cy.get('input[id="username"]').should("be.visible");
    cy.wait(300);

    cy.get('input[id="email"]').should("be.visible");
    cy.wait(300);

    cy.get('input[id="password"]').should("be.visible");
    cy.wait(300);

    cy.get('input[id="profileImage"]').should("be.visible");
    cy.wait(300);

    // Check buttons
    cy.get('button[type="submit"]').contains("Sign Up").should("be.visible");
    cy.wait(300);
  });

  it("navigates to login when 'Already have an account' is clicked", () => {
    cy.contains("Already have an account? Log in").click();
    cy.wait(600);

    cy.url().should("eq", Cypress.config("baseUrl") + "/");
    cy.wait(400);
  });

  it("shows validation error for missing required fields", () => {
    // Try submitting empty form
    cy.get('button[type="submit"]').click();
    cy.wait(600);

    // Browser native validation keeps us on the signup page
    cy.url().should("include", "/signup");
    cy.wait(400);
  });

  it("successfully creates a new account and redirects to /home", () => {
    // Intercept the signup API call
    cy.intercept("POST", "/api/public/signup", {
      statusCode: 200,
      body: { token: "fake-jwt-token-signup" },
    }).as("signupRequest");

    cy.wait(400);

    // Fill in username
    cy.get('input[id="username"]').type(testUser.username, { delay: 60 });
    cy.wait(500);

    // Fill in email
    cy.get('input[id="email"]').type(testUser.email, { delay: 60 });
    cy.wait(500);

    // Fill in password
    cy.get('input[id="password"]').type(testUser.password, { delay: 60 });
    cy.wait(500);

    // Submit
    cy.get('button[type="submit"]').click();
    cy.wait(400);

    // Wait for API call
    cy.wait("@signupRequest");
    cy.wait(500);

    // Should redirect to /home
    cy.url().should("include", "/home");
    cy.wait(400);

    // Token should be stored
    cy.window().its("localStorage").invoke("getItem", "token").should("eq", "fake-jwt-token-signup");
    cy.wait(400);
  });

  it("shows error message on failed signup (e.g. email already exists)", () => {
    cy.intercept("POST", "/api/public/signup", {
      statusCode: 409,
      body: { error: "Email already in use" },
    }).as("signupFailed");

    cy.wait(400);

    cy.get('input[id="username"]').type("existinguser", { delay: 60 });
    cy.wait(500);

    cy.get('input[id="email"]').type("existing@gmail.com", { delay: 60 });
    cy.wait(500);

    cy.get('input[id="password"]').type("Test@1234", { delay: 60 });
    cy.wait(500);

    cy.get('button[type="submit"]').click();
    cy.wait(400);

    cy.wait("@signupFailed");
    cy.wait(500);

    // Error message should appear
    cy.contains("Email already in use").should("be.visible");
    cy.wait(400);
  });

  it("disables the button and shows loading state during submission", () => {
    cy.intercept("POST", "/api/public/signup", (req) => {
      req.reply((res) => {
        res.setDelay(1500); // simulate slow response
        res.send({ statusCode: 200, body: { token: "fake-token" } });
      });
    }).as("slowSignup");

    cy.wait(400);

    cy.get('input[id="username"]').type("slowuser", { delay: 60 });
    cy.wait(400);

    cy.get('input[id="email"]').type("slow@gmail.com", { delay: 60 });
    cy.wait(400);

    cy.get('input[id="password"]').type("Test@1234", { delay: 60 });
    cy.wait(400);

    cy.get('button[type="submit"]').click();
    cy.wait(300);

    // Button should be disabled and show loading text
    cy.get('button[type="submit"]').should("be.disabled");
    cy.wait(300);
    cy.get('button[type="submit"]').should("contain", "Creating account...");
    cy.wait(400);
  });
});