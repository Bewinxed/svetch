import { Project, type SourceFile, type TypeChecker } from 'ts-morph';
import * as fs from 'node:fs';
import type { PluginLogger } from '../types.js';

/**
 * Manages the ts-morph Project lifecycle for incremental type analysis
 */
export class ProjectManager {
  private project: Project | null = null;
  private typeChecker: TypeChecker | null = null;
  private tsconfigPath: string;
  private logger: PluginLogger;
  private endpointPattern = '**/*+server.ts';

  constructor(tsconfigPath: string, logger: PluginLogger) {
    this.tsconfigPath = tsconfigPath;
    this.logger = logger;
  }

  /**
   * Initialize the ts-morph project
   */
  initialize(): void {
    if (this.project) {
      return;
    }

    this.logger.debug(`Initializing project with tsconfig: ${this.tsconfigPath}`);

    this.project = new Project({
      compilerOptions: { allowJs: true },
      tsConfigFilePath: fs.existsSync(this.tsconfigPath) ? this.tsconfigPath : undefined,
      skipAddingFilesFromTsConfig: true,
    });

    this.typeChecker = this.project.getTypeChecker();
  }

  /**
   * Get the ts-morph project instance
   */
  getProject(): Project {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }
    return this.project;
  }

  /**
   * Get the TypeChecker instance
   */
  getTypeChecker(): TypeChecker {
    if (!this.typeChecker) {
      throw new Error('Project not initialized. Call initialize() first.');
    }
    return this.typeChecker;
  }

  /**
   * Add source files matching a glob pattern
   */
  addSourceFiles(pattern: string): SourceFile[] {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    this.logger.debug(`Adding source files matching: ${pattern}`);

    const sourceFiles = this.project.addSourceFilesAtPaths([pattern]);
    this.project.resolveSourceFileDependencies();

    this.logger.debug(`Added ${sourceFiles.length} source files`);

    return sourceFiles;
  }

  /**
   * Add a single source file
   */
  addSourceFile(filePath: string): SourceFile | undefined {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      this.project.resolveSourceFileDependencies();
      return sourceFile;
    } catch (error) {
      this.logger.error(`Failed to add source file ${filePath}: ${error}`);
      return undefined;
    }
  }

  /**
   * Get a source file by path
   */
  getSourceFile(filePath: string): SourceFile | undefined {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    return this.project.getSourceFile(filePath);
  }

  /**
   * Refresh a source file from disk (for file changes)
   */
  refreshSourceFile(filePath: string): SourceFile | undefined {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    const existingFile = this.project.getSourceFile(filePath);

    if (existingFile) {
      // Read fresh content from disk
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        existingFile.replaceWithText(content);
        return existingFile;
      } catch (error) {
        // File might have been deleted
        this.removeSourceFile(filePath);
        return undefined;
      }
    } else {
      // Try to add it as a new file
      return this.addSourceFile(filePath);
    }
  }

  /**
   * Remove a source file from the project
   */
  removeSourceFile(filePath: string): void {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    const sourceFile = this.project.getSourceFile(filePath);
    if (sourceFile) {
      this.project.removeSourceFile(sourceFile);
    }
  }

  /**
   * Get all endpoint files (+server.ts files)
   */
  getEndpointFiles(): SourceFile[] {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    return this.project.getSourceFiles().filter(file => {
      const filePath = file.getFilePath();
      return filePath.endsWith('+server.ts');
    });
  }

  /**
   * Get all source files in the project
   */
  getAllSourceFiles(): SourceFile[] {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    return this.project.getSourceFiles();
  }

  /**
   * Resolve dependencies for all source files
   */
  resolveDependencies(): void {
    if (!this.project) {
      throw new Error('Project not initialized. Call initialize() first.');
    }

    this.project.resolveSourceFileDependencies();
  }

  /**
   * Check if a file exists in the project
   */
  hasSourceFile(filePath: string): boolean {
    if (!this.project) {
      return false;
    }

    return this.project.getSourceFile(filePath) !== undefined;
  }

  /**
   * Get import declarations from a source file
   */
  getImportsFromFile(sourceFile: SourceFile): Array<{
    moduleSpecifier: string;
    namedImports: string[];
    sourceFilePath?: string;
  }> {
    const imports: Array<{
      moduleSpecifier: string;
      namedImports: string[];
      sourceFilePath?: string;
    }> = [];

    for (const importDecl of sourceFile.getImportDeclarations()) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();
      const namedImports = importDecl.getNamedImports().map(ni => ni.getName());
      const sourceFilePath = importDecl.getModuleSpecifierSourceFile()?.getFilePath();

      imports.push({
        moduleSpecifier,
        namedImports,
        sourceFilePath,
      });
    }

    return imports;
  }
}
