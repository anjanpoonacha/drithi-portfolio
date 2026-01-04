/**
 * Tests for settings storage system with Vercel KV
 */
import { test, expect, beforeEach, mock } from "bun:test";

import {
  getAppSettings,
  updateAppSettings,
  resetAppSettings,
  DEFAULT_SETTINGS,
  type AppSettings,
} from "./settings-storage";

// Mock @vercel/kv
const mockKvGet = mock(() => Promise.resolve(null)) as ReturnType<typeof mock> & {
  mockResolvedValue: (value: AppSettings | Partial<AppSettings> | null) => void;
  mockResolvedValueOnce: (value: AppSettings | Partial<AppSettings> | null) => void;
  mockRejectedValue: (error: Error) => void;
};
const mockKvSet = mock(() => Promise.resolve("OK")) as ReturnType<typeof mock> & {
  mockResolvedValue: (value: string) => void;
  mockRejectedValue: (error: Error) => void;
};

mock.module("@vercel/kv", () => ({
  kv: {
    get: mockKvGet,
    set: mockKvSet,
  },
}));

// Setup environment variables for KV
const originalEnv = { ...process.env };

beforeEach(() => {
  // Reset mocks
  mockKvGet.mockClear();
  mockKvSet.mockClear();
  mockKvGet.mockResolvedValue(null);
  mockKvSet.mockResolvedValue("OK");
  
  // Setup KV environment
  process.env.KV_REST_API_URL = "https://fake-kv-url.com";
  process.env.KV_REST_API_TOKEN = "fake-token";
});

test("getAppSettings returns default settings when KV returns null", async () => {
  mockKvGet.mockResolvedValue(null);
  
  const settings = await getAppSettings();
  
  expect(settings).toEqual(DEFAULT_SETTINGS);
  expect(settings.autoDetectFestival).toBe(true);
  expect(settings.decorationIntensity).toBe(2);
  expect(settings.enableCherryBlossoms).toBe(true);
  expect(mockKvGet).toHaveBeenCalledWith("app:settings");
});

test("getAppSettings returns stored settings from KV", async () => {
  const storedSettings: AppSettings = {
    ...DEFAULT_SETTINGS,
    autoDetectFestival: false,
    decorationIntensity: 4,
  };
  mockKvGet.mockResolvedValue(storedSettings);
  
  const settings = await getAppSettings();
  
  expect(settings.autoDetectFestival).toBe(false);
  expect(settings.decorationIntensity).toBe(4);
  expect(mockKvGet).toHaveBeenCalledWith("app:settings");
});

test("getAppSettings merges with defaults for missing keys", async () => {
  // Simulate partial settings in KV (e.g., from older version)
  mockKvGet.mockResolvedValue({
    autoDetectFestival: false,
    decorationIntensity: 3,
  } as Partial<AppSettings>);
  
  const settings = await getAppSettings();
  
  expect(settings.autoDetectFestival).toBe(false);
  expect(settings.decorationIntensity).toBe(3);
  expect(settings.enableCherryBlossoms).toBe(true); // From defaults
  expect(settings.enableFestivalDecor).toBe(true); // From defaults
});

test("updateAppSettings saves settings to KV", async () => {
  mockKvGet.mockResolvedValue(DEFAULT_SETTINGS);
  
  const newSettings: Partial<AppSettings> = {
    autoDetectFestival: false,
    manualFestivalId: "diwali",
    decorationIntensity: 4,
  };
  
  const result = await updateAppSettings(newSettings);
  
  expect(result.autoDetectFestival).toBe(false);
  expect(result.manualFestivalId).toBe("diwali");
  expect(result.decorationIntensity).toBe(4);
  expect(result.enableCherryBlossoms).toBe(true); // Should keep default
  
  expect(mockKvSet).toHaveBeenCalledWith("app:settings", result);
});

test("updateAppSettings merges with existing settings", async () => {
  const existingSettings: AppSettings = {
    ...DEFAULT_SETTINGS,
    decorationIntensity: 3,
  };
  mockKvGet.mockResolvedValue(existingSettings);
  
  const result = await updateAppSettings({ enableCherryBlossoms: false });
  
  expect(result.decorationIntensity).toBe(3); // Preserved from existing
  expect(result.enableCherryBlossoms).toBe(false); // Updated
  expect(result.autoDetectFestival).toBe(true); // Preserved from existing
});

test("resetAppSettings restores defaults in KV", async () => {
  const reset = await resetAppSettings();
  
  expect(reset).toEqual(DEFAULT_SETTINGS);
  expect(mockKvSet).toHaveBeenCalledWith("app:settings", DEFAULT_SETTINGS);
});

test("DEFAULT_SETTINGS has correct structure", () => {
  expect(DEFAULT_SETTINGS.autoDetectFestival).toBe(true);
  expect(DEFAULT_SETTINGS.manualFestivalId).toBeNull();
  expect(DEFAULT_SETTINGS.decorationIntensity).toBe(2);
  expect(DEFAULT_SETTINGS.enableCherryBlossoms).toBe(true);
  expect(DEFAULT_SETTINGS.enableFestivalDecor).toBe(true);
});

test("getAppSettings handles KV errors gracefully", async () => {
  mockKvGet.mockRejectedValue(new Error("KV connection failed"));
  
  const settings = await getAppSettings();
  
  // Should return defaults when KV fails
  expect(settings).toEqual(DEFAULT_SETTINGS);
});

test("updateAppSettings throws on KV write errors", async () => {
  mockKvGet.mockResolvedValue(DEFAULT_SETTINGS);
  mockKvSet.mockRejectedValue(new Error("KV write failed"));
  
  await expect(
    updateAppSettings({ decorationIntensity: 5 })
  ).rejects.toThrow("Failed to save settings to KV");
});

test("resetAppSettings throws on KV write errors", async () => {
  mockKvSet.mockRejectedValue(new Error("KV reset failed"));
  
  await expect(resetAppSettings()).rejects.toThrow("Failed to reset settings in KV");
});

test("getAppSettings uses in-memory fallback when KV not configured", async () => {
  // Remove KV environment variables
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  
  const settings = await getAppSettings();
  
  expect(settings).toEqual(DEFAULT_SETTINGS);
  expect(mockKvGet).not.toHaveBeenCalled();
  
  // Restore environment
  process.env = { ...originalEnv };
});

test("updateAppSettings uses in-memory fallback when KV not configured", async () => {
  // Remove KV environment variables
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  
  const result = await updateAppSettings({ decorationIntensity: 5 });
  
  expect(result.decorationIntensity).toBe(5);
  expect(mockKvSet).not.toHaveBeenCalled();
  
  // Verify in-memory storage persists
  const settings = await getAppSettings();
  expect(settings.decorationIntensity).toBe(5);
  
  // Restore environment
  process.env = { ...originalEnv };
});

test("updateAppSettings with partial settings preserves other values", async () => {
  // First update
  mockKvGet.mockResolvedValueOnce(DEFAULT_SETTINGS);
  await updateAppSettings({
    autoDetectFestival: false,
    manualFestivalId: "christmas",
  });
  
  // Second update - mock returns first update result
  const firstUpdateResult: AppSettings = {
    ...DEFAULT_SETTINGS,
    autoDetectFestival: false,
    manualFestivalId: "christmas",
  };
  mockKvGet.mockResolvedValueOnce(firstUpdateResult);
  
  const result = await updateAppSettings({
    decorationIntensity: 1,
  });
  
  expect(result.autoDetectFestival).toBe(false);
  expect(result.manualFestivalId).toBe("christmas");
  expect(result.decorationIntensity).toBe(1);
});
