/**
 * Server Actions for global settings
 * @module settings-actions
 */

"use server";

import { getAppSettings, type AppSettings } from "@/lib/settings-storage";
import type { GlobalSettings } from "@/lib/types";

/**
 * Fetch current global settings from server
 * This is a Server Action that can be called from Client Components
 */
export async function fetchGlobalSettings(): Promise<GlobalSettings> {
  try {
    const settings = await getAppSettings();
    
    // Map AppSettings to GlobalSettings (they're the same structure)
    return {
      autoDetectFestival: settings.autoDetectFestival,
      manualFestivalId: settings.manualFestivalId,
      decorationIntensity: settings.decorationIntensity,
      enableCherryBlossoms: settings.enableCherryBlossoms,
      enableFestivalDecor: settings.enableFestivalDecor,
    };
  } catch (error) {
    console.error("Failed to fetch global settings:", error);
    
    // Return default settings on error
    return {
      autoDetectFestival: true,
      manualFestivalId: null,
      decorationIntensity: 2,
      enableCherryBlossoms: true,
      enableFestivalDecor: true,
    };
  }
}
