import { defineConfig, transformWithEsbuild } from "vite";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";

function minifyAppJavaScript() {
  return {
    name: "minify-app-javascript",
    apply: "serve",
    async transform(code, id) {
      if (!id.endsWith(".js")) return null;
      if (id.includes("/node_modules/") || id.includes("/@vite/")) return null;

      return transformWithEsbuild(code, id, {
        minify: true,
        legalComments: "none",
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    minifyAppJavaScript(),
    compression({ algorithm: "brotliCompress", ext: ".br" }),
    compression({ algorithm: "gzip", ext: ".gz" }),
  ],
  base: "",
  assetsInclude: ["**/*.glb", "**/*.gltf"],
  optimizeDeps: {
    esbuildOptions: {
      minify: true,
      legalComments: "none",
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          "three-vendor": ["three"],
        },
      },
    },
  },
});
