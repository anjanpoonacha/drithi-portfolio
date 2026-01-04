/**
 * Festival detection and theming system
 * Auto-detects current festivals based on date and provides theme configuration
 * @module festivals
 */

/**
 * Festival decoration types
 */
export type DecorationType = "diyas" | "colors" | "snowflakes" | "flowers" | "stars" | "sparkles";

/**
 * Festival theme colors
 */
export interface FestivalColors {
  /** Primary theme color */
  primary: string;
  /** Secondary theme color */
  secondary: string;
  /** Accent color for decorations */
  accent: string;
  /** Background overlay color (optional) */
  background?: string;
}

/**
 * Date range for a festival
 */
export interface DateRange {
  /** Start date (MM-DD format) */
  start: string;
  /** End date (MM-DD format) */
  end: string;
  /** Year (optional - for festivals that vary by year) */
  year?: number;
}

/**
 * Complete festival configuration
 */
export interface Festival {
  /** Unique festival identifier */
  id: string;
  /** Display name of the festival */
  name: string;
  /** Festival date range(s) - can have multiple date ranges for varying dates */
  dateRanges: DateRange[];
  /** Festival theme colors */
  colors: FestivalColors;
  /** Type of decoration to display */
  decorationType: DecorationType[];
  /** Short description of the festival */
  description: string;
  /** Greeting message to display */
  greeting?: string;
}

/**
 * All festival configurations
 */
export const FESTIVALS: Festival[] = [
  {
    id: "diwali",
    name: "Diwali",
    description: "Festival of Lights",
    greeting: "Happy Diwali! May your life be filled with light and joy!",
    dateRanges: [
      // 2024: Nov 1
      { start: "10-29", end: "11-03", year: 2024 },
      // 2025: Oct 20
      { start: "10-18", end: "10-23", year: 2025 },
      // 2026: Nov 8
      { start: "11-06", end: "11-11", year: 2026 },
      // General fallback (late Oct to early Nov)
      { start: "10-25", end: "11-10" },
    ],
    colors: {
      primary: "#FF6B35", // Warm orange
      secondary: "#F7931E", // Golden yellow
      accent: "#FFD700", // Gold
      background: "#FFF8DC", // Cornsilk
    },
    decorationType: ["diyas", "sparkles", "flowers"],
  },
  {
    id: "holi",
    name: "Holi",
    description: "Festival of Colors",
    greeting: "Happy Holi! Let colors spread joy and happiness!",
    dateRanges: [
      // 2025: March 14
      { start: "03-12", end: "03-16", year: 2025 },
      // 2026: March 3
      { start: "03-01", end: "03-05", year: 2026 },
      // General fallback (early to mid March)
      { start: "03-01", end: "03-20" },
    ],
    colors: {
      primary: "#FF1493", // Deep pink
      secondary: "#00CED1", // Dark turquoise
      accent: "#FFD700", // Gold
      background: "#FFF0F5", // Lavender blush
    },
    decorationType: ["colors", "sparkles"],
  },
  {
    id: "christmas",
    name: "Christmas",
    description: "Season of Joy and Giving",
    greeting: "Merry Christmas! Wishing you peace and happiness!",
    dateRanges: [
      { start: "12-20", end: "12-26" },
    ],
    colors: {
      primary: "#C41E3A", // Christmas red
      secondary: "#0F8A5F", // Christmas green
      accent: "#FFD700", // Gold
      background: "#F0F8FF", // Alice blue
    },
    decorationType: ["snowflakes", "stars"],
  },
  {
    id: "dussehra",
    name: "Dussehra",
    description: "Victory of Good over Evil",
    greeting: "Happy Dussehra! May good always triumph!",
    dateRanges: [
      // 2024: Oct 12
      { start: "10-10", end: "10-14", year: 2024 },
      // 2025: Oct 2
      { start: "09-30", end: "10-04", year: 2025 },
      // 2026: Oct 20
      { start: "10-18", end: "10-22", year: 2026 },
      // General fallback (late Sept to mid Oct)
      { start: "09-25", end: "10-20" },
    ],
    colors: {
      primary: "#FF4500", // Orange red
      secondary: "#FFD700", // Gold
      accent: "#DC143C", // Crimson
      background: "#FFF5EE", // Seashell
    },
    decorationType: ["flowers", "sparkles"],
  },
  {
    id: "newyear",
    name: "New Year",
    description: "Celebrating New Beginnings",
    greeting: "Happy New Year! Here's to new adventures and dreams!",
    dateRanges: [
      { start: "12-31", end: "01-02" },
    ],
    colors: {
      primary: "#FFD700", // Gold
      secondary: "#C0C0C0", // Silver
      accent: "#FF1493", // Deep pink
      background: "#F0F8FF", // Alice blue
    },
    decorationType: ["sparkles", "stars"],
  },
];

