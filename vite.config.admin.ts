import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Super Admin Panel — runs on port 8090
// Start with: npm run admin
export default defineConfig({
  root: path.resolve(__dirname, "admin-app"),
  server: {
    host: "::",
    port: 8090,
    strictPort: true,   // fail loudly if 8090 is taken — never silently jump to 8091
    proxy: {
      "/admin": { target: "http://localhost:5000", changeOrigin: true },
      "/api":   { target: "http://localhost:5000", changeOrigin: true },
      "/static":{ target: "http://localhost:5000", changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      "@admin": path.resolve(__dirname, "admin-app/src"),
      "@":      path.resolve(__dirname, "src"),          // share ui components
    },
  },
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist-admin"),
    emptyOutDir: true,
  },
});
