import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    VITE_BACKEND_PROTOCOL: 'http',
    VITE_BACKEND_URL: '192.168.0.206:3000/conference/api',
    VITE_FRONTEND_URL: '192.168.0.206:5173/conference',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
