/**
 * Server-side settings storage system
 * Stores global application settings in Vercel KV (Redis)
 * Falls back to in-memory storage for local development without KV
 * @module settings-storage
 */

import { createClient } from "@vercel/kv";

/**
 * Create KV client with custom DRITHI_ prefixed environment variables
 */
const kv = createClient({
  url: process.env.DRITHI_KV_REST_API_URL || "",
  token: process.env.DRITHI_KV_REST_API_TOKEN || "",
});

/**
 * Global application settings
 */
export interface AppSettings {
  /** Enable automatic festival detection based on current date */
  autoDetectFestival: boolean;
  
  /** Manual festival override (null = use auto-detection) */
  manualFestivalId: string | null;
  
  /** Decoration intensity level (1=minimal, 5=maximum) */
  decorationIntensity: 1 | 2 | 3 | 4 | 5;
  
  /** Enable cherry blossom decorations */
  enableCherryBlossoms: boolean;
  
  /** Enable festival-specific decorations */
  enableFestivalDecor: boolean;
}

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS: AppSettings = {
  autoDetectFestival: true,
  manualFestivalId: null,
  decorationIntensity: 2,
  enableCherryBlossoms: true,
  enableFestivalDecor: true,
};

/**
 * Redis key for storing app settings
 */
const SETTINGS_KEY = "app:settings";

/**
 * In-memory fallback storage when KV is not available
 * Used in local development without Vercel KV credentials
 */
let memoryStorage: AppSettings | null = null;

/**
 * Check if Vercel KV is configured
 */
function isKVConfigured(): boolean {
  const hasUrl = !!process.env.DRITHI_KV_REST_API_URL;
  const hasToken = !!process.env.DRITHI_KV_REST_API_TOKEN;
  
  console.log("[Settings Storage] KV Configuration Check:");
  console.log("  - DRITHI_KV_REST_API_URL:", hasUrl ? "✓ Set" : "✗ Missing");
  console.log("  - DRITHI_KV_REST_API_TOKEN:", hasToken ? "✓ Set" : "✗ Missing");
  
  return hasUrl && hasToken;
}

/**
 * Read application settings from Vercel KV
 * Returns default settings if key doesn't exist or KV is unavailable
 */
export async function getAppSettings(): Promise<AppSettings> {
  // If KV is not configured, use in-memory storage
  if (!isKVConfigured()) {
    console.warn("[Settings Storage] KV not configured, using in-memory fallback");
    return memoryStorage || DEFAULT_SETTINGS;
  }

  try {
    console.log("[Settings Storage] Attempting to read from KV...");
    const settings = await kv.get<AppSettings>(SETTINGS_KEY);
    
    // If no settings exist in KV, return defaults
    if (!settings) {
      console.log("[Settings Storage] No settings found in KV, returning defaults");
      return DEFAULT_SETTINGS;
    }
    
    console.log("[Settings Storage] ✓ Successfully read from KV");
    // Merge with defaults to ensure all keys exist
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
    };
  } catch (error) {
    // KV request failed - log error and return defaults
    console.error("[Settings Storage] ✗ Error reading from KV:", error);
    console.error("[Settings Storage] Error details:", error instanceof Error ? error.message : String(error));
    return memoryStorage || DEFAULT_SETTINGS;
  }
}

/**
 * Write application settings to Vercel KV
 * @param settings - Partial settings object to update
 * @returns The complete updated settings object
 */
export async function updateAppSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  // Read current settings and merge with new values
  const currentSettings = await getAppSettings();
  const newSettings: AppSettings = {
    ...currentSettings,
    ...settings,
  };
  
  // If KV is not configured, use in-memory storage
  if (!isKVConfigured()) {
    console.warn("[Settings Storage] KV not configured, saving to in-memory fallback");
    memoryStorage = newSettings;
    return newSettings;
  }

  try {
    console.log("[Settings Storage] Attempting to write to KV...");
    // Store in Redis with no expiration
    await kv.set(SETTINGS_KEY, newSettings);
    
    console.log("[Settings Storage] ✓ Successfully wrote to KV");
    // Update memory cache as backup
    memoryStorage = newSettings;
    
    return newSettings;
  } catch (error) {
    // KV request failed - log error, save to memory, and throw
    console.error("[Settings Storage] ✗ Error writing to KV:", error);
    console.error("[Settings Storage] Error details:", error instanceof Error ? error.message : String(error));
    memoryStorage = newSettings;
    throw new Error(`Failed to save settings to KV: ${error}`);
  }
}

/**
 * Reset settings to defaults
 * @returns The default settings object
 */
export async function resetAppSettings(): Promise<AppSettings> {
  // If KV is not configured, use in-memory storage
  if (!isKVConfigured()) {
    console.warn("[Settings Storage] KV not configured, resetting in-memory fallback");
    memoryStorage = DEFAULT_SETTINGS;
    return DEFAULT_SETTINGS;
  }

  try {
    // Store defaults in Redis
    await kv.set(SETTINGS_KEY, DEFAULT_SETTINGS);
    
    // Update memory cache
    memoryStorage = DEFAULT_SETTINGS;
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    // KV request failed - log error, reset memory, and throw
    console.error("[Settings Storage] Error resetting settings in KV:", error);
    memoryStorage = DEFAULT_SETTINGS;
    throw new Error(`Failed to reset settings in KV: ${error}`);
  }
}
