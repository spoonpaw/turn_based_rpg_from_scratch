import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  publicDir: "public",
  server: {
    port: 8000,
  },
  build: {
    outDir: "_build",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        game: resolve(__dirname, "game.html"),
      },
    },
  },
});
