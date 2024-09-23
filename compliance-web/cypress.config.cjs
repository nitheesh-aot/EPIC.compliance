/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        configFile: 'vite.config.ts', // Ensure Cypress uses the Vite config
        resolve: {
          alias: {
            "@": "/src", // Define the alias here to make sure it gets picked up
          }
        },
      },
    },
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config
    },
  },
});
