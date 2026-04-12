import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/admin": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/doctor": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/auth": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/static": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/pharmacy/api": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/pharmacy-admin/api": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
      "/register/api": { target: "https://pharma-connect-818090170758.us-west1.run.app", changeOrigin: true },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
