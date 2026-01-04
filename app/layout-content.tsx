"use client";

import * as React from "react";
import { FestivalThemeProvider } from "@/lib/contexts/FestivalThemeContext";
import { Navigation } from "@/components/Navigation";
import { CherryBlossomAccents } from "@/components/CherryBlossomAccents";
import { FestivalDecor } from "@/components/FestivalDecor";

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  return (
    <FestivalThemeProvider>
      {/* Cherry Blossom Accents - subtle corners (z-1) */}
      {/* Intensity controlled by global settings */}
      <CherryBlossomAccents position="corners" />
      
      {/* Festival Decorations (z-1) */}
      {/* Intensity controlled by global settings (decorationIntensity) */}
      <FestivalDecor />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content (z-10) */}
      <main className="relative z-10">
        {children}
      </main>
    </FestivalThemeProvider>
  );
}
