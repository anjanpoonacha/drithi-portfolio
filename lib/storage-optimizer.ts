/**
 * Storage optimization and projection utilities for Vercel Blob free tier
 * @module storage-optimizer
 */

import { BLOB_STORAGE, IMAGE_OPTIMIZATION } from './constants';
import { formatBytes } from './image-optimizer';

/**
 * Storage projection with current usage and future capacity
 */
export interface StorageProjection {
  currentUsage: number;
  projectedUsage: number;
  remainingCapacity: number;
  estimatedStoriesRemaining: number;
  recommendations: string[];
}

/**
 * Storage scenario for different story types
 */
export interface StorageScenario {
  scenarioName: string;
  storiesCount: number;
  avgImagesPerStory: number;
  avgImageSize: number;
  totalSize: number;
  percentOfLimit: number;
  feasible: boolean;
}

/**
 * Content type classification for storage estimation
 */
export type ContentType = 'text' | 'images' | 'mixed';

/**
 * Estimate storage for a story based on content type
 * @param contentType - Type of story content (text, images, or mixed)
 * @param imageCount - Number of handwritten page images (default: 0)
 * @param textLength - Length of text content in characters (default: 0)
 * @returns Estimated size in bytes
 */
export function estimateStorySize(
  contentType: ContentType,
  imageCount: number = 0,
  textLength: number = 0
): number {
  let size = 0;

  // Cover image + character photo (assume always present)
  size += IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 2 * 1024; // 2 images at 200KB each

  if (contentType === 'text') {
    // Text content (UTF-8, ~1 byte per character)
    size += textLength;
    size += 1024; // Metadata overhead
  } else if (contentType === 'images') {
    // Handwritten pages
    size += imageCount * IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024;
    size += 2048; // Metadata overhead
  } else if (contentType === 'mixed') {
    // Mixed content
    size += imageCount * IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024;
    size += textLength;
    size += 2048; // Metadata overhead
  }

  return size;
}

/**
 * Calculate how many stories can fit in remaining space
 * @param currentUsage - Current storage usage in bytes
 * @param avgStorySize - Average story size in bytes
 * @returns Remaining capacity and estimated stories count
 */
export function calculateCapacity(
  currentUsage: number,
  avgStorySize: number
): {
  remaining: number;
  storiesRemaining: number;
} {
  const remaining = BLOB_STORAGE.MAX_TOTAL_SIZE - currentUsage;
  const storiesRemaining = avgStorySize > 0 ? Math.floor(remaining / avgStorySize) : 0;

  return {
    remaining,
    storiesRemaining,
  };
}

/**
 * Generate storage scenarios for different story types
 * @returns Array of storage scenarios with feasibility analysis
 */
