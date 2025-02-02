import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "tailwindcss"; // Correctly import tailwindcss

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss], // Remove parentheses from tailwindcss
});
