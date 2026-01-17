import type { Plugin, ViteDevServer, ResolvedConfig } from 'vite';
import * as path from 'node:path';
import type {
  SvetchPluginOptions,
  ResolvedPluginOptions,
  PluginState,
  ProcessedEndpoint,
  PluginLogger,
} from './types.js';
import { ProjectManager } from './core/project-manager.js';
import { DependencyTracker } from './core/dependency-tracker.js';
import { CacheManager } from './core/cache-manager.js';
import { EndpointProcessor } from './core/endpoint-processor.js';
import { OutputGenerator } from './output/generator.js';

const PLUGIN_NAME = 'vite-plugin-svetch';
const CACHE_VERSION = '1.0.0';

/**
 * Resolve plugin options with defaults
 */
function resolveOptions(options: SvetchPluginOptions): ResolvedPluginOptions {
  return {
    input: options.input,
    output: options.output,
    tsconfig: options.tsconfig ?? 'tsconfig.json',
    framework: options.framework ?? 'sveltekit',
    docs: options.docs ?? 'src/routes/docs',
    staticFolder: options.staticFolder ?? 'static',
    logLevel: options.logLevel ?? 2,
  };
}

/**
 * Create a logger that uses Vite's logger when available
 */
function createLogger(config?: ResolvedConfig): PluginLogger {
  const viteLogger = config?.logger;

  return {
    info: (msg: string) => {
      if (viteLogger) {
        viteLogger.info(`[${PLUGIN_NAME}] ${msg}`, { timestamp: true });
      } else {
        console.log(`[${PLUGIN_NAME}] ${msg}`);
      }
    },
    warn: (msg: string) => {
      if (viteLogger) {
        viteLogger.warn(`[${PLUGIN_NAME}] ${msg}`, { timestamp: true });
      } else {
        console.warn(`[${PLUGIN_NAME}] ${msg}`);
      }
    },
    error: (msg: string) => {
      if (viteLogger) {
        viteLogger.error(`[${PLUGIN_NAME}] ${msg}`, { timestamp: true });
      } else {
        console.error(`[${PLUGIN_NAME}] ${msg}`);
      }
    },
    debug: (msg: string) => {
      if (viteLogger) {
        viteLogger.info(`[${PLUGIN_NAME}] ${msg}`, { timestamp: true });
      } else {
        console.log(`[${PLUGIN_NAME}] [DEBUG] ${msg}`);
      }
    },
  };
}

