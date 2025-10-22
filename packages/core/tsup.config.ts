import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true, // Generate source maps for debugging
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false, // Keep unminified for better debugging
  target: 'es2020',
  outDir: 'dist',
});

