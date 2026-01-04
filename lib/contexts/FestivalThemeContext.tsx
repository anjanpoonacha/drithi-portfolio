"use client";

import * as React from "react";

import type { Festival } from "@/lib/festivals";
import { detectCurrentFestival, getFestivalById } from "@/lib/festivals";
import type { GlobalSettings } from "@/lib/types";
import { fetchGlobalSettings } from "@/lib/actions/settings-actions";

/**
 * Festival theme context value
 */
interface FestivalThemeContextValue {
  /** Currently active festival, or null if none */
  currentFestival: Festival | null;
  /** Whether festival theme is enabled */
  isEnabled: boolean;
  /** Global settings from server */
  globalSettings: GlobalSettings | null;
  /** Admin preview mode flag */
  isAdmin: boolean;
  /** Decoration intensity from settings */
  decorationIntensity: 1 | 2 | 3 | 4 | 5;
  /** Enable festival theme */
  enableTheme: () => void;
  /** Disable festival theme */
  disableTheme: () => void;
  /** Toggle festival theme */
  toggleTheme: () => void;
  /** Manually set a specific festival (for testing/preview) */
  setFestival: (festival: Festival | null) => void;
  /** Preview a festival without saving (admin only) */
  previewFestival: (festivalId: string) => void;
  /** Exit preview mode and return to global settings */
  exitPreview: () => void;
}

const FestivalThemeContext = React.createContext<FestivalThemeContextValue | null>(null);

interface FestivalThemeProviderProps {
  children: React.ReactNode;
  /** Admin mode for preview functionality (default: false) */
  isAdmin?: boolean;
}

const THEME_STORAGE_KEY = "drithi-festival-theme-enabled";

/**
 * FestivalThemeProvider - Manages festival theme state and applies CSS variables
 */
export function FestivalThemeProvider({
  children,
  isAdmin = false,
}: FestivalThemeProviderProps) {
  const [currentFestival, setCurrentFestival] = React.useState<Festival | null>(null);
  const [isEnabled, setIsEnabled] = React.useState<boolean>(true);
  const [globalSettings, setGlobalSettings] = React.useState<GlobalSettings | null>(null);
  const [isPreviewMode, setIsPreviewMode] = React.useState<boolean>(false);

  // Fetch global settings from server on mount
  React.useEffect(() => {
    fetchGlobalSettings()
      .then((settings) => {
        setGlobalSettings(settings);
      })
      .catch((error) => {
        console.error("Failed to fetch global settings:", error);
      });
  }, []);

  // Load user's theme preference from localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        setIsEnabled(stored === "true");
      }
    } catch (error) {
      console.error("Failed to load festival theme preference:", error);
    }
  }, []);

  // Apply festival detection based on global settings (unless in preview mode)
  React.useEffect(() => {
    if (!globalSettings || isPreviewMode) return;

    try {
      let festival: Festival | null = null;

      if (globalSettings.autoDetectFestival) {
        // Auto-detect festival based on current date
        festival = detectCurrentFestival();
      } else if (globalSettings.manualFestivalId) {
        // Use manually set festival
        festival = getFestivalById(globalSettings.manualFestivalId);
      }

      setCurrentFestival(festival);
    } catch (error) {
      console.error("Failed to apply festival settings:", error);
    }
  }, [globalSettings, isPreviewMode]);

  // Apply festival theme CSS variables
  React.useEffect(() => {
    if (!currentFestival || !isEnabled) {
      // Remove festival theme variables
      if (typeof document !== "undefined") {
        document.documentElement.style.removeProperty("--festival-primary");
        document.documentElement.style.removeProperty("--festival-secondary");
        document.documentElement.style.removeProperty("--festival-accent");
        document.documentElement.style.removeProperty("--festival-background");
        document.documentElement.removeAttribute("data-festival");
      }
      return;
    }

    // Apply festival theme variables
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--festival-primary", currentFestival.colors.primary);
      root.style.setProperty("--festival-secondary", currentFestival.colors.secondary);
      root.style.setProperty("--festival-accent", currentFestival.colors.accent);
      
      if (currentFestival.colors.background) {
        root.style.setProperty("--festival-background", currentFestival.colors.background);
      }

      // Set data attribute for CSS targeting
      root.setAttribute("data-festival", currentFestival.id);
    }
  }, [currentFestival, isEnabled]);

  // Persist theme preference to localStorage
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, isEnabled.toString());
    } catch (error) {
      console.error("Failed to save festival theme preference:", error);
    }
  }, [isEnabled]);

  const enableTheme = React.useCallback(() => {
    setIsEnabled(true);
  }, []);

  const disableTheme = React.useCallback(() => {
    setIsEnabled(false);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  const setFestival = React.useCallback((festival: Festival | null) => {
    setCurrentFestival(festival);
  }, []);

  const previewFestival = React.useCallback((festivalId: string) => {
    if (!isAdmin) {
      console.warn("previewFestival can only be called in admin mode");
      return;
    }

    const festival = getFestivalById(festivalId);
    if (festival) {
      setCurrentFestival(festival);
      setIsPreviewMode(true);
      setIsEnabled(true);
    }
  }, [isAdmin]);

  const exitPreview = React.useCallback(() => {
    if (!isAdmin) {
      console.warn("exitPreview can only be called in admin mode");
      return;
    }

    setIsPreviewMode(false);
    // Re-apply global settings
    if (globalSettings) {
      let festival: Festival | null = null;
      
      if (globalSettings.autoDetectFestival) {
        festival = detectCurrentFestival();
      } else if (globalSettings.manualFestivalId) {
        festival = getFestivalById(globalSettings.manualFestivalId);
      }
      
      setCurrentFestival(festival);
    }
  }, [isAdmin, globalSettings]);

  const value: FestivalThemeContextValue = {
    currentFestival,
    isEnabled,
    globalSettings,
    isAdmin,
    decorationIntensity: globalSettings?.decorationIntensity ?? 2,
    enableTheme,
    disableTheme,
    toggleTheme,
    setFestival,
    previewFestival,
    exitPreview,
  };

  return (
    <FestivalThemeContext.Provider value={value}>
      {children}
    </FestivalThemeContext.Provider>
  );
}

/**
 * Hook to access festival theme context
 * @throws Error if used outside FestivalThemeProvider
 */
export function useFestivalTheme(): FestivalThemeContextValue {
  const context = React.useContext(FestivalThemeContext);

  if (!context) {
    throw new Error("useFestivalTheme must be used within a FestivalThemeProvider");
  }

  return context;
}
