import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

/**
 * Emits input-switch-polyfill.css alongside the dynamically imported chunk
 * so `fetch(import.meta.resolve('./input-switch-polyfill.css'))` resolves cleanly in production builds.
 */
function inputSwitchPolyfillCssPlugin(): Plugin {
  return {
    name: 'input-switch-polyfill-css',
    generateBundle() {
      const cssPath = fileURLToPath(
        new URL(
          './node_modules/input-switch-polyfill/input-switch-polyfill.css',
          import.meta.url
        )
      );
      if (existsSync(cssPath)) {
        this.emitFile({
          type: 'asset',
          fileName: 'assets/input-switch-polyfill.css',
          source: readFileSync(cssPath, 'utf8'),
        });
      }
    },
  };
}

export default defineConfig({
  worker: {
    format: 'es',
  },
  server: {
    port: 5173,
  },
  optimizeDeps: {
    exclude: ['input-switch-polyfill'],
  },
  plugins: [inputSwitchPolyfillCssPlugin()],
});
