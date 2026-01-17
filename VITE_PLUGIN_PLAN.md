# Vite Plugin Conversion Plan

Converting svetch from a CLI scanner to a Vite plugin with smart incremental regeneration.

## Overview

- **Goal**: Auto-regenerate types when endpoints or their dependencies change
- **No backwards compatibility** with CLI
- **Smart regeneration**: Only affected endpoints regenerate

---

## Phase 1: Core Infrastructure

### Task 1.1: Create Plugin Types and Configuration
- [x] Create `/src/vite-plugin/types.ts` with plugin options interface
- [x] Define `SvetchPluginOptions` type
- [x] Define internal state types (`DependencyNode`, `DependencyGraph`, `ProcessedEndpoint`)

**Acceptance Criteria:**
- [x] All types are properly exported
- [x] Types cover all plugin configuration options
- [x] Types are compatible with existing `EndpointDefinition` from `types/core.ts`

### Task 1.2: Create Plugin Entry Point Skeleton
- [x] Create `/src/vite-plugin/index.ts` with Vite plugin structure
- [x] Implement `configResolved` hook
- [x] Implement `buildStart` hook (stub)
- [x] Implement `configureServer` hook (stub)
- [x] Implement `handleHotUpdate` hook (stub)
- [x] Export `svetchPlugin` function

**Acceptance Criteria:**
- [x] Plugin can be imported and added to Vite config without errors
- [x] All lifecycle hooks are present (even if stubbed)
- [x] Plugin has correct name and structure

### Task 1.3: Implement Project Manager
- [x] Create `/src/vite-plugin/core/project-manager.ts`
- [x] Implement `initialize(tsconfig)` method
- [x] Implement `getEndpointFiles(pattern)` method
- [x] Implement `updateSourceFile(filePath)` method
- [x] Implement `removeSourceFile(filePath)` method
- [x] Implement `getTypeChecker()` method

**Acceptance Criteria:**
- [x] Can initialize ts-morph Project with tsconfig
- [x] Can retrieve source files matching glob pattern
- [x] Can incrementally update individual source files
- [x] TypeChecker is accessible for type analysis

### Task 1.4: Implement Dependency Tracker
- [x] Create `/src/vite-plugin/core/dependency-tracker.ts`
- [x] Implement `buildInitialGraph(endpointPattern)` method
- [x] Implement `collectDependencies(sourceFile)` - traverse imports recursively
- [x] Implement `updateNode(filePath)` - update graph when file changes
- [x] Implement `getAffectedEndpoints(changedFile)` - find all endpoints affected by a change
- [x] Implement `isTrackedFile(filePath)` - check if file is in the graph
- [x] Handle circular dependencies safely

**Acceptance Criteria:**
- [x] Graph correctly tracks endpoint → dependency relationships
- [x] Transitive dependencies are tracked (A→B→C)
- [x] `getAffectedEndpoints` returns correct set when dependency changes
- [x] No infinite loops with circular dependencies
- [x] External/node_modules dependencies are ignored

### Task 1.5: Implement Cache Manager
- [x] Create `/src/vite-plugin/core/cache-manager.ts`
- [x] Implement `computeHash(filePath)` - SHA-256 of file content
- [x] Implement `hasFileChanged(filePath)` - compare hash to cached
- [x] Implement `getEndpointCache(endpointPath)` - retrieve cached endpoint
- [x] Implement `saveEndpointCache(endpoint)` - store processed endpoint
- [x] Implement `loadCache()` - load from disk on startup
- [x] Implement `saveCache()` - persist to disk
- [x] Implement `getAllEndpoints()` - get all cached endpoints

**Acceptance Criteria:**
- [x] File changes are detected via hash comparison
- [x] Cache persists across restarts (`.svetch-cache/` directory)
- [x] Cache can be loaded and saved without data loss
- [x] Individual endpoints can be cached/retrieved

---

## Phase 2: Refactor Endpoint Processing

### Task 2.1: Extract Shared Utilities
- [x] Reuse existing extractors from `/src/utils/endpoint_extractors.ts`
- [x] Reuse existing type processing from `/src/utils/svelte-codegen.ts`
- [x] No need for separate files - existing utilities work as stateless functions

