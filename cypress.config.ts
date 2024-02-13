import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    //VITE_BACKEND_URL: 'https://jupiter.fh-swf.de/conference/api',
    //VITE_FRONTEND_URL: 'http://localhost:11001/conference',
    VITE_BACKEND_URL: 'http://192.168.0.207:3000/conference/api',
    VITE_FRONTEND_URL: 'http://192.168.0.207:5173/conference',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
