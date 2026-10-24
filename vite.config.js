import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
const entry = fileURLToPath(new URL("./src/index.jsx", import.meta.url));
export default defineConfig({
  plugins: [react(), dts({ insertTypesEntry: true, include: ["src"] })],
  build: {
    lib: {
      entry,
      name: "GanttTimeline",
      formats: ["es", "cjs"],
      cssFileName: "style",
      fileName: (f) => (f === "es" ? "index.js" : "index.cjs"),
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: { exports: "named" },
    },
  },
});
