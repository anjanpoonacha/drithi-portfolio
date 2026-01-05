import { fetchStoriesFromBlob } from '@/lib/blob-utils';
import { validateStoriesData } from '@/lib/story-validator';

async function validateStories() {
  console.log('🔍 Validating stories...\n');

  try {
    const stories = await fetchStoriesFromBlob();
    console.log(`📚 Found ${stories.length} stories\n`);

    const result = await validateStoriesData(stories);

    if (result.valid) {
      console.log(`✅ All ${result.validCount} stories are valid!`);
    } else {
      console.log(`⚠️  Validation results:`);
      console.log(`  ✓ Valid: ${result.validCount}`);
      console.log(`  ✗ Invalid: ${result.invalidCount}\n`);

      console.log('Errors:');
      result.errors.forEach(({ storyId, errors }) => {
        console.log(`\n  Story ID: ${storyId}`);
        errors.forEach((error) => {
          console.log(`    - ${error}`);
        });
      });
    }
  } catch (error) {
    console.error('❌ Failed to validate stories:', error);
  }
}

validateStories().catch(console.error);
