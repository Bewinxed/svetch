/**
 * Svetch.ts - Vite Plugin for Typesafe API Client Generation
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { svetchPlugin } from 'svetch.ts';
 *
 * export default defineConfig({
 *   plugins: [
 *     sveltekit(),
 *     svetchPlugin({
 *       input: 'src/routes/api',
 *       output: 'src/lib/api',
 *     })
 *   ]
 * });
 * ```
 */

export { svetchPlugin, type SvetchPluginOptions } from './vite-plugin/index.js';
