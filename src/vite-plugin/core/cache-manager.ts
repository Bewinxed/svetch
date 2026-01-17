import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type {
  CacheData,
  PluginLogger,
  ProcessedEndpoint,
  SerializedProcessedEndpoint,
  SerializedEndpointDefinition,
  SerializedMethodMap,
} from '../types.js';
import type { EndpointDefinition, FormattedType, HTTP_METHOD } from '../../types/core.js';

/**
 * Manages caching of processed endpoints and file hashes for incremental builds
 */
export class CacheManager {
  private outputDir: string;
  private cacheDir: string;
  private cacheFile: string;
  private cacheVersion: string;
  private logger: PluginLogger;

  /** Cached endpoint data */
  private endpoints: Map<string, ProcessedEndpoint> = new Map();

  /** File content hashes for change detection */
  private fileHashes: Map<string, string> = new Map();

  constructor(outputDir: string, cacheVersion: string, logger: PluginLogger) {
    this.outputDir = outputDir;
    this.cacheDir = path.join(outputDir, '.svetch-cache');
    this.cacheFile = path.join(this.cacheDir, 'cache.json');
    this.cacheVersion = cacheVersion;
    this.logger = logger;
  }

  /**
   * Load cache from disk
   */
  async loadCache(): Promise<void> {
    try {
      if (!fs.existsSync(this.cacheFile)) {
        this.logger.debug('No cache file found, starting fresh');
        return;
      }

      const content = await fs.promises.readFile(this.cacheFile, 'utf-8');
      const data = JSON.parse(content) as CacheData;

      // Check cache version
      if (data.version !== this.cacheVersion) {
        this.logger.info('Cache version mismatch, starting fresh');
        return;
      }

      // Deserialize endpoints
      for (const [filePath, serialized] of Object.entries(data.endpoints)) {
        const endpoint = this.deserializeEndpoint(serialized);
        this.endpoints.set(filePath, endpoint);
      }

      // Load file hashes
      this.fileHashes = new Map(Object.entries(data.fileHashes));

      this.logger.debug(`Loaded cache with ${this.endpoints.size} endpoints`);
    } catch (error) {
      this.logger.warn(`Failed to load cache: ${error}`);
      // Clear cache on error
      this.endpoints.clear();
      this.fileHashes.clear();
    }
  }

  /**
   * Save cache to disk
   */
  async saveCache(): Promise<void> {
    try {
      // Ensure cache directory exists
      await fs.promises.mkdir(this.cacheDir, { recursive: true });

      // Serialize endpoints
      const serializedEndpoints: Record<string, SerializedProcessedEndpoint> = {};
      for (const [filePath, endpoint] of this.endpoints) {
        serializedEndpoints[filePath] = this.serializeEndpoint(endpoint);
      }

      const cacheData: CacheData = {
        version: this.cacheVersion,
        timestamp: Date.now(),
        endpoints: serializedEndpoints,
        dependencyGraph: {}, // Will be handled by DependencyTracker
        fileHashes: Object.fromEntries(this.fileHashes),
      };

      await fs.promises.writeFile(
        this.cacheFile,
        JSON.stringify(cacheData, null, 2),
        'utf-8'
      );

      this.logger.debug('Cache saved successfully');
    } catch (error) {
      this.logger.error(`Failed to save cache: ${error}`);
    }
  }

  /**
   * Check if a file has changed since it was last cached
   */
  async hasFileChanged(filePath: string): Promise<boolean> {
    try {
      const currentHash = await this.computeHash(filePath);
      const cachedHash = this.fileHashes.get(filePath);

      if (!cachedHash) {
        // File not in cache, it's "changed" (new)
        this.fileHashes.set(filePath, currentHash);
        return true;
      }

      if (currentHash !== cachedHash) {
        // Hash changed, update cache
        this.fileHashes.set(filePath, currentHash);
        return true;
      }

      return false;
    } catch (error) {
      // File might not exist
      return true;
    }
  }

  /**
   * Update the hash for a file
   */
  async updateFileHash(filePath: string): Promise<string> {
    const hash = await this.computeHash(filePath);
    this.fileHashes.set(filePath, hash);
    return hash;
  }

  /**
   * Get cached endpoint data
   */
  getEndpointCache(filePath: string): ProcessedEndpoint | undefined {
    return this.endpoints.get(filePath);
  }

  /**
   * Save processed endpoint to cache
   */
  saveEndpointCache(endpoint: ProcessedEndpoint): void {
    this.endpoints.set(endpoint.filePath, endpoint);
  }

  /**
   * Remove an endpoint from cache
   */
  removeEndpointCache(filePath: string): void {
    this.endpoints.delete(filePath);
    this.fileHashes.delete(filePath);
  }

