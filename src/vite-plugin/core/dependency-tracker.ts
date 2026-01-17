import { Node, type SourceFile } from 'ts-morph';
import type { DependencyNode, PluginLogger } from '../types.js';
import type { ProjectManager } from './project-manager.js';

/**
 * Tracks dependencies between endpoint files and their imported types.
 * When a dependency changes, this allows us to determine which endpoints
 * need to be regenerated.
 */
export class DependencyTracker {
  private projectManager: ProjectManager;
  private logger: PluginLogger;

  /** Map of file path to its dependency node */
  private nodes: Map<string, DependencyNode> = new Map();

  /** Set of endpoint file paths for quick lookup */
  private endpointFiles: Set<string> = new Set();

  /** Maximum depth for transitive dependency collection */
  private static readonly MAX_DEPENDENCY_DEPTH = 10;

  constructor(projectManager: ProjectManager, logger: PluginLogger) {
    this.projectManager = projectManager;
    this.logger = logger;
  }

  /**
   * Build the initial dependency graph from all endpoint files
   */
  buildInitialGraph(endpointSourceFiles: SourceFile[]): void {
    this.logger.debug(`Building initial dependency graph for ${endpointSourceFiles.length} endpoints`);

    // Clear existing graph
    this.nodes.clear();
    this.endpointFiles.clear();

    // Process each endpoint file
    for (const sourceFile of endpointSourceFiles) {
      const filePath = sourceFile.getFilePath();
      this.endpointFiles.add(filePath);

      // Collect dependencies for this endpoint
      const dependencies = this.collectDependencies(sourceFile);

      // Create node for the endpoint
      this.createOrUpdateNode(filePath, 'endpoint', dependencies);

      // Create nodes for dependencies and track reverse relationships
      for (const depPath of dependencies) {
        this.addDependency(filePath, depPath);
      }
    }

    this.logger.debug(`Built graph with ${this.nodes.size} nodes`);
  }

  /**
   * Update the graph when a file changes
   */
  updateNode(sourceFile: SourceFile): void {
    const filePath = sourceFile.getFilePath();

    // Collect new dependencies
    const newDependencies = this.collectDependencies(sourceFile);

    // Get existing node
    const existingNode = this.nodes.get(filePath);
    const oldDependencies = existingNode?.dependencies ?? new Set<string>();

    // Find added and removed dependencies
    const addedDeps = new Set<string>();
    const removedDeps = new Set<string>();

    for (const dep of newDependencies) {
      if (!oldDependencies.has(dep)) {
        addedDeps.add(dep);
      }
    }

    for (const dep of oldDependencies) {
      if (!newDependencies.has(dep)) {
        removedDeps.add(dep);
      }
    }

    // Update the node
    const nodeType = this.endpointFiles.has(filePath) ? 'endpoint' : 'dependency';
    this.createOrUpdateNode(filePath, nodeType, newDependencies);

    // Update reverse relationships for removed dependencies
    for (const depPath of removedDeps) {
      const depNode = this.nodes.get(depPath);
      if (depNode) {
        depNode.dependents.delete(filePath);
        // Clean up orphaned dependency nodes
        if (depNode.dependents.size === 0 && depNode.type === 'dependency') {
          this.nodes.delete(depPath);
        }
      }
    }

    // Add reverse relationships for new dependencies
    for (const depPath of addedDeps) {
      this.addDependency(filePath, depPath);
    }
  }

  /**
   * Remove a node from the graph (e.g., when a file is deleted)
   */
  removeNode(filePath: string): void {
    const node = this.nodes.get(filePath);
    if (!node) return;

    // Remove from dependents of all dependencies
    for (const depPath of node.dependencies) {
      const depNode = this.nodes.get(depPath);
      if (depNode) {
        depNode.dependents.delete(filePath);
        // Clean up orphaned dependency nodes
        if (depNode.dependents.size === 0 && depNode.type === 'dependency') {
          this.nodes.delete(depPath);
        }
      }
    }

    // Remove the node itself
    this.nodes.delete(filePath);
    this.endpointFiles.delete(filePath);
  }

  /**
   * Get all endpoint files affected by a change to the given file
   */
  getAffectedEndpoints(changedFilePath: string): Set<string> {
    const affected = new Set<string>();
    const visited = new Set<string>();

    this.collectAffectedEndpointsRecursive(changedFilePath, affected, visited);

    return affected;
  }

  /**
   * Check if a file is an endpoint file
   */
  isEndpointFile(filePath: string): boolean {
    return this.endpointFiles.has(filePath);
  }

  /**
   * Check if a file is tracked in the dependency graph
   */
  isTrackedFile(filePath: string): boolean {
    return this.nodes.has(filePath);
  }

  /**
   * Get a node from the graph
   */
  getNode(filePath: string): DependencyNode | undefined {
    return this.nodes.get(filePath);
  }

  /**
   * Get all nodes in the graph
   */
  getAllNodes(): Map<string, DependencyNode> {
    return new Map(this.nodes);
  }

  /**
   * Get all endpoint file paths
   */
  getEndpointFilePaths(): Set<string> {
    return new Set(this.endpointFiles);
  }

