[![npm](https://img.shields.io/npm/v/svetch.ts)](https://www.npmjs.com/package/svetch.ts)
![svetch-chan (1)](https://github.com/Bewinxed/svetch/assets/9145989/67c36f21-a21e-42f1-ba50-42f457948c46)

# Svetch.ts: Vite Plugin for Zero-Effort Typesafe API Client Generation

_Typesafety, Minus the typing_

Automatically generate a typesafe Fetch client for your SvelteKit applications with full intellisense, OpenAPI schema generation, and Swagger docs.

## What's New in v3.0

**Svetch is now a Vite plugin!** No more running CLI commands manually - types regenerate automatically when you save your API files.

### Key Features

- **Smart Incremental Regeneration**: Only regenerates types for endpoints that changed or depend on changed files
- **Dependency Tracking**: When a shared type changes, all affected endpoints are automatically regenerated
- **Fast Caching**: SHA-256 hash-based caching for instant rebuilds
- **Zero Configuration**: Works out of the box with sensible defaults

## Installation

```bash
npm install svetch.ts
```

## Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import { svetchPlugin } from 'svetch.ts';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit(),
    svetchPlugin({
      input: 'src/routes/api',      // Directory containing your API routes
      output: 'src/lib/api',        // Where to generate types and client
      docs: 'src/routes/docs',      // Where to generate Swagger docs (optional)
    })
  ]
});
```

That's it! Types will be generated automatically when you:
- Start the dev server (`vite dev`)
- Build your project (`vite build`)
- Save any `+server.ts` file or its dependencies

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `input` | `string` | **required** | Directory containing API routes to scan |
| `output` | `string` | **required** | Output directory for generated types |
| `tsconfig` | `string` | `'tsconfig.json'` | Path to tsconfig.json |
| `framework` | `'sveltekit'` | `'sveltekit'` | Framework (currently only SvelteKit) |
| `docs` | `string` | `'src/routes/docs'` | Output directory for documentation |
| `staticFolder` | `string` | `'static'` | Static folder for OpenAPI schemas |
| `logLevel` | `number` | `2` | Log verbosity (0-5) |

## Automatic Detection

Svetch automatically detects and extracts types from your endpoint files:

| Feature | Detection Method |
|---------|------------------|
| **Query Params** | `url.searchParams.get('param')` calls |
| **Path Params** | From file path: `[user_id]` → `:user_id` |
| **Request Body** | `const payload: X = await request.json()` or `as X` |
| **Response Types** | `json(X)` or `new Response(X)` with status codes |
| **Error Types** | `throw error()`, `throw new Error()`, SvelteKit `error()` |

## Usage

### Using the Generated Client

```typescript
import { Svetch } from '$lib/api/client';

const svetch = new Svetch({
  baseUrl: '/api',
  fetch,
});

// Full intellisense for paths, params, and responses!
const response = await svetch.post('user/[user_id]', {
  path: { user_id: 1 },
  body: {
    name: 'John',
    email: 'john@example.com',
  },
});

if (response.error) {
  console.error(response.error);
} else {
  console.log(response.data);
}
```

### In SvelteKit Load Functions

```typescript
import { Svetch } from '$lib/api/client';

export async function load({ fetch }) {
  const svetch = new Svetch({
    baseUrl: '/api',
    fetch, // Pass the load function's fetch
  });

  const { data, error } = await svetch.get('users');

  if (error) throw new Error(error);

  return { users: data };
}
```

## Generated Files

The plugin generates the following files in your output directory:

| File | Description |
|------|-------------|
| `api.ts` | TypeScript types for all endpoints |
| `client.ts` | Typesafe Svetch client class |
| `interfaces.ts` | Helper interfaces |

Additionally, in your static folder:
- `schemas/*.json` - OpenAPI schemas

And in your docs folder:
- `+page.svelte` - Swagger UI documentation

## Migration from v2.x (CLI)

If you were using the CLI version:

1. Remove `.svetchrc` configuration file
2. Remove `npx svetch.ts` from your build scripts
3. Add the Vite plugin to `vite.config.ts` as shown above
4. The generated output format is the same, so your existing client code should work

## How It Works

1. **Initial Scan**: On dev server start, scans all `+server.ts` files
2. **Dependency Graph**: Builds a graph of which endpoints depend on which files
3. **Type Extraction**: Uses ts-morph to extract type information via AST analysis
4. **Incremental Updates**: When a file changes, only regenerates affected endpoints
5. **Caching**: Caches processed endpoints with content hashes for fast rebuilds

## Requirements

- Vite 4.x, 5.x, or 6.x
- SvelteKit
- TypeScript

## Advantages

- No code changes required to your existing API code
- Full intellisense for API paths, parameters, and responses
- Automatic OpenAPI schema and Swagger docs generation
- Handles multiple possible responses per HTTP code
- Smart incremental regeneration for fast development

## License

This library is **Free** for personal use. If it's useful to you, please consider purchasing a license @ https://petrasolutions.lemonsqueezy.com/checkout/buy/19210e05-ae3c-41a0-920c-324e3083618d

Redistribution/Forking is **Not** Allowed.
