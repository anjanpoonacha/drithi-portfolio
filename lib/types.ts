/**
 * Core data types for Drithi's Story Website
 * @module types
 */

/**
 * Story content types
 */
export type StoryContentType = 'text' | 'images' | 'mixed';

/**
 * Metadata for story files and uploads
 */
export interface StoryMetadata {
  /** Date when story was uploaded */
  uploadDate: string;
  
  /** Last modification date */
  lastModified?: string;
  
  /** Total size in bytes */
  fileSize?: number;
  
  /** Number of images in the story */
  imageCount?: number;
}

/**
 * Mixed content element (text or image)
 */
export interface MixedContent {
  /** Content type */
  type: 'text' | 'image';
  
  /** Text content or image URL */
  data: string;
  
  /** Display order */
  order: number;
}

/**
 * Represents a story written by Drithi
 */
export interface Story {
  /** Unique identifier for the story */
  id: string;
  
  /** Title of the story */
  title: string;
  
  /** Category labels (e.g., "Adventure", "Moral Tales") */
  labels: string[];
  
  /** Path to character image used in story detail view (can be Blob URL) */
  characterPhoto: string;
  
  /** Path to book cover image displayed on story cards (can be Blob URL) */
  coverImage: string;
  
  /** Short preview/teaser text (1-2 sentences) */
  description: string;
  
  /** Author name (typically "Drithi") */
  author: string;
  
  /** ISO 8601 date string when story was created */
  createdAt: string;
  
  /** Whether to feature this story on homepage */
  featured?: boolean;
  
  // New fields for dynamic content
  
  /** Content type (text, images, or mixed) */
  contentType: StoryContentType;
  
  /** Full story content (for text stories, kept for backward compatibility) */
  story?: string;
  
  /** Array of page image URLs (for handwritten/image stories) */
  imageUrls?: string[];
  
  /** Mixed content elements (for stories with both text and images) */
  mixedContent?: MixedContent[];
  
  /** Story metadata (upload info, file sizes, etc.) */
  metadata?: StoryMetadata;
}

/**
 * Filter criteria for story browsing
 */
export interface FilterOptions {
  /** Search query string for filtering stories by title/description */
  searchQuery: string;
  
  /** Selected category label, or null for "All Categories" */
  selectedCategory: string | null;
}

/**
 * Category label type
 */
export type Category = string;

/**
 * Helper type for story cards/previews (excludes full story content)
 */
export type StoryPreview = Omit<Story, 'story'>;

/**
 * Helper type for partial story updates
 */
export type PartialStory = Partial<Story> & Pick<Story, 'id'>;

/**
 * Global settings for festival theming
 */
export interface GlobalSettings {
  /** Auto-detect festival based on current date */
  autoDetectFestival: boolean;
  
  /** Manually selected festival ID (used when autoDetectFestival is false) */
  manualFestivalId: string | null;
  
  /** Decoration intensity level (1-5) */
  decorationIntensity: 1 | 2 | 3 | 4 | 5;
  
  /** Enable/disable cherry blossom accents */
  enableCherryBlossoms: boolean;
  
  /** Enable/disable festival decorations */
  enableFestivalDecor: boolean;
}