export function generateStorageScenarios(): StorageScenario[] {
  const scenarios: StorageScenario[] = [
    {
      scenarioName: 'Text-only stories (5000 words each)',
      storiesCount: 50,
      avgImagesPerStory: 2, // Cover + character
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Text-only stories (3000 words each)',
      storiesCount: 100,
      avgImagesPerStory: 2, // Cover + character
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Handwritten stories (10 pages each)',
      storiesCount: 20,
      avgImagesPerStory: 12, // Cover + character + 10 pages
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Handwritten stories (5 pages each)',
      storiesCount: 50,
      avgImagesPerStory: 7, // Cover + character + 5 pages
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Handwritten stories (3 pages each)',
      storiesCount: 75,
      avgImagesPerStory: 5, // Cover + character + 3 pages
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Mixed content (3 images + 2000 words per story)',
      storiesCount: 40,
      avgImagesPerStory: 5, // Cover + character + 3 content images
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
    {
      scenarioName: 'Heavy handwritten (20 pages each)',
      storiesCount: 10,
      avgImagesPerStory: 22, // Cover + character + 20 pages
      avgImageSize: IMAGE_OPTIMIZATION.TARGET_SIZE_KB * 1024,
      totalSize: 0,
      percentOfLimit: 0,
      feasible: false,
    },
  ];

  // Calculate totals and feasibility
  scenarios.forEach((scenario) => {
    // For text-only scenarios, add text size estimate
    if (scenario.scenarioName.includes('Text-only')) {
      const wordsPerStory = parseInt(scenario.scenarioName.match(/\d+/)?.[0] || '0');
      const charsPerStory = wordsPerStory * 5; // Average 5 chars per word
      scenario.totalSize =
        scenario.storiesCount *
        (scenario.avgImagesPerStory * scenario.avgImageSize + charsPerStory + 1024);
    }
    // For mixed content, add text size
    else if (scenario.scenarioName.includes('Mixed')) {
      const wordsPerStory = parseInt(scenario.scenarioName.match(/\d+/)?.[0] || '0');
      const charsPerStory = wordsPerStory * 5;
      scenario.totalSize =
        scenario.storiesCount *
        (scenario.avgImagesPerStory * scenario.avgImageSize + charsPerStory + 2048);
    }
    // For handwritten, only images
    else {
      scenario.totalSize =
        scenario.storiesCount *
        scenario.avgImagesPerStory *
        scenario.avgImageSize;
    }

    scenario.percentOfLimit =
      (scenario.totalSize / BLOB_STORAGE.MAX_TOTAL_SIZE) * 100;
    scenario.feasible = scenario.totalSize < BLOB_STORAGE.CRITICAL_THRESHOLD;
  });

  return scenarios;
}

/**
 * Get storage recommendations based on current usage
 * @param currentUsage - Current storage usage in bytes
 * @param storiesCount - Number of stories currently stored
 * @returns Array of actionable recommendations
 */
export function getStorageRecommendations(
  currentUsage: number,
  storiesCount: number
): string[] {
  const recommendations: string[] = [];
  const percentUsed = (currentUsage / BLOB_STORAGE.MAX_TOTAL_SIZE) * 100;

  if (percentUsed > 80) {
    recommendations.push(
      'HIGH USAGE: Consider reducing image quality or removing old stories'
    );
    recommendations.push(
      'Optimize existing images by re-uploading with lower quality settings'
    );
  }

  if (percentUsed > 90) {
    recommendations.push(
      'CRITICAL: Delete unused images or upgrade storage plan'
    );
  }

  const avgStorySize = storiesCount > 0 ? currentUsage / storiesCount : 0;
  const avgSizeMB = avgStorySize / (1024 * 1024);

  if (avgSizeMB > 10) {
    recommendations.push(
      `Average story size (${formatBytes(avgStorySize)}) is high. Consider:\n` +
      `  - Reducing image dimensions (current max: ${IMAGE_OPTIMIZATION.MAX_WIDTH}x${IMAGE_OPTIMIZATION.MAX_HEIGHT})\n` +
      `  - Lowering JPEG quality (current: ${IMAGE_OPTIMIZATION.QUALITY * 100}%)\n` +
      `  - Limiting pages per story (current max: ${BLOB_STORAGE.MAX_IMAGES_PER_STORY})`
    );
  }

  const capacity = calculateCapacity(currentUsage, avgStorySize);
  if (capacity.storiesRemaining < 10 && capacity.storiesRemaining > 0) {
    recommendations.push(
      `Only ${capacity.storiesRemaining} stories remaining at current average size`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      `Storage usage is healthy (${percentUsed.toFixed(1)}% used)`
    );
    if (capacity.storiesRemaining > 0) {
      recommendations.push(
        `You can add approximately ${capacity.storiesRemaining} more stories at current average size`
      );
    }
  }

  return recommendations;
}

/**
 * Generate detailed storage report with all metrics
 * @param currentUsage - Current storage usage in bytes
 * @param storiesCount - Number of stories currently stored
 * @returns Comprehensive storage report
 */
export function generateStorageReport(
  currentUsage: number,
  storiesCount: number
): {
  summary: {
    totalUsed: string;
    percentUsed: number;
    storiesCount: number;
    avgStorySize: string;
  };
  capacity: {
    remaining: string;
    storiesRemaining: number;
  };
  scenarios: StorageScenario[];
  recommendations: string[];
} {
  const avgStorySize = storiesCount > 0 ? currentUsage / storiesCount : 0;
  const capacity = calculateCapacity(currentUsage, avgStorySize);

  return {
    summary: {
      totalUsed: formatBytes(currentUsage),
      percentUsed: (currentUsage / BLOB_STORAGE.MAX_TOTAL_SIZE) * 100,
      storiesCount,
      avgStorySize: formatBytes(avgStorySize),
    },
    capacity: {
      remaining: formatBytes(capacity.remaining),
      storiesRemaining: capacity.storiesRemaining,
    },
    scenarios: generateStorageScenarios(),
    recommendations: getStorageRecommendations(currentUsage, storiesCount),
  };
}

/**
 * Optimal settings recommendation result
 */
export interface OptimalSettingsResult {
  recommendedQuality: number;
  recommendedMaxWidth: number;
  recommendedMaxHeight: number;
  recommendedTargetSizeKB: number;
  estimatedTotalSize: string;
  feasible: boolean;
  notes: string[];
}

/**
 * Calculate optimal quality settings for target storage goals
 * @param targetStoriesCount - Desired number of stories to store
 * @param avgPagesPerStory - Average handwritten pages per story
 * @returns Recommended quality and dimension settings
 */
export function calculateOptimalSettings(
  targetStoriesCount: number,
  avgPagesPerStory: number
): OptimalSettingsResult {
  const notes: string[] = [];
  
  // Total images = (cover + character + pages) * stories
  const totalImages = (2 + avgPagesPerStory) * targetStoriesCount;
  
  // Calculate available space per image (leaving 10% buffer)
  const availableSpace = BLOB_STORAGE.MAX_TOTAL_SIZE * 0.9;
  const sizePerImage = availableSpace / totalImages;
  const sizePerImageKB = sizePerImage / 1024;
  
  let recommendedQuality: number = IMAGE_OPTIMIZATION.QUALITY;
  let recommendedMaxWidth: number = IMAGE_OPTIMIZATION.MAX_WIDTH;
  let recommendedMaxHeight: number = IMAGE_OPTIMIZATION.MAX_HEIGHT;
  let recommendedTargetSizeKB: number = IMAGE_OPTIMIZATION.TARGET_SIZE_KB;
  
  // If we need smaller files, adjust settings
  if (sizePerImageKB < IMAGE_OPTIMIZATION.TARGET_SIZE_KB) {
    recommendedTargetSizeKB = Math.floor(sizePerImageKB);
    
    // Adjust quality proportionally
    const compressionRatio = sizePerImageKB / IMAGE_OPTIMIZATION.TARGET_SIZE_KB;
    recommendedQuality = Math.max(0.6, IMAGE_OPTIMIZATION.QUALITY * compressionRatio);
    
    // If still need more compression, reduce dimensions
    if (compressionRatio < 0.7) {
      const dimensionRatio = Math.sqrt(compressionRatio / 0.7);
      recommendedMaxWidth = Math.floor(IMAGE_OPTIMIZATION.MAX_WIDTH * dimensionRatio);
      recommendedMaxHeight = Math.floor(IMAGE_OPTIMIZATION.MAX_HEIGHT * dimensionRatio);
      
      notes.push('Target is ambitious - requires both quality and dimension reduction');
    } else {
      notes.push('Target is achievable with quality reduction only');
    }
  } else {
    notes.push('Target is easily achievable with current settings');
  }
  
  const estimatedTotalSize = totalImages * recommendedTargetSizeKB * 1024;
  const feasible = estimatedTotalSize < BLOB_STORAGE.CRITICAL_THRESHOLD;
  
  if (!feasible) {
    notes.push('WARNING: Target may not be feasible within 500MB free tier');
    notes.push('Consider reducing stories count or pages per story');
  }
  
  return {
    recommendedQuality: Math.round(recommendedQuality * 100) / 100,
    recommendedMaxWidth: Math.round(recommendedMaxWidth),
    recommendedMaxHeight: Math.round(recommendedMaxHeight),
    recommendedTargetSizeKB: Math.round(recommendedTargetSizeKB),
    estimatedTotalSize: formatBytes(estimatedTotalSize),
    feasible,
    notes,
  };
}
