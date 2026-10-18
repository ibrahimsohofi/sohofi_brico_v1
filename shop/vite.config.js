import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(root, "src") },
  },
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
  preview: { host: "0.0.0.0", port: 5175 },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
