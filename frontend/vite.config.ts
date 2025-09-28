import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

const getVersion = () => {
  return 'v' + JSON.parse(readFileSync("./package.json", "utf-8")).version;
};

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(getVersion()),
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
