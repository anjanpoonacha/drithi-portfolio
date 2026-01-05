# Storage Configuration Guide

## Overview

The application uses Vercel Blob Storage for storing stories and images. The storage configuration is designed to keep only the **base URL** in environment variables, while **storage paths** are defined in code.

## Environment Variables

### Required

```bash
# Base URL only - no paths included
BLOB_BASE_URL="https://your-project.public.blob.vercel-storage.com"

# Access token for read/write operations
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
```

### How to Get These Values

1. **Via Vercel Dashboard:**
   - Go to your project on https://vercel.com
   - Navigate to **Storage** tab
   - Select your Blob store
   - Copy the base URL (remove any path like `/stories.json`)
   - Copy the `BLOB_READ_WRITE_TOKEN`

2. **Via Vercel CLI:**
   ```bash
   vercel env pull .env.local
   ```

## Storage Paths

Storage paths are defined in `lib/constants.ts`:

```typescript
export const STORAGE_PATHS = {
  /** Main stories data file */
  STORIES_JSON: '/stories.json',
  
  /** Directory for story images */
  STORY_IMAGES: '/stories',
} as const;
```

## How It Works

The `getBlobUrl()` function in `lib/blob-utils.ts` combines the base URL with paths:

```typescript
function getBlobUrl(path: string): string {
  const baseUrl = process.env.BLOB_BASE_URL;
  if (!baseUrl) {
    throw new Error('BLOB_BASE_URL environment variable is not configured');
  }
  return `${baseUrl}${path}`;
}

// Example usage:
const storiesUrl = getBlobUrl(STORAGE_PATHS.STORIES_JSON);
// Result: "https://your-project.public.blob.vercel-storage.com/stories.json"
```

## Benefits of This Approach

1. **Separation of Concerns:** Environment variables contain only configuration, not structure
2. **Type Safety:** Paths are defined as constants with TypeScript types
3. **Easy to Update:** Change paths in one place (`constants.ts`) instead of updating `.env`
4. **Security:** Base URL can be public, while the token remains secret
5. **Flexibility:** Easy to add new storage paths without touching environment variables

## Migration from Old Setup

**Before:**
```bash
BLOB_STORIES_URL="https://xyz.blob.vercel-storage.com/stories.json"
```

**After:**
```bash
BLOB_BASE_URL="https://xyz.blob.vercel-storage.com"
```

The path `/stories.json` is now defined in `STORAGE_PATHS.STORIES_JSON`.

## Adding New Storage Paths

To add a new storage path:

1. Add it to `STORAGE_PATHS` in `lib/constants.ts`:
   ```typescript
   export const STORAGE_PATHS = {
     STORIES_JSON: '/stories.json',
     STORY_IMAGES: '/stories',
     NEW_PATH: '/new-folder/file.json', // Add here
   } as const;
   ```

2. Use it in your code:
   ```typescript
   import { STORAGE_PATHS } from '@/lib/constants';
   
   const url = getBlobUrl(STORAGE_PATHS.NEW_PATH);
   ```

No environment variable changes needed!
