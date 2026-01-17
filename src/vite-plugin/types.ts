import type { SourceFile, TypeChecker } from 'ts-morph';
import type { EndpointDefinition, FormattedType, HTTP_METHOD } from '../types/core.js';

/**
 * Configuration options for the Svetch Vite plugin
 */
export interface SvetchPluginOptions {
  /** Directory containing API routes to scan (e.g., "src/routes/api") */
  input: string;
  /** Output directory for generated types (e.g., "src/lib/api") */
  output: string;
  /** Path to tsconfig.json */
  tsconfig?: string;
  /** Framework to use (currently only 'sveltekit' is supported) */
  framework?: 'sveltekit';
  /** Output directory for documentation (e.g., "src/routes/docs") */
  docs?: string;
  /** Static folder for OpenAPI schemas (e.g., "static") */
  staticFolder?: string;
  /** Log level (0-5, higher = more verbose) */
  logLevel?: number;
}

/**
 * Resolved plugin options with defaults applied
 */
export interface ResolvedPluginOptions {
  input: string;
  output: string;
  tsconfig: string;
  framework: 'sveltekit';
  docs: string;
  staticFolder: string;
  logLevel: number;
}

/**
 * Represents a node in the dependency graph
 */
export interface DependencyNode {
  /** Absolute path to the file */
  filePath: string;
  /** SHA-256 hash of file content for change detection */
  contentHash: string;
  /** Type of node */
  type: 'endpoint' | 'dependency';
  /** Timestamp of last modification */
  lastModified: number;
  /** Set of file paths this node depends on (imports) */
  dependencies: Set<string>;
  /** Set of file paths that depend on this node */
  dependents: Set<string>;
}

/**
 * Serializable version of DependencyNode for caching
 */
export interface SerializedDependencyNode {
  filePath: string;
  contentHash: string;
  type: 'endpoint' | 'dependency';
  lastModified: number;
  dependencies: string[];
  dependents: string[];
}

/**
 * Represents a fully processed endpoint with all extracted information
 */
export interface ProcessedEndpoint {
  /** Absolute path to the source file */
  filePath: string;
  /** API path (e.g., "/api/users/:id") */
  apiPath: string;
  /** Map of HTTP methods to their definitions */
  methods: Map<HTTP_METHOD, EndpointDefinition>;
  /** Set of import statements needed for the generated types */
  typeImports: Set<string>;
  /** SHA-256 hash of the source file content */
  contentHash: string;
  /** Timestamp when this endpoint was processed */
  processedAt: number;
}

/**
 * Serializable version of ProcessedEndpoint for caching
 */
export interface SerializedProcessedEndpoint {
  filePath: string;
  apiPath: string;
  methods: SerializedMethodMap;
  typeImports: string[];
  contentHash: string;
  processedAt: number;
}

/**
 * Serializable method map
 */
export type SerializedMethodMap = Record<HTTP_METHOD, SerializedEndpointDefinition | undefined>;

/**
 * Serializable endpoint definition
 */
export interface SerializedEndpointDefinition {
  parameters: {
    body?: FormattedType & { imports?: string[] };
    path?: Record<string, string>;
    query?: Record<string, FormattedType & { imports?: string[] }>;
  };
  responses: Record<number, Array<FormattedType & { imports?: string[] }>>;
  errors: Record<string, Array<FormattedType & { imports?: string[] }>>;
  docs?: string;
  imports: string[];
}

/**
 * Result of an incremental generation
 */
export interface GeneratedFile {
  /** Relative path from output directory */
  path: string;
  /** File content */
  content: string;
}

/**
 * Cache structure persisted to disk
 */
export interface CacheData {
  version: string;
  timestamp: number;
  endpoints: Record<string, SerializedProcessedEndpoint>;
  dependencyGraph: Record<string, SerializedDependencyNode>;
  fileHashes: Record<string, string>;
}

/**
 * Result of processing file changes
 */
export interface ChangeProcessingResult {
  /** Endpoints that were regenerated */
  regeneratedEndpoints: Set<string>;
  /** Endpoints that were added */
  addedEndpoints: Set<string>;
  /** Endpoints that were removed */
  removedEndpoints: Set<string>;
  /** Files that were written */
  writtenFiles: GeneratedFile[];
}

/**
 * Internal state of the plugin
 */
export interface PluginState {
  /** Whether the plugin has been initialized */
  initialized: boolean;
  /** All processed endpoints */
  endpoints: Map<string, ProcessedEndpoint>;
  /** Dependency graph */
  dependencyGraph: Map<string, DependencyNode>;
  /** File content hashes */
  fileHashes: Map<string, string>;
}

/**
 * Logger interface for the plugin
 */
export interface PluginLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  debug(message: string): void;
}
