import { test, expect } from "bun:test";
import { validateStory, validateStoriesData } from "./story-validator";
import type { Story } from "./types";

test("validateStory - valid text story", () => {
  const validStory: Story = {
    id: "test-1",
    title: "Test Story",
    author: "Drithi",
    description: "A test story",
    labels: ["Adventure"],
    coverImage: "/images/cover.jpg",
    characterPhoto: "/images/character.jpg",
    contentType: "text",
    story: "Once upon a time...",
    createdAt: "2025-01-04T00:00:00Z",
    featured: true,
  };

  const result = validateStory(validStory);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test("validateStory - missing required fields", () => {
  const invalidStory: Story = {
    id: "test-2",
    // Missing title, author, description, etc.
    title: "",
    author: "",
    description: "",
    labels: [],
    coverImage: "",
    characterPhoto: "",
    contentType: "text",
    createdAt: "",
  };

  const result = validateStory(invalidStory);
  expect(result.valid).toBe(false);
  expect(result.errors.length).toBeGreaterThan(0);
  expect(result.errors).toContain("Title is required");
  expect(result.errors).toContain("Author is required");
  expect(result.errors).toContain("Description is required");
});

test("validateStory - text story without story content", () => {
  const invalidStory: Story = {
    id: "test-3",
    title: "Test",
    author: "Drithi",
    description: "Test",
    labels: ["Test"],
    coverImage: "/cover.jpg",
    characterPhoto: "/character.jpg",
    contentType: "text",
    // Missing story field
    createdAt: "2025-01-04T00:00:00Z",
  };

  const result = validateStory(invalidStory);
  expect(result.valid).toBe(false);
  expect(result.errors).toContain("Text story must have story content");
});

test("validateStory - image story without imageUrls", () => {
  const invalidStory: Story = {
    id: "test-4",
    title: "Test",
    author: "Drithi",
    description: "Test",
    labels: ["Test"],
    coverImage: "/cover.jpg",
    characterPhoto: "/character.jpg",
    contentType: "images",
    // Missing imageUrls
    createdAt: "2025-01-04T00:00:00Z",
  };

  const result = validateStory(invalidStory);
  expect(result.valid).toBe(false);
  expect(result.errors).toContain("Image story must have at least one page");
});

test("validateStory - valid image story", () => {
  const validStory: Story = {
    id: "test-5",
    title: "Test",
    author: "Drithi",
    description: "Test",
    labels: ["Test"],
    coverImage: "/cover.jpg",
    characterPhoto: "/character.jpg",
    contentType: "images",
    imageUrls: ["/page1.jpg", "/page2.jpg"],
    createdAt: "2025-01-04T00:00:00Z",
  };

  const result = validateStory(validStory);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test("validateStory - invalid URL format", () => {
  const invalidStory: Story = {
    id: "test-6",
    title: "Test",
    author: "Drithi",
    description: "Test",
    labels: ["Test"],
    coverImage: "not-a-valid-url",
    characterPhoto: "also-invalid",
    contentType: "text",
    story: "Test content",
    createdAt: "2025-01-04T00:00:00Z",
  };

  const result = validateStory(invalidStory);
  expect(result.valid).toBe(false);
  expect(result.errors.some(e => e.includes("coverImage"))).toBe(true);
  expect(result.errors.some(e => e.includes("characterPhoto"))).toBe(true);
});

test("validateStory - valid absolute URL", () => {
  const validStory: Story = {
    id: "test-7",
    title: "Test",
    author: "Drithi",
    description: "Test",
    labels: ["Test"],
    coverImage: "https://example.com/cover.jpg",
    characterPhoto: "https://example.com/character.jpg",
    contentType: "text",
    story: "Test content",
    createdAt: "2025-01-04T00:00:00Z",
  };

  const result = validateStory(validStory);
  expect(result.valid).toBe(true);
  expect(result.errors).toHaveLength(0);
});

test("validateStoriesData - multiple stories", async () => {
  const stories: Story[] = [
    {
      id: "valid-1",
      title: "Valid Story",
      author: "Drithi",
      description: "Valid",
      labels: ["Test"],
      coverImage: "/cover.jpg",
      characterPhoto: "/character.jpg",
      contentType: "text",
      story: "Content",
      createdAt: "2025-01-04T00:00:00Z",
    },
    {
      id: "invalid-1",
      title: "",
      author: "",
      description: "",
      labels: [],
      coverImage: "",
      characterPhoto: "",
      contentType: "text",
      createdAt: "",
    },
  ];

  const result = await validateStoriesData(stories);
  expect(result.valid).toBe(false);
  expect(result.validCount).toBe(1);
  expect(result.invalidCount).toBe(1);
  expect(result.errors).toHaveLength(1);
  expect(result.errors[0]?.storyId).toBe("invalid-1");
});
