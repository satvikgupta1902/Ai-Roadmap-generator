import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    cors: true,
    proxy: {
      "/api/nvidia": {
        target: "https://integrate.api.nvidia.com/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nvidia/, ""),
        secure: false,
      },
      "/api/cerebras": {
        target: "https://api.cerebras.ai/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cerebras/, ""),
        secure: false,
      },
    },
  },
});