**Acceptance Criteria:**
- [x] Each extractor is a pure function (no global state)
- [x] Functions accept ts-morph nodes and return typed results
- [x] Existing type formatting logic is preserved
- [x] All extractors are independently testable

### Task 2.2: Create Endpoint Processor
- [x] Create `/src/vite-plugin/core/endpoint-processor.ts`
- [x] Implement `processEndpointFile(sourceFile)` - main entry point
- [x] Implement `getHttpMethodDeclarations(sourceFile)` - find GET/POST/etc exports
- [x] Implement `processDeclaration(method, declaration)` - extract all info for one method
- [x] Implement `filePathToApiPath(filePath)` - convert file path to API route
- [x] Implement `collectTypeImports(sourceFile)` - gather imports for generated code
- [x] Remove all global state from processing logic

**Acceptance Criteria:**
- [x] Can process a single endpoint file and return `ProcessedEndpoint`
- [x] Extracts: path params, query params, body type, response types, error types
- [x] No module-level mutable state
- [x] Returns complete information needed for code generation

### Task 2.3: Integrate with Existing Parsers
- [x] Ensure SvelteKit response parser works with new processor
- [x] Adapt error extraction to work with new architecture
- [x] Preserve JSDoc comment extraction

**Acceptance Criteria:**
- [x] Response parsing produces same output as current generator
- [x] Error types are correctly extracted
- [x] Documentation comments are preserved in output

---

## Phase 3: Output Generation

### Task 3.1: Create Incremental Writer
- [x] Integrated into `/src/vite-plugin/output/generator.ts`
- [x] Implement `writeFile(path, content)` - write only if changed
- [x] Implement file comparison before writing
- [x] Create directories as needed

**Acceptance Criteria:**
- [x] Files are only written if content changed (prevents unnecessary HMR)
- [x] Obsolete files are cleaned up when endpoints are removed
- [x] Directory structure is created automatically

### Task 3.2: Create Per-Endpoint Type Generator
- [x] Integrated into `/src/vite-plugin/output/generator.ts`
- [x] Generate types per endpoint within `api.ts`
- [x] All HTTP methods as interfaces
- [x] Handle type imports correctly

**Acceptance Criteria:**
- [x] All endpoints included in `api.ts`
- [x] All method types (GET, POST, etc.) are included
- [x] Type imports are correctly resolved and included

### Task 3.3: Create Barrel and Aggregation Generator
- [x] Integrated into `/src/vite-plugin/output/generator.ts`
- [x] Generate main `api.ts` with all types
- [x] Generate HTTP method interfaces (GET, POST, PUT, PATCH, DELETE)
- [x] Include path-to-type mappings

**Acceptance Criteria:**
- [x] `api.ts` has complete type mappings for all HTTP methods
- [x] Type structure is compatible with existing client.ts template

### Task 3.4: Create Client Generator
- [x] Integrated into `/src/vite-plugin/output/generator.ts`
- [x] Copy existing client template
- [x] Client works with generated types

**Acceptance Criteria:**
- [x] Generated client has full type safety
- [x] Client methods work with type structure
- [x] Autocomplete works for all endpoints and methods

### Task 3.5: Create OpenAPI Generator
- [x] Integrated into `/src/vite-plugin/output/generator.ts`
- [x] Reuse existing TSOA integration from `/src/utils/tsoa.ts`
- [x] Generate OpenAPI schema from processed endpoints

**Acceptance Criteria:**
- [x] OpenAPI schema is generated correctly
- [x] Schema includes all endpoints and their types
- [x] Compatible with Swagger UI

### Task 3.6: Create Main Output Generator
- [x] Create `/src/vite-plugin/output/generator.ts`
- [x] Implement `generateIncremental(changedEndpoints, allEndpoints)` - incremental generation
- [x] Implement `generateFull(allEndpoints)` - full generation for production
- [x] Orchestrate all sub-generators
- [x] Handle file writing

**Acceptance Criteria:**
- [x] Incremental generation only writes changed files
- [x] Full generation produces complete output
- [x] All output types (types, client, OpenAPI, docs) are generated

---

## Phase 4: Vite Integration

