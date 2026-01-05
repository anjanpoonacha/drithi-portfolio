import type { Story } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateStory(story: Story): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!story.id) errors.push('Story ID is required');
  if (!story.title) errors.push('Title is required');
  if (!story.author) errors.push('Author is required');
  if (!story.description) errors.push('Description is required');
  if (!story.contentType) errors.push('Content type is required');
  if (!story.createdAt) errors.push('Creation date is required');

  // Content validation
  if (story.contentType === 'text' && !story.story) {
    errors.push('Text story must have story content');
  }

  if (story.contentType === 'images' && (!story.imageUrls || story.imageUrls.length === 0)) {
    errors.push('Image story must have at least one page');
  }

  if (story.contentType === 'mixed' && (!story.mixedContent || story.mixedContent.length === 0)) {
    errors.push('Mixed story must have content');
  }

  // Array fields
  if (!Array.isArray(story.labels)) {
    errors.push('Labels must be an array');
  }

  // URL validation (basic check)
  const urlFields = [
    { name: 'coverImage', value: story.coverImage },
    { name: 'characterPhoto', value: story.characterPhoto },
  ];

  for (const field of urlFields) {
    if (field.value && !isValidUrl(field.value)) {
      errors.push(`${field.name} must be a valid URL`);
    }
  }

  if (story.imageUrls) {
    story.imageUrls.forEach((url, index) => {
      if (!isValidUrl(url)) {
        errors.push(`Image URL at index ${index} is invalid`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check if it's a relative path (also valid)
    return url.startsWith('/');
  }
}

export async function checkImageAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

export async function validateStoriesData(stories: Story[]): Promise<{
  valid: boolean;
  validCount: number;
  invalidCount: number;
  errors: Array<{ storyId: string; errors: string[] }>;
}> {
  let validCount = 0;
  let invalidCount = 0;
  const allErrors: Array<{ storyId: string; errors: string[] }> = [];

  for (const story of stories) {
    const result = validateStory(story);
    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
      allErrors.push({
        storyId: story.id,
        errors: result.errors,
      });
    }
  }

  return {
    valid: invalidCount === 0,
    validCount,
    invalidCount,
    errors: allErrors,
  };
}