  /**
   * Get all cached endpoints
   */
  getAllEndpoints(): Map<string, ProcessedEndpoint> {
    return new Map(this.endpoints);
  }

  /**
   * Get cached file hash
   */
  getFileHash(filePath: string): string | undefined {
    return this.fileHashes.get(filePath);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.endpoints.clear();
    this.fileHashes.clear();
  }

  /**
   * Compute SHA-256 hash of file content
   */
  private async computeHash(filePath: string): Promise<string> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Serialize a ProcessedEndpoint for storage
   */
  private serializeEndpoint(endpoint: ProcessedEndpoint): SerializedProcessedEndpoint {
    const methods: SerializedMethodMap = {} as SerializedMethodMap;

    for (const [method, definition] of endpoint.methods) {
      methods[method as HTTP_METHOD] = this.serializeEndpointDefinition(definition);
    }

    return {
      filePath: endpoint.filePath,
      apiPath: endpoint.apiPath,
      methods,
      typeImports: Array.from(endpoint.typeImports),
      contentHash: endpoint.contentHash,
      processedAt: endpoint.processedAt,
    };
  }

  /**
   * Serialize an EndpointDefinition
   */
  private serializeEndpointDefinition(def: EndpointDefinition): SerializedEndpointDefinition {
    const serializeFormattedType = (ft: FormattedType): FormattedType & { imports?: string[] } => ({
      typeString: ft.typeString,
      jsdoc: ft.jsdoc,
      imports: ft.imports ? Array.from(ft.imports) : undefined,
    });

    const parameters: SerializedEndpointDefinition['parameters'] = {};

    if (def.parameters.body) {
      parameters.body = serializeFormattedType(def.parameters.body);
    }
    if (def.parameters.path) {
      parameters.path = def.parameters.path;
    }
    if (def.parameters.query) {
      parameters.query = {};
      for (const [key, value] of Object.entries(def.parameters.query)) {
        parameters.query[key] = serializeFormattedType(value);
      }
    }

    const responses: Record<number, Array<FormattedType & { imports?: string[] }>> = {};
    for (const [status, types] of Object.entries(def.responses)) {
      if (types) {
        responses[Number(status)] = types.map(serializeFormattedType);
      }
    }

    const errors: Record<string, Array<FormattedType & { imports?: string[] }>> = {};
    for (const [status, types] of Object.entries(def.errors)) {
      if (types) {
        errors[status] = types.map(serializeFormattedType);
      }
    }

    return {
      parameters,
      responses,
      errors,
      docs: def.docs,
      imports: Array.from(def.imports),
    };
  }

  /**
   * Deserialize a ProcessedEndpoint from storage
   */
  private deserializeEndpoint(serialized: SerializedProcessedEndpoint): ProcessedEndpoint {
    const methods = new Map<HTTP_METHOD, EndpointDefinition>();

    for (const [method, definition] of Object.entries(serialized.methods)) {
      if (definition) {
        methods.set(
          method as HTTP_METHOD,
          this.deserializeEndpointDefinition(definition)
        );
      }
    }

    return {
      filePath: serialized.filePath,
      apiPath: serialized.apiPath,
      methods,
      typeImports: new Set(serialized.typeImports),
      contentHash: serialized.contentHash,
      processedAt: serialized.processedAt,
    };
  }

  /**
   * Deserialize an EndpointDefinition
   */
  private deserializeEndpointDefinition(serialized: SerializedEndpointDefinition): EndpointDefinition {
    const deserializeFormattedType = (ft: FormattedType & { imports?: string[] }): FormattedType => ({
      typeString: ft.typeString,
      jsdoc: ft.jsdoc,
      imports: ft.imports ? new Set(ft.imports) : undefined,
    });

    const parameters: EndpointDefinition['parameters'] = {};

    if (serialized.parameters.body) {
      parameters.body = deserializeFormattedType(serialized.parameters.body);
    }
    if (serialized.parameters.path) {
      parameters.path = serialized.parameters.path;
    }
    if (serialized.parameters.query) {
      parameters.query = {};
      for (const [key, value] of Object.entries(serialized.parameters.query)) {
        parameters.query[key] = deserializeFormattedType(value);
      }
    }

    const responses: Partial<Record<number, FormattedType[]>> = {};
    for (const [status, types] of Object.entries(serialized.responses)) {
      if (types) {
        responses[Number(status)] = types.map(deserializeFormattedType);
      }
    }

    const errors: Record<string, FormattedType[]> = {};
    for (const [status, types] of Object.entries(serialized.errors)) {
      if (types) {
        errors[status] = types.map(deserializeFormattedType);
      }
    }

    return {
      parameters,
      responses,
      errors,
      docs: serialized.docs,
      imports: new Set(serialized.imports),
    };
  }
}
