# Migration Scripts

This directory contains scripts for migrating stories from local JSON files to Vercel Blob Storage.

## Prerequisites

Before running the migration:

1. **Vercel Blob Storage Token**: You need a Vercel Blob Storage token
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Go to "Blob" or "Storage" section
   - Create a read-write token
   - Add to your `.env.local`:
     ```bash
     BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX
     ```

2. **Existing Stories**: Ensure you have stories in `data/stories.json`

## Migration Process

### Step 1: Run Migration Script

```bash
bun run migrate
```

This script will:
- Read all stories from `data/stories.json`
- Create a backup at `data/stories.backup.json`
- Upload all local images (covers and character photos) to Blob Storage
- Convert stories to the new format with blob URLs
- Upload the final `stories.json` to Blob Storage
- Display the `BLOB_STORIES_URL` that you need to add to your environment

### Step 2: Update Environment Variables

After migration completes, add the output URL to your `.env.local`:

```bash
BLOB_STORIES_URL=https://your-blob-url.blob.vercel-storage.com/stories.json
```

### Step 3: Validate Migration

```bash
bun run validate-stories
```

This will:
- Fetch stories from Blob Storage
- Validate all story data
- Report any errors or issues
- Confirm successful migration

## Scripts Reference

### migrate-to-blob.ts

**Purpose**: Migrate existing JSON stories to Blob Storage

**What it does**:
- Reads `data/stories.json`
- Creates backup file
- Uploads images to Blob Storage
- Updates story objects with Blob URLs
- Uploads final stories.json to Blob

**Output**:
- Backup file: `data/stories.backup.json`
- Console output with migration progress
- `BLOB_STORIES_URL` to add to environment

### validate-stories.ts

**Purpose**: Validate stories data integrity

**What it checks**:
- All required fields are present
- Content type matches content structure
- URLs are valid (absolute or relative)
- Array fields are properly structured
- Labels exist and are valid

**Output**:
- Count of valid/invalid stories
- Detailed error messages for invalid stories

## Story Format

After migration, stories will have this structure:

```typescript
{
  id: string;
  title: string;
  author: string;
  description: string;
  labels: string[];
  featured?: boolean;
  createdAt: string;
  contentType: 'text' | 'images' | 'mixed';
  
  // Content (based on contentType)
  story?: string;                    // For text stories
  imageUrls?: string[];              // For image stories
  mixedContent?: MixedContent[];     // For mixed stories
  
  // Blob URLs (replaced from local paths)
  coverImage: string;                // Blob URL
  characterPhoto: string;            // Blob URL
  
  // Metadata
  metadata?: {
    uploadDate: string;
    lastModified: string;
  };
}
```

## Rollback

If you need to rollback:

1. Your original data is backed up at `data/stories.backup.json`
2. Copy it back to `data/stories.json`:
   ```bash
   cp data/stories.backup.json data/stories.json
   ```
3. Remove or comment out `BLOB_STORIES_URL` from `.env.local`
4. The app will fall back to reading from local JSON

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not set"

**Solution**: Add the token to your `.env.local` file

### Error: "Failed to upload cover/character photo"

**Possible causes**:
- Image file doesn't exist at the path
- File is corrupted
- Network issue

**Solution**: Check that images exist in `public/images/` directory

### Error: "Failed to upload stories.json"

**Possible causes**:
- Invalid Blob token
- Network issue
- Blob storage quota exceeded

**Solution**: 
- Verify your Blob token is correct
- Check your Vercel dashboard for storage limits
- Try again after a few minutes

### Validation Errors

If validation fails after migration, check:
- Story structure matches the expected format
- All required fields are present
- URLs are accessible
- Content type matches the content provided

## Testing

Run the validator tests:

```bash
bun test lib/story-validator.test.ts
```

This ensures the validation logic is working correctly before migration.

## Environment Variables Summary

```bash
# Required for migration
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_XXXXXXXXXX

# Required for production (after migration)
BLOB_STORIES_URL=https://your-blob-url.blob.vercel-storage.com/stories.json

# Optional: KV store for settings
KV_REST_API_URL=https://your-kv-url.upstash.io
KV_REST_API_TOKEN=XXXXXXXXXX
```

## Next Steps

After successful migration:

1. Test the application locally with the new Blob URLs
2. Deploy to Vercel
3. Verify stories load correctly in production
4. Keep the backup file for safety
5. Consider setting up automated backups of Blob data