  /**
   * Collect all dependencies of a source file (imports)
   */
  private collectDependencies(sourceFile: SourceFile, depth: number = 0): Set<string> {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    this.collectDependenciesRecursive(sourceFile, dependencies, visited, depth);

    // Remove the source file itself from its dependencies
    dependencies.delete(sourceFile.getFilePath());

    return dependencies;
  }

  /**
   * Recursively collect dependencies
   */
  private collectDependenciesRecursive(
    sourceFile: SourceFile,
    dependencies: Set<string>,
    visited: Set<string>,
    depth: number
  ): void {
    const filePath = sourceFile.getFilePath();

    // Avoid infinite loops and limit depth
    if (visited.has(filePath) || depth > DependencyTracker.MAX_DEPENDENCY_DEPTH) {
      return;
    }
    visited.add(filePath);

    // Get all import declarations
    for (const importDecl of sourceFile.getImportDeclarations()) {
      const importedFile = importDecl.getModuleSpecifierSourceFile();

      if (!importedFile) continue;

      // Skip external libraries and node_modules
      if (importedFile.isFromExternalLibrary() || importedFile.isInNodeModules()) {
        continue;
      }

      const importedPath = importedFile.getFilePath();
      dependencies.add(importedPath);

      // Recursively collect transitive dependencies
      this.collectDependenciesRecursive(importedFile, dependencies, visited, depth + 1);
    }

    // Also track type references that resolve to local files
    sourceFile.forEachDescendant((node) => {
      if (Node.isTypeReference(node)) {
        try {
          const type = node.getType();
          const symbol = type.getSymbol();
          if (symbol) {
            for (const decl of symbol.getDeclarations()) {
              const declFile = decl.getSourceFile();
              if (!declFile.isFromExternalLibrary() && !declFile.isInNodeModules()) {
                const declPath = declFile.getFilePath();
                if (!visited.has(declPath)) {
                  dependencies.add(declPath);
                }
              }
            }
          }
        } catch {
          // Ignore errors from type resolution
        }
      }
    });
  }

  /**
   * Recursively find all endpoints affected by a file change
   */
  private collectAffectedEndpointsRecursive(
    filePath: string,
    affected: Set<string>,
    visited: Set<string>
  ): void {
    if (visited.has(filePath)) {
      return;
    }
    visited.add(filePath);

    // If this is an endpoint file, add it to affected
    if (this.endpointFiles.has(filePath)) {
      affected.add(filePath);
    }

    // Get the node for this file
    const node = this.nodes.get(filePath);
    if (!node) return;

    // Check all files that depend on this file
    for (const dependentPath of node.dependents) {
      this.collectAffectedEndpointsRecursive(dependentPath, affected, visited);
    }
  }

  /**
   * Create or update a node in the graph
   */
  private createOrUpdateNode(
    filePath: string,
    type: 'endpoint' | 'dependency',
    dependencies: Set<string>
  ): DependencyNode {
    const existingNode = this.nodes.get(filePath);

    const node: DependencyNode = {
      filePath,
      contentHash: '', // Will be set by CacheManager
      type,
      lastModified: Date.now(),
      dependencies: new Set(dependencies),
      dependents: existingNode?.dependents ?? new Set(),
    };

    this.nodes.set(filePath, node);
    return node;
  }

  /**
   * Add a dependency relationship (source depends on target)
   */
  private addDependency(sourcePath: string, targetPath: string): void {
    // Ensure target node exists
    if (!this.nodes.has(targetPath)) {
      this.createOrUpdateNode(targetPath, 'dependency', new Set());
    }

    // Add reverse relationship
    const targetNode = this.nodes.get(targetPath)!;
    targetNode.dependents.add(sourcePath);
  }

  /**
   * Serialize the graph for caching
   */
  serialize(): Record<string, {
    filePath: string;
    contentHash: string;
    type: 'endpoint' | 'dependency';
    lastModified: number;
    dependencies: string[];
    dependents: string[];
  }> {
    const result: Record<string, {
      filePath: string;
      contentHash: string;
      type: 'endpoint' | 'dependency';
      lastModified: number;
      dependencies: string[];
      dependents: string[];
    }> = {};

    for (const [path, node] of this.nodes) {
      result[path] = {
        filePath: node.filePath,
        contentHash: node.contentHash,
        type: node.type,
        lastModified: node.lastModified,
        dependencies: Array.from(node.dependencies),
        dependents: Array.from(node.dependents),
      };
    }

    return result;
  }

  /**
   * Deserialize the graph from cache
   */
  deserialize(data: Record<string, {
    filePath: string;
    contentHash: string;
    type: 'endpoint' | 'dependency';
    lastModified: number;
    dependencies: string[];
    dependents: string[];
  }>): void {
    this.nodes.clear();
    this.endpointFiles.clear();

    for (const [path, nodeData] of Object.entries(data)) {
      const node: DependencyNode = {
        filePath: nodeData.filePath,
        contentHash: nodeData.contentHash,
        type: nodeData.type,
        lastModified: nodeData.lastModified,
        dependencies: new Set(nodeData.dependencies),
        dependents: new Set(nodeData.dependents),
      };

      this.nodes.set(path, node);

      if (node.type === 'endpoint') {
        this.endpointFiles.add(path);
      }
    }
  }
}
