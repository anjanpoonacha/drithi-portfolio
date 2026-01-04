"use client";

import * as React from "react";
import { useFestivalTheme } from "@/lib/contexts/FestivalThemeContext";

interface CherryBlossomAccentsProps {
  position?: "corners" | "top" | "full";
  className?: string;
  /** Admin preview mode (ignores global enable flag) */
  adminPreview?: boolean;
  /** Explicitly control visibility (default: true) */
  enabled?: boolean;
}

export function CherryBlossomAccents({
  position = "corners",
  className = "",
  adminPreview = false,
  enabled = true,
}: CherryBlossomAccentsProps): React.ReactElement | null {
  const { globalSettings } = useFestivalTheme();

  // Check if cherry blossoms should be shown
  // Default to enabled unless explicitly disabled via prop or global settings
  const shouldShow = 
    enabled && 
    (adminPreview || globalSettings?.enableCherryBlossoms !== false);

  if (!shouldShow) {
    return null;
  }

  const showTopLeft = position === "corners" || position === "top" || position === "full";
  const showTopRight = position === "corners" || position === "top" || position === "full";
  const showBottomLeft = position === "full";
  const showBottomRight = position === "full";

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {/* Top Left Branch */}
      {showTopLeft && (
        <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 opacity-20">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-float-slow"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Branch */}
            <path
              d="M20 20 Q60 40 80 80 Q100 120 120 160"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-purple-primary"
              opacity="0.4"
            />
            
            {/* Small branches */}
            <path d="M50 50 L70 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            <path d="M70 70 L90 65" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            <path d="M90 100 L105 95" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            
            {/* Blossoms */}
            <circle cx="70" cy="40" r="8" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle" />
            <circle cx="75" cy="38" r="6" fill="#FFFFFF" opacity="0.5" />
            
            <circle cx="90" cy="65" r="7" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle delay-100" />
            <circle cx="94" cy="63" r="5" fill="#FFFFFF" opacity="0.5" />
            
            <circle cx="105" cy="95" r="6" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle delay-200" />
            <circle cx="108" cy="93" r="4" fill="#FFFFFF" opacity="0.5" />
          </svg>
        </div>
      )}

      {/* Top Right Branch */}
      {showTopRight && (
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 opacity-20 scale-x-[-1]">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full animate-float-slow delay-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Branch */}
            <path
              d="M20 20 Q60 40 80 80 Q100 120 120 160"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className="text-purple-primary"
              opacity="0.4"
            />
            
            {/* Small branches */}
            <path d="M50 50 L70 40" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            <path d="M70 70 L90 65" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            <path d="M90 100 L105 95" stroke="currentColor" strokeWidth="2" fill="none" className="text-purple-primary" opacity="0.3" />
            
            {/* Blossoms */}
            <circle cx="70" cy="40" r="8" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle delay-150" />
            <circle cx="75" cy="38" r="6" fill="#FFFFFF" opacity="0.5" />
            
            <circle cx="90" cy="65" r="7" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle delay-250" />
            <circle cx="94" cy="63" r="5" fill="#FFFFFF" opacity="0.5" />
            
            <circle cx="105" cy="95" r="6" fill="#FFB7D5" opacity="0.6" className="animate-pulse-subtle" />
            <circle cx="108" cy="93" r="4" fill="#FFFFFF" opacity="0.5" />
          </svg>
        </div>
      )}

      {/* Bottom Left Petal Cluster */}
      {showBottomLeft && (
        <div className="absolute bottom-8 left-8 w-16 h-16 md:w-24 md:h-24 opacity-15">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin-slow"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFB7D5" opacity="0.7" transform="rotate(0 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFB7D5" opacity="0.7" transform="rotate(72 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFB7D5" opacity="0.7" transform="rotate(144 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFB7D5" opacity="0.7" transform="rotate(216 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFB7D5" opacity="0.7" transform="rotate(288 50 50)" />
            <circle cx="50" cy="50" r="6" fill="#FFFFFF" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* Bottom Right Petal Cluster */}
      {showBottomRight && (
        <div className="absolute bottom-8 right-8 w-16 h-16 md:w-24 md:h-24 opacity-15">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full animate-spin-slow-reverse"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(0 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(72 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(144 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(216 50 50)" />
            <ellipse cx="50" cy="30" rx="8" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(288 50 50)" />
            <circle cx="50" cy="50" r="6" fill="#FFB7D5" opacity="0.8" />
          </svg>
        </div>
      )}

      {/* Floating petal accents for 'full' mode */}
      {position === "full" && (
        <>
          <div className="absolute top-1/4 left-1/4 w-6 h-6 md:w-8 md:h-8 opacity-20 animate-float">
            <svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10" cy="12" rx="8" ry="10" fill="#FFB7D5" opacity="0.8" />
            </svg>
          </div>
          
          <div className="absolute top-1/3 right-1/3 w-5 h-5 md:w-7 md:h-7 opacity-20 animate-float delay-500">
            <svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10" cy="12" rx="8" ry="10" fill="#FFFFFF" opacity="0.8" />
            </svg>
          </div>
          
          <div className="absolute bottom-1/3 left-1/2 w-4 h-4 md:w-6 md:h-6 opacity-20 animate-float delay-700">
            <svg viewBox="0 0 20 24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="10" cy="12" rx="8" ry="10" fill="#FFB7D5" opacity="0.8" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

CherryBlossomAccents.displayName = "CherryBlossomAccents";
