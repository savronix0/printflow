import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Local development: /
  // Production build (GitHub Pages): /printflow/
  base: command === "build" ? "/printflow/" : "/",
}));
