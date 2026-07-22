import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
// base: './' makes asset paths relative so the build works on any GitHub Pages URL
// (both root user pages and project pages), and pairs with HashRouter for SPA routing.
export default defineConfig({
  base: "./",
  build: {
    sourcemap: "hidden",
  },
  plugins: [
    react({
      babel: {
        plugins: ["react-dev-locator"],
      },
    }),
    tsconfigPaths(),
  ],
});
