/**
 * Server Actions for managing application settings
 * These functions run on the server and can be called from client components
 * @module actions/settings
 */

"use server";

import {
  getAppSettings as getSettingsFromStorage,
  updateAppSettings as updateSettingsInStorage,
  resetAppSettings as resetSettingsInStorage,
  type AppSettings,
} from "@/lib/settings-storage";

/**
 * Server Action: Get current application settings
 * @returns Current settings object
 */
export async function getSettings(): Promise<AppSettings> {
  return await getSettingsFromStorage();
}

/**
 * Server Action: Update application settings
 * @param settings - Partial settings object with values to update
 * @returns Updated settings object
 */
export async function updateSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  // Validate decorationIntensity if provided
  if (settings.decorationIntensity !== undefined) {
    if (
      settings.decorationIntensity < 1 ||
      settings.decorationIntensity > 5
    ) {
      throw new Error("decorationIntensity must be between 1 and 5");
    }
  }

  return await updateSettingsInStorage(settings);
}

/**
 * Server Action: Reset settings to defaults
 * @returns Default settings object
 */
export async function resetSettings(): Promise<AppSettings> {
  return await resetSettingsInStorage();
}

/**
 * Server Action: Check if KV is configured and working
 * @returns Boolean indicating if KV is properly configured
 */
export async function checkKVStatus(): Promise<boolean> {
  const hasUrl = !!process.env.DRITHI_KV_REST_API_URL;
  const hasToken = !!process.env.DRITHI_KV_REST_API_TOKEN;
  return hasUrl && hasToken;
}
