/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves from /3drubix/; local/dev keeps root paths.
  base: process.env.BASE_PATH || "/",
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: "node",
  },
});
