import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Story } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
