import { put } from '@vercel/blob';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface OldStory {
  id: string;
  title: string;
  author: string;
  labels: string[];
  characterPhoto: string;
  coverImage: string;
  description: string;
  story: string;
  featured: boolean;
  createdAt: string;
}

async function migrateToBlob() {
  console.log('🚀 Starting migration to Blob Storage...\n');

  // Read existing stories
  const storiesPath = join(process.cwd(), 'data', 'stories.json');
  const storiesData = JSON.parse(readFileSync(storiesPath, 'utf-8'));
  const oldStories: OldStory[] = storiesData.stories || [];

  console.log(`📚 Found ${oldStories.length} stories to migrate\n`);

  // Create backup
  const backupPath = join(process.cwd(), 'data', 'stories.backup.json');
  writeFileSync(backupPath, JSON.stringify(storiesData, null, 2));
  console.log(`💾 Backup created at: ${backupPath}\n`);

  const migratedStories = [];

  for (let i = 0; i < oldStories.length; i++) {
    const story = oldStories[i];
    if (!story) {
      console.error(`  ❌ Story at index ${i} is undefined`);
      continue;
    }

    console.log(`\n📖 Migrating story ${i + 1}/${oldStories.length}: "${story.title}"`);

    try {
      let coverImageUrl = story.coverImage;
      let characterPhotoUrl = story.characterPhoto;

      // Upload cover image if it's a local path
      if (story.coverImage && story.coverImage.startsWith('/images/')) {
        console.log('  ↑ Uploading cover image...');
        const imagePath = join(process.cwd(), 'public', story.coverImage);
        try {
          const imageBuffer = readFileSync(imagePath);
          const imageFile = new File([imageBuffer], `cover-${story.id}.jpg`, {
            type: 'image/jpeg',
          });
          const blob = await put(`covers/${story.id}.jpg`, imageFile, {
            access: 'public',
          });
          coverImageUrl = blob.url;
          console.log(`  ✓ Cover uploaded: ${blob.url}`);
        } catch (err) {
          console.error(`  ✗ Failed to upload cover:`, err);
        }
      }

      // Upload character photo if it's a local path
      if (story.characterPhoto && story.characterPhoto.startsWith('/images/')) {
        console.log('  ↑ Uploading character photo...');
        const imagePath = join(process.cwd(), 'public', story.characterPhoto);
        try {
          const imageBuffer = readFileSync(imagePath);
          const imageFile = new File([imageBuffer], `character-${story.id}.jpg`, {
            type: 'image/jpeg',
          });
          const blob = await put(`characters/${story.id}.jpg`, imageFile, {
            access: 'public',
          });
          characterPhotoUrl = blob.url;
          console.log(`  ✓ Character photo uploaded: ${blob.url}`);
        } catch (err) {
          console.error(`  ✗ Failed to upload character photo:`, err);
        }
      }

      // Create migrated story
      const migratedStory = {
        id: story.id,
        title: story.title,
        author: story.author,
        description: story.description,
        labels: story.labels,
        featured: story.featured,
        createdAt: story.createdAt,
        contentType: 'text' as const,
        story: story.story,
        coverImage: coverImageUrl,
        characterPhoto: characterPhotoUrl,
        metadata: {
          uploadDate: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        },
      };

      migratedStories.push(migratedStory);
      console.log(`  ✅ Story "${story.title}" migrated successfully`);
    } catch (error) {
      console.error(`  ❌ Error migrating story "${story.title}":`, error);
    }
  }

  // Upload stories.json to Blob
  console.log(`\n📤 Uploading stories.json to Blob Storage...`);
  try {
    const storiesBlob = await put(
      'stories.json',
      JSON.stringify({ stories: migratedStories }, null, 2),
      {
        access: 'public',
        contentType: 'application/json',
      }
    );

    console.log(`✅ Stories JSON uploaded: ${storiesBlob.url}`);
    console.log(`\n🎉 Migration complete!`);
    console.log(`\n📝 Add this to your .env.local:`);
    
    // Extract base URL from the full URL
    const url = new URL(storiesBlob.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    console.log(`BLOB_BASE_URL=${baseUrl}`);
  } catch (error) {
    console.error(`❌ Failed to upload stories.json:`, error);
  }
}

migrateToBlob().catch(console.error);
