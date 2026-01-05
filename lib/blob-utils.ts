/**
 * Vercel Blob Storage utility functions
 * @module blob-utils
 */

import { put, del, list } from '@vercel/blob';
import type { Story } from './types';
import { BLOB_STORAGE, STORAGE_PATHS } from './constants';

/**
 * Get full blob URL from base URL and path
 * @param path - Relative path (e.g., '/stories.json')
 * @returns Full URL
 */
function getBlobUrl(path: string): string {
  const baseUrl = process.env.BLOB_BASE_URL;
  if (!baseUrl) {
    throw new Error('BLOB_BASE_URL environment variable is not configured');
  }
  return `${baseUrl}${path}`;
}

/**
 * Upload image to Vercel Blob Storage
 * @param file - File to upload
 * @param path - Storage path for the file
 * @returns Public URL of uploaded file
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  return blob.url;
}

/**
 * Delete image from Vercel Blob Storage
 * @param url - URL of the file to delete
 */
export async function deleteImage(url: string): Promise<void> {
  await del(url);
}

/**
 * Calculate total storage usage across all blobs
 * @returns Storage statistics
 */
export async function calculateStorageUsage(): Promise<{
  totalSize: number;
  fileCount: number;
  storiesCount: number;
}> {
  const { blobs } = await list();
  
  let totalSize = 0;
  let storiesCount = 0;
  
  for (const blob of blobs) {
    totalSize += blob.size;
    if (blob.pathname.includes('stories.json')) {
      storiesCount++;
    }
  }
  
  return {
    totalSize,
    fileCount: blobs.length,
    storiesCount,
  };
}

/**
 * Check if storage limit is exceeded
 * @returns Storage status with warnings
 */
export async function checkStorageLimit(): Promise<{
  canUpload: boolean;
  currentSize: number;
  percentUsed: number;
  warning?: string;
}> {
  const { totalSize } = await calculateStorageUsage();
  const percentUsed = (totalSize / BLOB_STORAGE.MAX_TOTAL_SIZE) * 100;
  
  let warning;
  if (totalSize >= BLOB_STORAGE.CRITICAL_THRESHOLD) {
    warning = 'Storage almost full! Cannot upload more files.';
  } else if (totalSize >= BLOB_STORAGE.WARNING_THRESHOLD) {
    warning = 'Storage usage is high. Consider optimizing images.';
  }
  
  return {
    canUpload: totalSize < BLOB_STORAGE.CRITICAL_THRESHOLD,
    currentSize: totalSize,
    percentUsed,
    warning,
  };
}

/**
 * Fetch all stories from Blob Storage
 * @returns Array of stories
 */
export async function fetchStoriesFromBlob(): Promise<Story[]> {
  try {
    const storiesUrl = getBlobUrl(STORAGE_PATHS.STORIES_JSON);
    
    const response = await fetch(storiesUrl);
    if (!response.ok) {
      console.error('Failed to fetch stories from blob:', response.statusText);
      return [];
    }
    
    const data = await response.json();
    return data.stories || [];
  } catch (error) {
    console.error('Error fetching stories from blob:', error);
    return [];
  }
}

/**
 * Save stories to Blob Storage
 * @param stories - Array of stories to save
 * @returns Public URL of the saved stories.json file
 */
export async function saveStoriesToBlob(stories: Story[]): Promise<string> {
  const blob = await put('stories.json', JSON.stringify({ stories }, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}
