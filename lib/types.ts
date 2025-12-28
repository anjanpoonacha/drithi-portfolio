/**
 * Core data types for Drithi's Story Website
 * @module types
 */

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
  
  /** Path to character image used in story detail view */
  characterPhoto: string;
  
  /** Path to book cover image displayed on story cards */
  coverImage: string;
  
  /** Short preview/teaser text (1-2 sentences) */
  description: string;
  
  /** Full story content */
  story: string;
  
  /** Author name (typically "Drithi") */
  author: string;
  
  /** ISO 8601 date string when story was created */
  createdAt: string;
  
  /** Whether to feature this story on homepage */
  featured?: boolean;
}

/**
 * Represents a music track for background playback
 */
export interface MusicTrack {
  /** Unique identifier for the track */
  id: string;
  
  /** Track title */
  title: string;
  
  /** Artist or composer name */
  artist: string;
  
  /** Path to audio file (relative to public directory) */
  filePath: string;
  
  /** Track duration in seconds */
  duration: number;
  
  /** Optional path to cover art image */
  coverArt?: string;
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
 * State for the music player component
 */
export interface MusicPlayerState {
  /** Currently playing track, or null if no track loaded */
  currentTrack: MusicTrack | null;
  
  /** Whether audio is currently playing */
  isPlaying: boolean;
  
  /** Volume level from 0 (muted) to 1 (full volume) */
  volume: number;
  
  /** All tracks in the current playlist */
  playlist: MusicTrack[];
  
  /** Index of current track in playlist */
  currentIndex: number;
}

/**
 * Helper type for story cards/previews (excludes full story content)
 */
export type StoryPreview = Omit<Story, 'story'>;

/**
 * Helper type for partial story updates
 */
export type PartialStory = Partial<Story> & Pick<Story, 'id'>;
