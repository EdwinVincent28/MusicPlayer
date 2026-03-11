const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", 
    setupNodeEvents(on, config) {},
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 8000,
  },
});