### Task 4.1: Implement Build Start Hook
- [x] Initialize ProjectManager in `buildStart`
- [x] Initialize DependencyTracker with initial graph
- [x] Load cache from disk
- [x] Process all endpoints (respecting cache)
- [x] Generate initial output

**Acceptance Criteria:**
- [x] Full type generation runs on `vite dev` start
- [x] Full type generation runs on `vite build`
- [x] Cached endpoints are not re-processed unless changed
- [x] Output files exist after buildStart completes

### Task 4.2: Implement Dev Server File Watching
- [x] Set up file watcher for input directory in `configureServer`
- [x] Track files in dependency graph
- [x] Implement change batching/debouncing (100ms)

**Acceptance Criteria:**
- [x] File watcher monitors all relevant files
- [x] Multiple rapid changes are batched
- [x] Watcher includes both endpoints and their dependencies

### Task 4.3: Implement Hot Update Handler
- [x] Check if changed file is tracked in `handleHotUpdate`
- [x] Get affected endpoints from dependency tracker
- [x] Process only affected endpoints
- [x] Update dependency graph
- [x] Generate incremental output
- [x] Trigger HMR reload

**Acceptance Criteria:**
- [x] Only affected endpoints are regenerated
- [x] Types update within ~200ms of file save
- [x] HMR triggers correctly after regeneration
- [x] Dependency graph stays accurate after changes

### Task 4.4: Implement Production Build
- [x] Full regeneration in `buildStart` for build mode
- [x] Cache used for faster builds
- [x] Ensure all output files are generated

**Acceptance Criteria:**
- [x] `vite build` produces all type files
- [x] Output is identical whether cached or not
- [x] Build completes without errors

---

## Phase 5: Cleanup and Migration

### Task 5.1: Remove CLI Code
- [x] Delete `/src/bin.ts`
- [x] Delete `/bin.ts`
- [x] Delete `/src/init.ts`
- [ ] Remove CLI argument parsing from `/src/index.ts` (keeping generator.ts for reference)
- [x] Remove `bin` entry from package.json
- [ ] Telemetry can be removed later

**Acceptance Criteria:**
- [x] CLI entry points removed
- [x] Package no longer has `bin` entry in package.json
- [ ] Final cleanup of old code can be done later

### Task 5.2: Update Package Configuration
- [x] Update `package.json` exports to point to Vite plugin
- [x] Add `vite` as peer dependency
- [x] Remove CLI-related dependencies (ora, prompts)
- [x] Update package description
- [x] Bump version to 3.0.0

**Acceptance Criteria:**
- [x] `import { svetchPlugin } from 'svetch.ts'` works
- [x] Peer dependency on Vite is declared
- [x] Package installs without warnings

### Task 5.3: Update Build Configuration
- [ ] Update `build.config.ts` for new entry point (if needed)
- [ ] Ensure TypeScript declarations are generated
- [ ] Test build output

**Acceptance Criteria:**
- [ ] `npm run build` succeeds
- [ ] Output includes `.d.ts` files
- [ ] Output is importable as ES module and CommonJS

### Task 5.4: Update Documentation
- [ ] Update README with Vite plugin usage
- [ ] Document configuration options
- [ ] Add migration guide from CLI

**Acceptance Criteria:**
- [ ] README shows how to add plugin to vite.config.ts
- [ ] All options are documented
- [ ] Breaking changes are clearly noted

### Task 5.5: Clean Up Old Code
- [ ] Remove unused utility files
- [ ] Remove unused type definitions
- [ ] Remove old test fixtures if any

**Acceptance Criteria:**
- [ ] No dead code in repository
- [ ] All imports resolve correctly
- [ ] No TypeScript errors

---

## Progress Tracking

| Phase | Status | Tasks Complete |
|-------|--------|----------------|
| Phase 1: Core Infrastructure | Complete | 5/5 |
| Phase 2: Refactor Processing | Complete | 3/3 |
| Phase 3: Output Generation | Complete | 6/6 |
| Phase 4: Vite Integration | Complete | 4/4 |
| Phase 5: Cleanup | In Progress | 2/5 |

**Total Progress: 20/23 tasks**

### Remaining Tasks:
- Update build configuration for proper .d.ts generation
- Update README documentation
- Final cleanup of old code
