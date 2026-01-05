/**
 * Application constants for Drithi's Story Website
 * @module constants
 */

/**
 * Vercel Blob Storage limits and configuration
 */
export const BLOB_STORAGE = {
  /** Maximum total storage size (500MB free tier) */
  MAX_TOTAL_SIZE: 500 * 1024 * 1024, // 500MB
  
  /** Warning threshold (80% of max) */
  WARNING_THRESHOLD: 400 * 1024 * 1024, // 400MB
  
  /** Critical threshold (90% of max) */
  CRITICAL_THRESHOLD: 450 * 1024 * 1024, // 450MB
  
  /** Maximum size per file */
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  /** Maximum number of images per story */
  MAX_IMAGES_PER_STORY: 50,
} as const;

/**
 * Storage paths (relative to BLOB_BASE_URL)
 */
export const STORAGE_PATHS = {
  /** Main stories data file */
  STORIES_JSON: '/stories.json',
  
  /** Directory for story images */
  STORY_IMAGES: '/stories',
} as const;

/**
 * Image optimization settings
 */
export const IMAGE_OPTIMIZATION = {
  /** Target file size in KB for handwritten pages */
  TARGET_SIZE_KB: 200,
  
  /** Maximum width for handwritten pages */
  MAX_WIDTH: 1200,
  
  /** Maximum height for handwritten pages */
  MAX_HEIGHT: 1600,
  
  /** JPEG compression quality (0-1) */
  QUALITY: 0.85,
  
  /** Accepted image formats */
  FORMATS: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Admin configuration
 */
export const ADMIN = {
  /** Environment variable key for admin password */
  PASSWORD_ENV_KEY: 'ADMIN_PASSWORD',
  
  /** Default author name for stories */
  DEFAULT_AUTHOR: 'Drithi',
} as const;
