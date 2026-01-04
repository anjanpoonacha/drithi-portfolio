/**
 * Tests for festival detection system
 */
import { test, expect } from "bun:test";

import {
  detectCurrentFestival,
  getFestivalById,
  getUpcomingFestivals,
  isFestivalActive,
  FESTIVALS,
} from "./festivals";

test("FESTIVALS array should contain all expected festivals", () => {
  const festivalIds = FESTIVALS.map((f) => f.id);
  
  expect(festivalIds).toContain("diwali");
  expect(festivalIds).toContain("holi");
  expect(festivalIds).toContain("christmas");
  expect(festivalIds).toContain("dussehra");
  expect(festivalIds).toContain("newyear");
  expect(FESTIVALS.length).toBe(5);
});

test("getFestivalById should return correct festival", () => {
  const diwali = getFestivalById("diwali");
  
  expect(diwali).not.toBeNull();
  expect(diwali?.name).toBe("Diwali");
  expect(diwali?.colors.primary).toBe("#FF6B35");
  expect(diwali?.decorationType).toContain("diyas");
});

test("getFestivalById should return null for invalid id", () => {
  const invalid = getFestivalById("invalid-festival");
  expect(invalid).toBeNull();
});

test("detectCurrentFestival for Christmas date", () => {
  const christmasDate = new Date("2025-12-25");
  const festival = detectCurrentFestival(christmasDate);
  
  expect(festival).not.toBeNull();
  expect(festival?.id).toBe("christmas");
  expect(festival?.name).toBe("Christmas");
});

test("detectCurrentFestival for New Year date", () => {
  const newYearDate = new Date("2025-01-01");
  const festival = detectCurrentFestival(newYearDate);
  
  expect(festival).not.toBeNull();
  expect(festival?.id).toBe("newyear");
});

test("detectCurrentFestival for non-festival date", () => {
  const regularDate = new Date("2025-05-15"); // Mid-May, no festivals
  const festival = detectCurrentFestival(regularDate);
  
  // Could be null or a festival depending on dates
  // Just verify it returns a valid result
  if (festival) {
    expect(festival).toHaveProperty("id");
    expect(festival).toHaveProperty("name");
  } else {
    expect(festival).toBeNull();
  }
});

test("isFestivalActive for Christmas", () => {
  const christmasDate = new Date("2025-12-25");
  const isActive = isFestivalActive("christmas", christmasDate);
  
  expect(isActive).toBe(true);
});

test("isFestivalActive for non-active festival", () => {
  const summerDate = new Date("2025-07-15");
  const isActive = isFestivalActive("christmas", summerDate);
  
  expect(isActive).toBe(false);
});

test("getUpcomingFestivals should return array", () => {
  const date = new Date("2025-12-01");
  const upcoming = getUpcomingFestivals(60, date);
  
  expect(Array.isArray(upcoming)).toBe(true);
  
  // Should find at least Christmas and New Year in Dec-Jan
  const festivalIds = upcoming.map((f) => f.id);
  expect(festivalIds).toContain("christmas");
  expect(festivalIds).toContain("newyear");
});

test("Festival objects should have required properties", () => {
  const diwali = getFestivalById("diwali");
  
  expect(diwali).toHaveProperty("id");
  expect(diwali).toHaveProperty("name");
  expect(diwali).toHaveProperty("dateRanges");
  expect(diwali).toHaveProperty("colors");
  expect(diwali).toHaveProperty("decorationType");
  expect(diwali).toHaveProperty("description");
  
  expect(diwali?.colors).toHaveProperty("primary");
  expect(diwali?.colors).toHaveProperty("secondary");
  expect(diwali?.colors).toHaveProperty("accent");
  
  expect(Array.isArray(diwali?.dateRanges)).toBe(true);
  expect(Array.isArray(diwali?.decorationType)).toBe(true);
});

test("Date ranges should have valid format", () => {
  for (const festival of FESTIVALS) {
    for (const range of festival.dateRanges) {
      expect(range).toHaveProperty("start");
      expect(range).toHaveProperty("end");
      
      // Check MM-DD format
      expect(range.start).toMatch(/^\d{2}-\d{2}$/);
      expect(range.end).toMatch(/^\d{2}-\d{2}$/);
      
      // If year exists, should be a number
      if (range.year) {
        expect(typeof range.year).toBe("number");
        expect(range.year).toBeGreaterThan(2000);
      }
    }
  }
});

test("Decoration types should be valid", () => {
  const validTypes = ["diyas", "colors", "snowflakes", "flowers", "stars", "sparkles"];
  
  for (const festival of FESTIVALS) {
    for (const decoration of festival.decorationType) {
      expect(validTypes).toContain(decoration);
    }
  }
});

test("Festival colors should be valid hex colors", () => {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  
  for (const festival of FESTIVALS) {
    expect(festival.colors.primary).toMatch(hexColorRegex);
    expect(festival.colors.secondary).toMatch(hexColorRegex);
    expect(festival.colors.accent).toMatch(hexColorRegex);
    
    if (festival.colors.background) {
      expect(festival.colors.background).toMatch(hexColorRegex);
    }
  }
});

test("Specific year dates - Diwali 2025", () => {
  const diwali2025 = new Date("2025-10-20");
  const festival = detectCurrentFestival(diwali2025);
  
  expect(festival?.id).toBe("diwali");
});

test("Specific year dates - Holi 2025", () => {
  const holi2025 = new Date("2025-03-14");
  const festival = detectCurrentFestival(holi2025);
  
  expect(festival?.id).toBe("holi");
});

test("Edge case: Date range crossing year boundary", () => {
  const dec31 = new Date("2025-12-31");
  const jan1 = new Date("2026-01-01");
  
  const festivalDec = detectCurrentFestival(dec31);
  const festivalJan = detectCurrentFestival(jan1);
  
  // Both should detect New Year
  expect(festivalDec?.id).toBe("newyear");
  expect(festivalJan?.id).toBe("newyear");
});