/**
 * Check if a date falls within a date range
 */
function isDateInRange(date: Date, range: DateRange): boolean {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-indexed
  const day = date.getDate();

  // If range has specific year, check if it matches
  if (range.year && range.year !== year) {
    return false;
  }

  // Parse start and end dates
  const [startMonth, startDay] = range.start.split("-").map(Number);
  const [endMonth, endDay] = range.end.split("-").map(Number);

  if (startMonth === undefined || startDay === undefined || endMonth === undefined || endDay === undefined) {
    return false;
  }

  // Create comparable date values (MMDD format)
  const currentDate = month * 100 + day;
  const rangeStart = startMonth * 100 + startDay;
  const rangeEnd = endMonth * 100 + endDay;

  // Handle ranges that cross year boundary (e.g., Dec 31 - Jan 2)
  if (rangeStart > rangeEnd) {
    return currentDate >= rangeStart || currentDate <= rangeEnd;
  }

  return currentDate >= rangeStart && currentDate <= rangeEnd;
}

/**
 * Detect current festival based on today's date
 * @param date - Optional date to check (defaults to today)
 * @returns Current festival or null if no festival is active
 */
export function detectCurrentFestival(date: Date = new Date()): Festival | null {
  // First try to find festivals with specific year matches
  const festivalWithYear = FESTIVALS.find((festival) =>
    festival.dateRanges.some((range) => range.year && isDateInRange(date, range))
  );

  if (festivalWithYear) {
    return festivalWithYear;
  }

  // Then try generic date ranges (no year specified)
  const festivalGeneric = FESTIVALS.find((festival) =>
    festival.dateRanges.some((range) => !range.year && isDateInRange(date, range))
  );

  return festivalGeneric ?? null;
}

/**
 * Get festival by ID
 */
export function getFestivalById(id: string): Festival | null {
  return FESTIVALS.find((festival) => festival.id === id) ?? null;
}

/**
 * Get all upcoming festivals within the next N days
 */
export function getUpcomingFestivals(days: number = 30, fromDate: Date = new Date()): Festival[] {
  const upcoming: Festival[] = [];
  const endDate = new Date(fromDate);
  endDate.setDate(endDate.getDate() + days);

  for (const festival of FESTIVALS) {
    // Check each date in the range
    const current = new Date(fromDate);
    while (current <= endDate) {
      if (
        festival.dateRanges.some((range) => isDateInRange(current, range))
      ) {
        upcoming.push(festival);
        break; // Found this festival, move to next
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return upcoming;
}

/**
 * Check if a specific festival is currently active
 */
export function isFestivalActive(festivalId: string, date: Date = new Date()): boolean {
  const festival = getFestivalById(festivalId);
  if (!festival) return false;

  return festival.dateRanges.some((range) => isDateInRange(date, range));
}

/**
 * Get the next occurrence of a festival
 * Returns the festival with its next start date
 */
export function getNextFestivalOccurrence(
  festivalId: string,
  fromDate: Date = new Date()
): { festival: Festival; startDate: Date } | null {
  const festival = getFestivalById(festivalId);
  if (!festival) return null;

  const year = fromDate.getFullYear();
  
  // Try each date range to find the next occurrence
  for (const range of festival.dateRanges) {
    // If range has a specific year and it's in the past, skip
    if (range.year && range.year < year) continue;
    
    const [startMonth, startDay] = range.start.split("-").map(Number);
    if (startMonth === undefined || startDay === undefined) continue;
    
    // Try current year
    const targetYear = range.year ?? year;
    const startDate = new Date(targetYear, startMonth - 1, startDay);
    
    if (startDate > fromDate) {
      return { festival, startDate };
    }
    
    // If no specific year, try next year
    if (!range.year) {
      const nextYearDate = new Date(year + 1, startMonth - 1, startDay);
      if (nextYearDate > fromDate) {
        return { festival, startDate: nextYearDate };
      }
    }
  }
  
  return null;
}
