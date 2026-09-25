import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/worker/index.ts"],
  format: ["esm"],
  dts: false,
  clean: false,
  outDir: "dist-worker",
  target: "es2022",
  external: ["node:crypto", "cloudflare:workers"],
});
