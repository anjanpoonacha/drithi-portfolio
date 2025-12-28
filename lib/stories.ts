/**
 * Story utility functions for server-side data operations
 * @module stories
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Story } from "@/lib/types";

const STORIES_FILE_PATH = join(process.cwd(), "data", "stories.json");

/**
 * Reads and parses the stories.json file
 * @private
 */
async function readStoriesFile(): Promise<Story[]> {
  try {
    const fileContent = await readFile(STORIES_FILE_PATH, "utf-8");
    const data = JSON.parse(fileContent);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to read stories file:", error);
    return [];
  }
}

/**
 * Fetches all stories from data/stories.json
 * @returns Promise resolving to array of all stories
 */
export async function getAllStories(): Promise<Story[]> {
  return await readStoriesFile();
}

/**
 * Gets a single story by its unique ID
 * @param id - The story ID to search for
 * @returns Promise resolving to the story or null if not found
 */
export async function getStoryById(id: string): Promise<Story | null> {
  const stories = await readStoriesFile();
  const story = stories.find((s) => s.id === id);
  return story ?? null;
}

/**
 * Gets all featured stories (where featured=true)
 * @returns Promise resolving to array of featured stories
 */
export async function getFeaturedStories(): Promise<Story[]> {
  const stories = await readStoriesFile();
  return stories.filter((story) => story.featured === true);
}

/**
 * Extracts unique categories from all story labels
 * @returns Promise resolving to sorted array of unique category strings
 */
export async function getAllCategories(): Promise<string[]> {
  const stories = await readStoriesFile();
  const categoriesSet = new Set<string>();
  
  stories.forEach((story) => {
    story.labels.forEach((label) => {
      categoriesSet.add(label);
    });
  });
  
  return Array.from(categoriesSet).sort();
}

/**
 * Filters stories by search query and/or category
 * @param stories - Array of stories to filter
 * @param query - Search string to match against title and description (case-insensitive)
 * @param category - Category label to filter by, or null for no category filter
 * @returns Filtered array of stories
 */
export function filterStories(
  stories: Story[],
  query: string,
  category: string | null
): Story[] {
  let filtered = stories;
  
  // Filter by category if specified
  if (category !== null && category !== "") {
    filtered = filtered.filter((story) =>
      story.labels.some(
        (label) => label.toLowerCase() === category.toLowerCase()
      )
    );
  }
  
  // Filter by search query if specified
  if (query.trim() !== "") {
    const searchTerm = query.toLowerCase().trim();
    filtered = filtered.filter((story) => {
      const titleMatch = story.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = story.description.toLowerCase().includes(searchTerm);
      return titleMatch || descriptionMatch;
    });
  }
  
  return filtered;
}

/**
 * Gets the next story in the array (circular - wraps to first if at end)
 * @param currentId - The ID of the current story
 * @returns Promise resolving to the next story or null if current story not found or array is empty
 */
export async function getNextStory(currentId: string): Promise<Story | null> {
  const stories = await readStoriesFile();
  
  if (stories.length === 0) {
    return null;
  }
  
  const currentIndex = stories.findIndex((s) => s.id === currentId);
  
  if (currentIndex === -1) {
    return null;
  }
  
  // Wrap to beginning if at end
  const nextIndex = (currentIndex + 1) % stories.length;
  return stories[nextIndex] ?? null;
}

/**
 * Gets the previous story in the array (circular - wraps to last if at start)
 * @param currentId - The ID of the current story
 * @returns Promise resolving to the previous story or null if current story not found or array is empty
 */
export async function getPreviousStory(currentId: string): Promise<Story | null> {
  const stories = await readStoriesFile();
  
  if (stories.length === 0) {
    return null;
  }
  
  const currentIndex = stories.findIndex((s) => s.id === currentId);
  
  if (currentIndex === -1) {
    return null;
  }
  
  // Wrap to end if at start
  const prevIndex = currentIndex === 0 ? stories.length - 1 : currentIndex - 1;
  return stories[prevIndex] ?? null;
}