/**
 * Svetch Vite plugin for automatic API type generation
 *
 * @example
 * ```ts
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
export function svetchPlugin(options: SvetchPluginOptions): Plugin {
  const resolvedOptions = resolveOptions(options);

  let config: ResolvedConfig;
  let logger: PluginLogger;
  let server: ViteDevServer | undefined;
  let root: string;

  // Core components
  let projectManager: ProjectManager;
  let dependencyTracker: DependencyTracker;
  let cacheManager: CacheManager;
  let endpointProcessor: EndpointProcessor;
  let outputGenerator: OutputGenerator;

  // State
  const state: PluginState = {
    initialized: false,
    endpoints: new Map(),
    dependencyGraph: new Map(),
    fileHashes: new Map(),
  };

  // Debouncing for file changes
  let pendingChanges = new Set<string>();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const DEBOUNCE_MS = 100;

  /**
   * Initialize all components and perform initial scan
   */
  async function initialize(): Promise<void> {
    if (state.initialized) return;

    const inputPath = path.resolve(root, resolvedOptions.input);
    const outputPath = path.resolve(root, resolvedOptions.output);
    const tsconfigPath = path.resolve(root, resolvedOptions.tsconfig);

    logger.info(`Initializing with input: ${inputPath}`);

    // Initialize components
    projectManager = new ProjectManager(tsconfigPath, logger);
    projectManager.initialize();
    projectManager.addSourceFiles(path.join(inputPath, '**/*+server.ts'));

    cacheManager = new CacheManager(outputPath, CACHE_VERSION, logger);
    await cacheManager.loadCache();

    dependencyTracker = new DependencyTracker(projectManager, logger);

    endpointProcessor = new EndpointProcessor(
      projectManager.getTypeChecker(),
      resolvedOptions.framework,
      root,
      logger
    );

    outputGenerator = new OutputGenerator(outputPath, resolvedOptions, logger);

    // Build initial dependency graph and process endpoints
    await performFullScan(inputPath);

    state.initialized = true;
    logger.info('Initialization complete');
  }

  /**
   * Perform a full scan of all endpoints
   */
  async function performFullScan(inputPath: string): Promise<void> {
    const startTime = performance.now();

    const endpointFiles = projectManager.getEndpointFiles();
    logger.info(`Found ${endpointFiles.length} endpoint files`);

    // Build dependency graph
    dependencyTracker.buildInitialGraph(endpointFiles);

    // Process all endpoints
    const processedEndpoints = new Map<string, ProcessedEndpoint>();

    for (const sourceFile of endpointFiles) {
      const filePath = sourceFile.getFilePath();
      const cachedEndpoint = cacheManager.getEndpointCache(filePath);

      // Check if we can use cached data
      if (cachedEndpoint && !await cacheManager.hasFileChanged(filePath)) {
        processedEndpoints.set(filePath, cachedEndpoint);
        state.endpoints.set(filePath, cachedEndpoint);
        continue;
      }

      // Process the endpoint
      try {
        const endpoint = endpointProcessor.processEndpointFile(sourceFile);
        processedEndpoints.set(filePath, endpoint);
        state.endpoints.set(filePath, endpoint);
        cacheManager.saveEndpointCache(endpoint);
      } catch (error) {
        logger.error(`Failed to process ${filePath}: ${error}`);
      }
    }

    // Generate output
    await outputGenerator.generateFull(processedEndpoints);

    // Save cache
    await cacheManager.saveCache();

    const duration = (performance.now() - startTime).toFixed(2);
    logger.info(`Full scan completed in ${duration}ms`);
  }

  /**
   * Process pending file changes
   */
  async function processChanges(): Promise<void> {
    if (pendingChanges.size === 0) return;

    const changes = new Set(pendingChanges);
    pendingChanges.clear();

    const startTime = performance.now();

    // Determine affected endpoints
    const affectedEndpoints = new Set<string>();
    const removedEndpoints = new Set<string>();

    for (const filePath of changes) {
      // Check if file was deleted
      const sourceFile = projectManager.getSourceFile(filePath);
      if (!sourceFile) {
        // File was deleted
        if (dependencyTracker.isEndpointFile(filePath)) {
          removedEndpoints.add(filePath);
        }
        dependencyTracker.removeNode(filePath);
        continue;
      }

      // Update the source file in ts-morph
      projectManager.refreshSourceFile(filePath);

      // Get affected endpoints
      const affected = dependencyTracker.getAffectedEndpoints(filePath);
      affected.forEach(ep => affectedEndpoints.add(ep));

      // Update dependency graph for this file
      if (dependencyTracker.isEndpointFile(filePath)) {
        dependencyTracker.updateNode(sourceFile);
      }
    }

    // Remove deleted endpoints
    for (const filePath of removedEndpoints) {
      state.endpoints.delete(filePath);
      cacheManager.removeEndpointCache(filePath);
    }

    // Process affected endpoints
    const processedEndpoints = new Map<string, ProcessedEndpoint>();

    for (const filePath of affectedEndpoints) {
      if (removedEndpoints.has(filePath)) continue;

      const sourceFile = projectManager.getSourceFile(filePath);
      if (!sourceFile) continue;

      try {
        const endpoint = endpointProcessor.processEndpointFile(sourceFile);
        processedEndpoints.set(filePath, endpoint);
        state.endpoints.set(filePath, endpoint);
        cacheManager.saveEndpointCache(endpoint);
      } catch (error) {
        logger.error(`Failed to process ${filePath}: ${error}`);
      }
    }

    if (processedEndpoints.size > 0 || removedEndpoints.size > 0) {
      // Generate incremental output
      await outputGenerator.generateIncremental(
        processedEndpoints,
        state.endpoints,
        removedEndpoints
      );

      // Save cache
      await cacheManager.saveCache();

      const duration = (performance.now() - startTime).toFixed(2);
      logger.info(
        `Regenerated ${processedEndpoints.size} endpoints in ${duration}ms` +
        (removedEndpoints.size > 0 ? ` (${removedEndpoints.size} removed)` : '')
      );

      // Trigger HMR
      if (server) {
        server.ws.send({ type: 'full-reload' });
      }
    }
  }

  /**
   * Schedule processing of file changes
   */
  function scheduleProcessing(filePath: string): void {
    pendingChanges.add(filePath);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      processChanges().catch(error => {
        logger.error(`Error processing changes: ${error}`);
      });
    }, DEBOUNCE_MS);
  }

  /**
   * Check if a file path is relevant to the plugin
   */
  function isRelevantFile(filePath: string): boolean {
    if (!state.initialized) return false;

    // Normalize path
    const normalizedPath = path.normalize(filePath);

    // Check if it's an endpoint file
    if (normalizedPath.endsWith('+server.ts')) {
      const inputPath = path.resolve(root, resolvedOptions.input);
      return normalizedPath.startsWith(inputPath);
    }

    // Check if it's a tracked dependency
    return dependencyTracker.isTrackedFile(normalizedPath);
  }

  return {
    name: PLUGIN_NAME,

    configResolved(resolvedConfig) {
      config = resolvedConfig;
      root = config.root;
      logger = createLogger(config);
    },

    async buildStart() {
      await initialize();
    },

    configureServer(_server) {
      server = _server;

      // Watch the input directory
      const inputPath = path.resolve(root, resolvedOptions.input);
      server.watcher.add(inputPath);

      // Also watch for TypeScript files that might be dependencies
      server.watcher.on('change', (filePath) => {
        if (isRelevantFile(filePath)) {
          scheduleProcessing(filePath);
        }
      });

      server.watcher.on('add', (filePath) => {
        if (filePath.endsWith('+server.ts')) {
          const inputPath = path.resolve(root, resolvedOptions.input);
          if (filePath.startsWith(inputPath)) {
            // New endpoint added
            projectManager.addSourceFile(filePath);
            scheduleProcessing(filePath);
          }
        }
      });

      server.watcher.on('unlink', (filePath) => {
        if (isRelevantFile(filePath)) {
          scheduleProcessing(filePath);
        }
      });
    },

    async handleHotUpdate({ file }) {
      if (isRelevantFile(file)) {
        scheduleProcessing(file);
      }
      // Don't return anything - let other plugins handle HMR
      return undefined;
    },

    async closeBundle() {
      if (cacheManager) {
        await cacheManager.saveCache();
      }
    },
  };
}

export type { SvetchPluginOptions };
