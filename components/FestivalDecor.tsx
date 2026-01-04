"use client";

import * as React from "react";

import type { DecorationType } from "@/lib/festivals";
import { useFestivalTheme } from "@/lib/contexts/FestivalThemeContext";
import { cn } from "@/lib/utils";

/**
 * Utility to generate non-overlapping positions for decorations
 */
function generateSmartPositions(
  count: number,
  config: DecorationConfig = {
    minSpacing: 100,
    edgePadding: 5,
    centerExclusion: { width: 40, height: 30 },
    sizeMultiplier: 1,
    gridCellSize: 150,
  }
): Array<{ left: string; top: string }> {
  const positions: Array<{ x: number; y: number }> = [];
  const occupiedCells = new Set<string>();
  
  const { minSpacing, edgePadding, centerExclusion, gridCellSize } = config;
  
  // Calculate center exclusion zone
  const centerLeft = 50 - centerExclusion.width / 2;
  const centerRight = 50 + centerExclusion.width / 2;
  const centerTop = 50 - centerExclusion.height / 2;
  const centerBottom = 50 + centerExclusion.height / 2;
  
  const maxAttempts = count * 20;
  let attempts = 0;
  
  while (positions.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Generate random position with edge padding
    const x = edgePadding + Math.random() * (100 - 2 * edgePadding);
    const y = edgePadding + Math.random() * (100 - 2 * edgePadding);
    
    // Check if in center exclusion zone
    if (x >= centerLeft && x <= centerRight && y >= centerTop && y <= centerBottom) {
      continue;
    }
    
    // Calculate grid cell
    const cellX = Math.floor(x / gridCellSize * 100);
    const cellY = Math.floor(y / gridCellSize * 100);
    const cellKey = `${cellX},${cellY}`;
    
    // Check if cell is occupied (max 1 decoration per cell)
    if (occupiedCells.has(cellKey)) {
      continue;
    }
    
    // Check minimum spacing with existing positions
    let tooClose = false;
    for (const pos of positions) {
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (distance < minSpacing / 10) { // Convert to percentage scale
        tooClose = true;
        break;
      }
    }
    
    if (!tooClose) {
      positions.push({ x, y });
      occupiedCells.add(cellKey);
    }
  }
  
  return positions.map((pos) => ({
    left: `${pos.x}%`,
    top: `${pos.y}%`,
  }));
}

/**
 * Configuration for smart decoration distribution
 */
interface DecorationConfig {
  /** Minimum spacing between decorations in pixels */
  minSpacing: number;
  /** Edge padding from viewport edges in percentage */
  edgePadding: number;
  /** Center area to avoid (percentage of viewport width/height) */
  centerExclusion: { width: number; height: number };
  /** Maximum decoration size multiplier */
  sizeMultiplier: number;
  /** Grid cell size for collision detection */
  gridCellSize: number;
}

/**
 * Props for FestivalDecor component
 */
interface FestivalDecorProps {
  /** Intensity of decorations (1-5, uses global setting if not provided) */
  intensity?: 1 | 2 | 3 | 4 | 5;
  /** Custom className for positioning */
  className?: string;
  /** Override decoration types (uses festival defaults if not provided) */
  decorationTypes?: DecorationType[];
  /** Admin preview mode (ignores global enable flag) */
  adminPreview?: boolean;
  /** Show default decorations when no festival is active (default: true) */
  showWhenNoFestival?: boolean;
}

/**
 * FestivalDecor - Renders animated festival decorations based on current festival
 */
export function FestivalDecor({
  intensity,
  className,
  decorationTypes,
  adminPreview = false,
  showWhenNoFestival = true,
}: FestivalDecorProps) {
  const { 
    currentFestival, 
    isEnabled, 
    globalSettings, 
    decorationIntensity 
  } = useFestivalTheme();

  // Determine if we should show decorations
  const hasActiveFestival = currentFestival && isEnabled;
  const shouldShowFestivalDecor = adminPreview 
    ? hasActiveFestival
    : hasActiveFestival && globalSettings?.enableFestivalDecor !== false;

  // Show default decorations if no festival is active and showWhenNoFestival is true
  const shouldShowDefault = !hasActiveFestival && showWhenNoFestival && globalSettings?.enableFestivalDecor !== false;

  if (!shouldShowFestivalDecor && !shouldShowDefault) {
    return null;
  }

  // Use provided intensity or fall back to global setting
  const actualIntensity = intensity ?? decorationIntensity;
  
  // Determine decoration types
  let types: DecorationType[];
  if (shouldShowFestivalDecor && currentFestival) {
    // Use festival-specific decorations
    types = decorationTypes ?? currentFestival.decorationType;
  } else {
    // Use default subtle decorations
    types = decorationTypes ?? ["sparkles", "flowers"];
  }
  
  // Reduced count for better distribution (intensity * 2.5 instead of * 4)
  const count = Math.ceil(actualIntensity * 2.5);

  return (
    <>
      {/* Layer 1: Background decorations (z-1) */}
      <div
        className={cn(
          "pointer-events-none fixed inset-0 overflow-hidden",
          className
        )}
        style={{ zIndex: 1 }}
        aria-hidden="true"
      >
        {types.slice(0, 1).map((type) => (
          <DecorationType key={`${type}-bg`} type={type} count={count} layer="background" />
        ))}
      </div>
      
      {/* Layer 2: Mid-layer decorations (z-2) */}
      {types.length > 1 && (
        <div
          className={cn(
            "pointer-events-none fixed inset-0 overflow-hidden",
            className
          )}
          style={{ zIndex: 2 }}
          aria-hidden="true"
        >
          {types.slice(1, 2).map((type) => (
            <DecorationType key={`${type}-mid`} type={type} count={count} layer="mid" />
          ))}
        </div>
      )}
      
      {/* Layer 3: Foreground decorations (z-3) */}
      {types.length > 2 && (
        <div
          className={cn(
            "pointer-events-none fixed inset-0 overflow-hidden",
            className
          )}
          style={{ zIndex: 3 }}
          aria-hidden="true"
        >
          {types.slice(2).map((type) => (
            <DecorationType key={`${type}-fg`} type={type} count={count} layer="foreground" />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Renders specific decoration type
 */
function DecorationType({ type, count, layer = "background" }: { type: DecorationType; count: number; layer?: string }) {
  switch (type) {
    case "diyas":
      return <Diyas count={count} />;
    case "colors":
      return <ColorSplashes count={count} />;
    case "snowflakes":
      return <Snowflakes count={count} />;
    case "flowers":
      return <Flowers count={count} />;
    case "stars":
      return <Stars count={count} />;
    case "sparkles":
      return <Sparkles count={count} />;
    default:
      return null;
  }
}

/**
 * Diwali Diyas (Oil Lamps) - Enhanced with rangoli, fireworks, lanterns
 */
function Diyas({ count }: { count: number }) {
  const decorations = React.useMemo(() => {
    const items: Array<{
      type: string;
      id: string;
      left: string;
      top?: string;
      size: number;
      delay: number;
      duration: number;
      variant?: number;
    }> = [];
    // Reduced counts for better distribution (50% reduction)
    const diyaCount = Math.ceil(count * 0.2);
    const rangolioCount = Math.ceil(count * 0.1);
    const fireworkCount = Math.ceil(count * 0.15);
    const lanternCount = Math.ceil(count * 0.1);
    const goldSparkleCount = Math.ceil(count * 0.15);

    // Generate smart positions for each decoration type
    const diyaPositions = generateSmartPositions(diyaCount, { 
      minSpacing: 120, 
      edgePadding: 8, 
      centerExclusion: { width: 40, height: 30 },
      sizeMultiplier: 0.6,
      gridCellSize: 150,
    });
    const rangoliPositions = generateSmartPositions(rangolioCount, { 
      minSpacing: 180, 
      edgePadding: 10, 
      centerExclusion: { width: 50, height: 40 },
      sizeMultiplier: 1,
      gridCellSize: 200,
    });
    const fireworkPositions = generateSmartPositions(fireworkCount, { 
      minSpacing: 150, 
      edgePadding: 8, 
      centerExclusion: { width: 45, height: 35 },
      sizeMultiplier: 0.8,
      gridCellSize: 180,
    });
    const lanternPositions = generateSmartPositions(lanternCount, { 
      minSpacing: 130, 
      edgePadding: 8, 
      centerExclusion: { width: 40, height: 30 },
      sizeMultiplier: 0.6,
      gridCellSize: 160,
    });
    const sparklePositions = generateSmartPositions(goldSparkleCount, { 
      minSpacing: 80, 
      edgePadding: 5, 
      centerExclusion: { width: 35, height: 25 },
      sizeMultiplier: 0.4,
      gridCellSize: 120,
    });

    // Diyas with flickering flames - reduced size (20-35px instead of 25-50px)
    diyaPositions.forEach((pos, i) => {
      items.push({
        type: 'diya',
        id: `diya-${i}`,
        left: pos.left,
        top: pos.top,
        size: 20 + Math.random() * 15,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
      });
    });

    // Rangoli patterns - reduced size (40-80px instead of 60-140px)
    rangoliPositions.forEach((pos, i) => {
      items.push({
        type: 'rangoli',
        id: `rangoli-${i}`,
        left: pos.left,
        top: pos.top,
        size: 40 + Math.random() * 40,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 4,
        variant: Math.floor(Math.random() * 3),
      });
    });

    // Firework bursts - reduced size (35-70px instead of 50-150px)
    fireworkPositions.forEach((pos, i) => {
      items.push({
        type: 'firework',
        id: `firework-${i}`,
        left: pos.left,
        top: pos.top.replace('%', '') < '60' ? pos.top : `${Math.random() * 60}%`, // Keep in upper area
        size: 35 + Math.random() * 35,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 2,
      });
    });

    // Sky lanterns - reduced size (20-30px instead of 30-50px)
    lanternPositions.forEach((pos, i) => {
      items.push({
        type: 'lantern',
        id: `lantern-${i}`,
        left: pos.left,
        size: 20 + Math.random() * 10,
        delay: Math.random() * 6,
        duration: 15 + Math.random() * 10,
      });
    });

    // Gold sparkles - reduced size (6-12px instead of 8-20px)
    sparklePositions.forEach((pos, i) => {
      items.push({
        type: 'goldSparkle',
        id: `gold-${i}`,
        left: pos.left,
        top: pos.top,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 3,
        duration: 1.5 + Math.random() * 1.5,
      });
    });

    return items;
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes diya-flicker {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes rangoli-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.95) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.05) rotate(5deg); }
        }
        @keyframes firework-burst {
          0% { opacity: 0; transform: scale(0); }
          20% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2); }
        }
        @keyframes lantern-rise {
          0% { transform: translateY(100vh) scale(0.8); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100px) scale(1); opacity: 0; }
        }
        @keyframes gold-shimmer {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .diwali-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {decorations.map((item) => {
        if (item.type === 'diya') {
          return (
            <div
              key={item.id}
              className="absolute diwali-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `diya-flicker ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`flame-${item.id}`}>
                    <stop offset="0%" stopColor="#FFFACD" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </radialGradient>
                  <filter id={`glow-${item.id}`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Clay lamp base */}
                <ellipse cx="20" cy="30" rx="16" ry="5" fill="#8B4513" opacity="0.8" />
                <path d="M8 30 Q8 24 20 22 Q32 24 32 30" fill="#D2691E" />
                <ellipse cx="20" cy="26" rx="12" ry="3" fill="#A0522D" opacity="0.6" />
                {/* Flame */}
                <path
                  d="M20 8 Q17 16 20 22 Q23 16 20 8"
                  fill={`url(#flame-${item.id})`}
                  filter={`url(#glow-${item.id})`}
                />
                <path
                  d="M20 12 Q19 16 20 20 Q21 16 20 12"
                  fill="#FFF"
                  opacity="0.7"
                />
              </svg>
            </div>
          );
        }

        if (item.type === 'rangoli') {
          return (
            <div
              key={item.id}
              className="absolute diwali-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `rangoli-pulse ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`rangoli-${item.id}`}>
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="33%" stopColor="#FF6B35" />
                    <stop offset="66%" stopColor="#9370DB" />
                    <stop offset="100%" stopColor="#FF1493" />
                  </radialGradient>
                </defs>
                {item.variant === 0 && (
                  // Lotus pattern
                  <>
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                      <ellipse
                        key={angle}
                        cx="50"
                        cy="20"
                        rx="8"
                        ry="20"
                        fill={`url(#rangoli-${item.id})`}
                        opacity="0.5"
                        transform={`rotate(${angle} 50 50)`}
                      />
                    ))}
                    <circle cx="50" cy="50" r="15" fill="#FFD700" opacity="0.6" />
                    <circle cx="50" cy="50" r="8" fill="#FF6B35" opacity="0.7" />
                  </>
                )}
                {item.variant === 1 && (
                  // Mandala pattern
                  <>
                    <circle cx="50" cy="50" r="40" stroke="#FFD700" strokeWidth="2" fill="none" opacity="0.4" />
                    <circle cx="50" cy="50" r="30" stroke="#FF6B35" strokeWidth="2" fill="none" opacity="0.5" />
                    <circle cx="50" cy="50" r="20" stroke="#9370DB" strokeWidth="2" fill="none" opacity="0.6" />
                    {[0, 60, 120, 180, 240, 300].map((angle) => (
                      <line
                        key={angle}
                        x1="50"
                        y1="50"
                        x2={50 + 40 * Math.cos((angle * Math.PI) / 180)}
                        y2={50 + 40 * Math.sin((angle * Math.PI) / 180)}
                        stroke="#FF1493"
                        strokeWidth="2"
                        opacity="0.5"
                      />
                    ))}
                  </>
                )}
                {item.variant === 2 && (
                  // Geometric pattern
                  <>
                    <circle cx="50" cy="50" r="35" fill={`url(#rangoli-${item.id})`} opacity="0.3" />
                    {[0, 72, 144, 216, 288].map((angle) => (
                      <circle
                        key={angle}
                        cx={50 + 25 * Math.cos((angle * Math.PI) / 180)}
                        cy={50 + 25 * Math.sin((angle * Math.PI) / 180)}
                        r="12"
                        fill="#FFD700"
                        opacity="0.5"
                      />
                    ))}
                  </>
                )}
              </svg>
            </div>
          );
        }

        if (item.type === 'firework') {
          return (
            <div
              key={item.id}
              className="absolute diwali-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `firework-burst ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`firework-${item.id}`}>
                    <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
                    <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Radiating lines */}
                {Array.from({ length: 16 }, (_, i) => {
                  const angle = (i * 360) / 16;
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 45 * Math.cos((angle * Math.PI) / 180)}
                      y2={50 + 45 * Math.sin((angle * Math.PI) / 180)}
                      stroke={`url(#firework-${item.id})`}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Sparkle points */}
                {Array.from({ length: 16 }, (_, i) => {
                  const angle = (i * 360) / 16;
                  return (
                    <circle
                      key={i}
                      cx={50 + 45 * Math.cos((angle * Math.PI) / 180)}
                      cy={50 + 45 * Math.sin((angle * Math.PI) / 180)}
                      r="2"
                      fill="#FFD700"
                    />
                  );
                })}
              </svg>
            </div>
          );
        }

        if (item.type === 'lantern') {
          return (
            <div
              key={item.id}
              className="absolute diwali-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `lantern-rise ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`lantern-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
                <rect x="5" y="8" width="20" height="25" rx="3" fill={`url(#lantern-${item.id})`} opacity="0.7" />
                <rect x="7" y="10" width="16" height="20" fill="#FFD700" opacity="0.3" />
                <path d="M10 5 L15 0 L20 5" fill="#8B4513" />
                <line x1="15" y1="0" x2="15" y2="8" stroke="#8B4513" strokeWidth="1" />
              </svg>
            </div>
          );
        }

        if (item.type === 'goldSparkle') {
          return (
            <div
              key={item.id}
              className="absolute diwali-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `gold-shimmer ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
                  fill="#FFD700"
                />
                <circle cx="10" cy="10" r="3" fill="#FFF" opacity="0.8" />
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * Holi Color Splashes - Enhanced with gulal, pichkari, color trails
 */
function ColorSplashes({ count }: { count: number }) {
  const decorations = React.useMemo(() => {
    const items: Array<{
      type: string;
      id: string;
      left: string;
      top?: string;
      size: number;
      color?: string;
      colors?: string[];
      delay: number;
      duration: number;
    }> = [];
    // Reduced counts (50% reduction)
    const splashCount = Math.ceil(count * 0.2);
    const gulalCount = Math.ceil(count * 0.15);
    const trailCount = Math.ceil(count * 0.15);
    const burstCount = Math.ceil(count * 0.15);

    const holiColors = ['#FF1493', '#00CED1', '#FFD700', '#FF6347', '#9370DB', '#32CD32', '#FF69B4'];

    // Generate smart positions
    const splashPositions = generateSmartPositions(splashCount, { 
      minSpacing: 130, 
      edgePadding: 8, 
      centerExclusion: { width: 40, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 160,
    });
    const gulalPositions = generateSmartPositions(gulalCount, { 
      minSpacing: 150, 
      edgePadding: 10, 
      centerExclusion: { width: 45, height: 35 },
      sizeMultiplier: 0.9,
      gridCellSize: 180,
    });
    const trailPositions = generateSmartPositions(trailCount, { 
      minSpacing: 100, 
      edgePadding: 8, 
      centerExclusion: { width: 35, height: 25 },
      sizeMultiplier: 0.5,
      gridCellSize: 140,
    });
    const burstPositions = generateSmartPositions(burstCount, { 
      minSpacing: 140, 
      edgePadding: 8, 
      centerExclusion: { width: 42, height: 32 },
      sizeMultiplier: 0.8,
      gridCellSize: 170,
    });

    // Color splashes - reduced size (35-60px instead of 50-130px)
    splashPositions.forEach((pos, i) => {
      items.push({
        type: 'splash',
        id: `splash-${i}`,
        left: pos.left,
        top: pos.top,
        size: 35 + Math.random() * 25,
        color: holiColors[Math.floor(Math.random() * holiColors.length)],
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      });
    });

    // Gulal powder clouds - reduced size (40-80px instead of 60-160px)
    gulalPositions.forEach((pos, i) => {
      items.push({
        type: 'gulal',
        id: `gulal-${i}`,
        left: pos.left,
        top: pos.top || '0%',
        size: 40 + Math.random() * 40,
        color: holiColors[Math.floor(Math.random() * holiColors.length)],
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 3,
      });
    });

    // Color trails - reduced size (20-35px instead of 30-70px)
    trailPositions.forEach((pos, i) => {
      items.push({
        type: 'trail',
        id: `trail-${i}`,
        left: pos.left,
        size: 20 + Math.random() * 15,
        color: holiColors[Math.floor(Math.random() * holiColors.length)],
        delay: Math.random() * 4,
        duration: 5 + Math.random() * 3,
      });
    });

    // Powder bursts - reduced size (45-75px instead of 70-160px)
    burstPositions.forEach((pos, i) => {
      items.push({
        type: 'burst',
        id: `burst-${i}`,
        left: pos.left,
        top: pos.top,
        size: 45 + Math.random() * 30,
        colors: [
          holiColors[Math.floor(Math.random() * holiColors.length)] ?? '#FF1493',
          holiColors[Math.floor(Math.random() * holiColors.length)] ?? '#00CED1',
        ],
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
      });
    });

    return items;
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes color-burst {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1) rotate(180deg); }
          100% { opacity: 0; transform: scale(1.5) rotate(360deg); }
        }
        @keyframes gulal-cloud {
          0% { opacity: 0; transform: scale(0.3) translateY(0); filter: blur(5px); }
          30% { opacity: 0.8; transform: scale(1.2) translateY(-20px); filter: blur(20px); }
          100% { opacity: 0; transform: scale(2) translateY(-50px); filter: blur(40px); }
        }
        @keyframes color-trail {
          0% { transform: translateY(-100px); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes powder-burst {
          0% { opacity: 0; transform: scale(0); }
          20% { opacity: 1; transform: scale(0.8); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @media (prefers-reduced-motion: reduce) {
          .holi-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {decorations.map((item) => {
        if (item.type === 'splash') {
          return (
            <div
              key={item.id}
              className="absolute rounded-full blur-md holi-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                backgroundColor: item.color,
                animation: `color-burst ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            />
          );
        }

        if (item.type === 'gulal') {
          return (
            <div
              key={item.id}
              className="absolute holi-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `gulal-cloud ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`gulal-${item.id}`}>
                    <stop offset="0%" stopColor={item.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill={`url(#gulal-${item.id})`} />
                <circle cx="30" cy="40" r="25" fill={item.color} opacity="0.3" />
                <circle cx="65" cy="55" r="30" fill={item.color} opacity="0.3" />
                <circle cx="45" cy="65" r="20" fill={item.color} opacity="0.4" />
              </svg>
            </div>
          );
        }

        if (item.type === 'trail') {
          return (
            <div
              key={item.id}
              className="absolute holi-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size * 3}px`,
                animation: `color-trail ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`trail-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={item.color} stopOpacity="0" />
                    <stop offset="50%" stopColor={item.color} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <rect width="30" height="90" fill={`url(#trail-${item.id})`} rx="15" />
              </svg>
            </div>
          );
        }

        if (item.type === 'burst' && 'colors' in item) {
          const colors = item.colors as [string, string];
          return (
            <div
              key={item.id}
              className="absolute holi-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `powder-burst ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`burst-${item.id}`}>
                    <stop offset="0%" stopColor={colors[0]} stopOpacity="0.9" />
                    <stop offset="50%" stopColor={colors[1]} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={colors[0]} stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Explosive radial pattern */}
                {Array.from({ length: 12 }, (_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <ellipse
                      key={i}
                      cx="50"
                      cy="15"
                      rx="8"
                      ry="20"
                      fill={colors[i % 2]}
                      opacity="0.6"
                      transform={`rotate(${angle} 50 50)`}
                    />
                  );
                })}
                <circle cx="50" cy="50" r="40" fill={`url(#burst-${item.id})`} />
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * Christmas Snowflakes - Enhanced with Santa hats, ornaments, candy canes, bells, holly, gifts
 */
function Snowflakes({ count }: { count: number }) {
  const decorations = React.useMemo(() => {
    const items: Array<{
      type: string;
      id: string;
      left: string;
      top?: string;
      size: number;
      delay: number;
      duration: number;
      drift?: number;
      color?: string;
    }> = [];
    
    // Reduced counts (50% reduction)
    const snowflakeCount = Math.ceil(count * 0.1);
    const santaHatCount = Math.ceil(count * 0.05);
    const ornamentCount = Math.ceil(count * 0.08);
    const candyCaneCount = Math.ceil(count * 0.05);
    const bellCount = Math.ceil(count * 0.05);
    const hollyCount = Math.ceil(count * 0.05);
    const giftCount = Math.ceil(count * 0.05);
    const icicleCount = Math.ceil(count * 0.05);
    const starCount = Math.ceil(count * 0.03);
    const christmasColors = ['#C41E3A', '#228B22', '#FFD700', '#4169E1', '#FF69B4'];

    // Generate smart positions for each decoration type
    const snowflakePositions = generateSmartPositions(snowflakeCount, {
      minSpacing: 100,
      edgePadding: 5,
      centerExclusion: { width: 35, height: 25 },
      sizeMultiplier: 0.5,
      gridCellSize: 130,
    });
    const santaHatPositions = generateSmartPositions(santaHatCount, {
      minSpacing: 150,
      edgePadding: 8,
      centerExclusion: { width: 45, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 170,
    });
    const ornamentPositions = generateSmartPositions(ornamentCount, {
      minSpacing: 120,
      edgePadding: 8,
      centerExclusion: { width: 40, height: 28 },
      sizeMultiplier: 0.6,
      gridCellSize: 150,
    });
    const candyCanePositions = generateSmartPositions(candyCaneCount, {
      minSpacing: 140,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.6,
      gridCellSize: 160,
    });
    const bellPositions = generateSmartPositions(bellCount, {
      minSpacing: 130,
      edgePadding: 8,
      centerExclusion: { width: 40, height: 28 },
      sizeMultiplier: 0.6,
      gridCellSize: 155,
    });
    const hollyPositions = generateSmartPositions(hollyCount, {
      minSpacing: 125,
      edgePadding: 8,
      centerExclusion: { width: 40, height: 28 },
      sizeMultiplier: 0.6,
      gridCellSize: 150,
    });
    const giftPositions = generateSmartPositions(giftCount, {
      minSpacing: 145,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 165,
    });
    const iciclePositions = generateSmartPositions(icicleCount, {
      minSpacing: 135,
      edgePadding: 5,
      centerExclusion: { width: 38, height: 26 },
      sizeMultiplier: 0.6,
      gridCellSize: 160,
    });
    const starPositions = generateSmartPositions(starCount, {
      minSpacing: 140,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.6,
      gridCellSize: 165,
    });

    // Enhanced snowflakes - reduced size (12-22px instead of 15-40px)
    snowflakePositions.forEach((pos, i) => {
      items.push({
        type: 'snowflake',
        id: `snow-${i}`,
        left: pos.left,
        size: 12 + Math.random() * 10,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 10,
        drift: -30 + Math.random() * 60,
      });
    });

    // Santa hats - reduced size (22-35px instead of 30-55px)
    santaHatPositions.forEach((pos, i) => {
      items.push({
        type: 'santaHat',
        id: `hat-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 13,
        delay: Math.random() * 4,
        duration: 12 + Math.random() * 8,
        drift: -40 + Math.random() * 80,
      });
    });

    // Christmas ornaments - reduced size (18-30px instead of 25-45px)
    ornamentPositions.forEach((pos, i) => {
      items.push({
        type: 'ornament',
        id: `ornament-${i}`,
        left: pos.left,
        size: 18 + Math.random() * 12,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 8,
        color: christmasColors[Math.floor(Math.random() * christmasColors.length)],
        drift: -25 + Math.random() * 50,
      });
    });

    // Candy canes - reduced size (22-32px instead of 30-50px)
    candyCanePositions.forEach((pos, i) => {
      items.push({
        type: 'candyCane',
        id: `candy-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 10,
        delay: Math.random() * 6,
        duration: 15 + Math.random() * 10,
        drift: -20 + Math.random() * 40,
      });
    });

    // Bells - reduced size (18-28px instead of 25-45px)
    bellPositions.forEach((pos, i) => {
      items.push({
        type: 'bell',
        id: `bell-${i}`,
        left: pos.left,
        top: pos.top,
        size: 18 + Math.random() * 10,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
      });
    });

    // Holly berries - reduced size (22-32px instead of 30-50px)
    hollyPositions.forEach((pos, i) => {
      items.push({
        type: 'holly',
        id: `holly-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 10,
        delay: Math.random() * 5,
        duration: 12 + Math.random() * 8,
        drift: -15 + Math.random() * 30,
      });
    });

    // Gift boxes - reduced size (22-35px instead of 30-55px)
    giftPositions.forEach((pos, i) => {
      items.push({
        type: 'gift',
        id: `gift-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 13,
        delay: Math.random() * 7,
        duration: 15 + Math.random() * 10,
        drift: -30 + Math.random() * 60,
      });
    });

    // Icicles - reduced size (15-30px instead of 20-50px)
    iciclePositions.forEach((pos, i) => {
      items.push({
        type: 'icicle',
        id: `icicle-${i}`,
        left: pos.left,
        top: '0%',
        size: 15 + Math.random() * 15,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2,
      });
    });

    // Twinkling stars - reduced size (15-28px instead of 20-45px)
    starPositions.forEach((pos, i) => {
      items.push({
        type: 'star',
        id: `xmas-star-${i}`,
        left: pos.left,
        top: pos.top,
        size: 15 + Math.random() * 13,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
      });
    });

    return items;
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes snowfall {
          0% { 
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(100vh) translateX(var(--drift)) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes float-down {
          0% { 
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { 
            transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rotation, 180deg));
            opacity: 0;
          }
        }
        @keyframes bell-ring {
          0%, 100% { opacity: 0.7; transform: rotate(-5deg) scale(1); }
          50% { opacity: 1; transform: rotate(5deg) scale(1.1); }
        }
        @keyframes icicle-drip {
          0%, 100% { opacity: 0.6; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.1); }
        }
        @keyframes star-twinkle-xmas {
          0%, 100% { opacity: 0.4; transform: scale(0.8) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .christmas-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {decorations.map((item) => {
        if (item.type === 'snowflake') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `snowfall ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
              }}
            >
              <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id={`snow-glow-${item.id}`}>
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* 6-pointed intricate snowflake */}
                <g filter={`url(#snow-glow-${item.id})`}>
                  <line x1="15" y1="2" x2="15" y2="28" stroke="#C0E8FF" strokeWidth="2" strokeLinecap="round" />
                  <line x1="3" y1="15" x2="27" y2="15" stroke="#C0E8FF" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="6" x2="24" y2="24" stroke="#C0E8FF" strokeWidth="2" strokeLinecap="round" />
                  <line x1="24" y1="6" x2="6" y2="24" stroke="#C0E8FF" strokeWidth="2" strokeLinecap="round" />
                  {/* Branch details */}
                  {[0, 60, 120, 180, 240, 300].map((angle) => (
                    <g key={angle} transform={`rotate(${angle} 15 15)`}>
                      <line x1="15" y1="5" x2="12" y2="8" stroke="#E0F4FF" strokeWidth="1" />
                      <line x1="15" y1="5" x2="18" y2="8" stroke="#E0F4FF" strokeWidth="1" />
                    </g>
                  ))}
                  <circle cx="15" cy="15" r="3" fill="#FFF" opacity="0.8" />
                </g>
              </svg>
            </div>
          );
        }

        if (item.type === 'santaHat') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `float-down ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
                '--rotation': '90deg',
              }}
            >
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Red cone */}
                <path d="M20 5 L10 30 L30 30 Z" fill="#C41E3A" />
                <path d="M20 5 L12 30 L28 30 Z" fill="#DC143C" />
                {/* White trim */}
                <rect x="8" y="28" width="24" height="4" rx="2" fill="#FFF" />
                {/* White pom-pom */}
                <circle cx="20" cy="5" r="4" fill="#FFF" />
                <circle cx="20" cy="5" r="3" fill="#F0F0F0" />
              </svg>
            </div>
          );
        }

        if (item.type === 'ornament') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `float-down ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
                '--rotation': '45deg',
              }}
            >
              <svg viewBox="0 0 30 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`ornament-${item.id}`}>
                    <stop offset="0%" stopColor="#FFF" stopOpacity="0.8" />
                    <stop offset="50%" stopColor={item.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                  </radialGradient>
                  <filter id={`shine-${item.id}`}>
                    <feGaussianBlur stdDeviation="1" />
                  </filter>
                </defs>
                {/* Hanger */}
                <rect x="13" y="0" width="4" height="5" fill="#DAA520" />
                {/* Sphere */}
                <circle cx="15" cy="20" r="13" fill={`url(#ornament-${item.id})`} />
                {/* Shine */}
                <ellipse cx="11" cy="15" rx="4" ry="6" fill="#FFF" opacity="0.5" filter={`url(#shine-${item.id})`} />
              </svg>
            </div>
          );
        }

        if (item.type === 'candyCane') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `float-down ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
                '--rotation': '270deg',
              }}
            >
              <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id={`stripes-${item.id}`} x="0" y="0" width="8" height="40" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="40" fill="#C41E3A" />
                    <rect x="4" y="0" width="4" height="40" fill="#FFF" />
                  </pattern>
                </defs>
                {/* J-shape candy cane */}
                <path
                  d="M15 8 Q15 3 20 3 Q25 3 25 8 L25 30 Q25 35 20 35 Q15 35 15 30 L15 20"
                  stroke={`url(#stripes-${item.id})`}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          );
        }

        if (item.type === 'bell') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `bell-ring ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`bell-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#DAA520" />
                  </linearGradient>
                  <filter id={`bell-glow-${item.id}`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Bell shape */}
                <path
                  d="M15 8 Q10 8 8 15 Q8 22 15 28 Q22 22 22 15 Q20 8 15 8"
                  fill={`url(#bell-${item.id})`}
                  filter={`url(#bell-glow-${item.id})`}
                />
                {/* Bow */}
                <rect x="12" y="3" width="6" height="6" rx="1" fill="#C41E3A" />
                {/* Clapper */}
                <circle cx="15" cy="28" r="2" fill="#B8860B" />
              </svg>
            </div>
          );
        }

        if (item.type === 'holly') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `float-down ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
                '--rotation': '120deg',
              }}
            >
              <svg viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Holly leaves */}
                <path
                  d="M10 15 Q8 10 12 8 Q15 6 17 10 Q19 6 22 8 Q26 10 24 15 Q26 20 22 22 Q19 24 17 20 Q15 24 12 22 Q8 20 10 15"
                  fill="#228B22"
                />
                <path
                  d="M25 15 Q23 12 26 10 Q28 9 30 12 Q31 9 33 10 Q36 12 34 15 Q36 18 33 20 Q31 21 30 18 Q28 21 26 20 Q23 18 25 15"
                  fill="#2E8B57"
                />
                {/* Red berries */}
                <circle cx="20" cy="15" r="3" fill="#C41E3A" />
                <circle cx="27" cy="15" r="3" fill="#DC143C" />
                <circle cx="23" cy="19" r="2.5" fill="#B22222" />
              </svg>
            </div>
          );
        }

        if (item.type === 'gift') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `float-down ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
                '--rotation': '60deg',
              }}
            >
              <svg viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Box */}
                <rect x="5" y="12" width="25" height="20" rx="2" fill="#C41E3A" />
                <rect x="7" y="14" width="21" height="16" fill="#DC143C" />
                {/* Ribbon vertical */}
                <rect x="15" y="12" width="5" height="20" fill="#FFD700" />
                {/* Ribbon horizontal */}
                <rect x="5" y="19" width="25" height="5" fill="#DAA520" />
                {/* Bow */}
                <ellipse cx="12" cy="10" rx="5" ry="3" fill="#FFD700" />
                <ellipse cx="23" cy="10" rx="5" ry="3" fill="#FFD700" />
                <circle cx="17.5" cy="10" r="3" fill="#DAA520" />
              </svg>
            </div>
          );
        }

        if (item.type === 'icicle') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size * 2}px`,
                animation: `icicle-drip ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 10 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`icicle-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E0F4FF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#B0E0FF" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                <path d="M0 0 L10 0 L5 30 Z" fill={`url(#icicle-${item.id})`} />
                <path d="M2 0 L8 0 L5 25 Z" fill="#FFF" opacity="0.5" />
              </svg>
            </div>
          );
        }

        if (item.type === 'star') {
          return (
            <div
              key={item.id}
              className="absolute christmas-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `star-twinkle-xmas ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <filter id={`star-glow-${item.id}`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <path
                  d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z"
                  fill="#FFD700"
                  filter={`url(#star-glow-${item.id})`}
                />
                <circle cx="12" cy="12" r="3" fill="#FFF" opacity="0.9" />
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * Flower Petals (for Dussehra) - Enhanced with marigolds, bow and arrows, victory symbols
 */
function Flowers({ count }: { count: number }) {
  const decorations = React.useMemo(() => {
    const items: Array<{
      type: string;
      id: string;
      left: string;
      top?: string;
      size: number;
      delay: number;
      duration: number;
      drift?: number;
    }> = [];
    
    // Reduced counts (50% reduction)
    const petalCount = Math.ceil(count * 0.15);
    const marigoldCount = Math.ceil(count * 0.13);
    const bowCount = Math.ceil(count * 0.08);
    const victoryCount = Math.ceil(count * 0.08);
    const flameCount = Math.ceil(count * 0.08);

    // Generate smart positions for each decoration type
    const petalPositions = generateSmartPositions(petalCount, {
      minSpacing: 90,
      edgePadding: 5,
      centerExclusion: { width: 35, height: 25 },
      sizeMultiplier: 0.4,
      gridCellSize: 120,
    });
    const marigoldPositions = generateSmartPositions(marigoldCount, {
      minSpacing: 130,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 155,
    });
    const bowPositions = generateSmartPositions(bowCount, {
      minSpacing: 150,
      edgePadding: 10,
      centerExclusion: { width: 45, height: 32 },
      sizeMultiplier: 0.8,
      gridCellSize: 175,
    });
    const victoryPositions = generateSmartPositions(victoryCount, {
      minSpacing: 140,
      edgePadding: 8,
      centerExclusion: { width: 43, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 165,
    });
    const flamePositions = generateSmartPositions(flameCount, {
      minSpacing: 135,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 160,
    });

    // Falling petals - reduced size (12-20px instead of 15-30px)
    petalPositions.forEach((pos, i) => {
      items.push({
        type: 'petal',
        id: `petal-${i}`,
        left: pos.left,
        size: 12 + Math.random() * 8,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 6,
        drift: -30 + Math.random() * 60,
      });
    });

    // Marigold garlands - reduced size (22-38px instead of 30-55px)
    marigoldPositions.forEach((pos, i) => {
      items.push({
        type: 'marigold',
        id: `marigold-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 16,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 8,
        drift: -20 + Math.random() * 40,
      });
    });

    // Bow and arrows - reduced size (28-45px instead of 40-70px)
    bowPositions.forEach((pos, i) => {
      items.push({
        type: 'bow',
        id: `bow-${i}`,
        left: pos.left,
        top: pos.top,
        size: 28 + Math.random() * 17,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
      });
    });

    // Victory banners - reduced size (25-40px instead of 35-60px)
    victoryPositions.forEach((pos, i) => {
      items.push({
        type: 'victory',
        id: `victory-${i}`,
        left: pos.left,
        top: pos.top,
        size: 25 + Math.random() * 15,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 3,
      });
    });

    // Flame effects - reduced size (22-38px instead of 30-55px)
    flamePositions.forEach((pos, i) => {
      items.push({
        type: 'flame',
        id: `flame-${i}`,
        left: pos.left,
        top: pos.top,
        size: 22 + Math.random() * 16,
        delay: Math.random() * 2,
        duration: 2 + Math.random() * 2,
      });
    });

    return items;
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes petal-fall {
          0% { 
            transform: translateY(-50px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { 
            transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes bow-shine {
          0%, 100% { opacity: 0.6; transform: scale(0.9) rotate(-5deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(5deg); }
        }
        @keyframes victory-wave {
          0%, 100% { opacity: 0.7; transform: translateY(0) rotate(0deg); }
          50% { opacity: 1; transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes flame-flicker {
          0%, 100% { opacity: 0.7; transform: scale(1) scaleY(1); }
          25% { opacity: 1; transform: scale(1.1) scaleY(1.2); }
          75% { opacity: 0.8; transform: scale(0.95) scaleY(0.9); }
        }
        @media (prefers-reduced-motion: reduce) {
          .dussehra-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {decorations.map((item) => {
        if (item.type === 'petal') {
          return (
            <div
              key={item.id}
              className="absolute dussehra-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `petal-fall ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Single marigold petal */}
                <ellipse cx="12" cy="12" rx="8" ry="12" fill="#FFA500" opacity="0.7" />
                <ellipse cx="12" cy="12" rx="6" ry="9" fill="#FFB700" opacity="0.6" />
              </svg>
            </div>
          );
        }

        if (item.type === 'marigold') {
          return (
            <div
              key={item.id}
              className="absolute dussehra-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `petal-fall ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
              }}
            >
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`marigold-${item.id}`}>
                    <stop offset="0%" stopColor="#FFED4E" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF8C00" />
                  </radialGradient>
                </defs>
                {/* Marigold flower with many petals */}
                {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle) => (
                  <ellipse
                    key={angle}
                    cx="20"
                    cy="8"
                    rx="4"
                    ry="8"
                    fill={`url(#marigold-${item.id})`}
                    opacity="0.8"
                    transform={`rotate(${angle} 20 20)`}
                  />
                ))}
                <circle cx="20" cy="20" r="6" fill="#FF8C00" />
                <circle cx="20" cy="20" r="3" fill="#FFA500" />
              </svg>
            </div>
          );
        }

        if (item.type === 'bow') {
          return (
            <div
              key={item.id}
              className="absolute dussehra-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `bow-shine ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`bow-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#DAA520" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#DAA520" />
                  </linearGradient>
                </defs>
                {/* Bow */}
                <path d="M10 25 Q10 10 15 10 Q15 20 25 25 Q15 30 15 40 Q10 40 10 25" stroke={`url(#bow-${item.id})`} strokeWidth="2" fill="none" />
                {/* Bow string */}
                <line x1="15" y1="10" x2="15" y2="40" stroke="#8B4513" strokeWidth="1" />
                {/* Arrow */}
                <line x1="15" y1="25" x2="45" y2="25" stroke={`url(#bow-${item.id})`} strokeWidth="2" />
                <path d="M45 25 L40 22 L40 28 Z" fill="#DAA520" />
                {/* Feathers */}
                <path d="M17 23 L20 20 L17 22 Z" fill="#DC143C" />
                <path d="M17 27 L20 30 L17 28 Z" fill="#FFD700" />
              </svg>
            </div>
          );
        }

        if (item.type === 'victory') {
          return (
            <div
              key={item.id}
              className="absolute dussehra-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `victory-wave ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`victory-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF4500" />
                    <stop offset="100%" stopColor="#DC143C" />
                  </linearGradient>
                </defs>
                {/* Flag pole */}
                <rect x="5" y="0" width="3" height="50" fill="#8B4513" />
                {/* Victory flag */}
                <path d="M8 5 L35 5 L30 15 L35 25 L8 25 Z" fill={`url(#victory-${item.id})`} />
                {/* Om symbol simplified */}
                <text x="17" y="18" fontSize="10" fill="#FFD700" fontWeight="bold">ॐ</text>
              </svg>
            </div>
          );
        }

        if (item.type === 'flame') {
          return (
            <div
              key={item.id}
              className="absolute dussehra-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `flame-flicker ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`flame-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFF00" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FF4500" />
                  </linearGradient>
                </defs>
                <path
                  d="M15 5 Q10 15 15 25 Q12 30 15 38 Q18 30 15 25 Q20 15 15 5"
                  fill={`url(#flame-${item.id})`}
                  opacity="0.8"
                />
                <path
                  d="M15 10 Q13 17 15 23 Q17 17 15 10"
                  fill="#FFFF00"
                  opacity="0.6"
                />
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * Stars (for New Year) - Enhanced with fireworks, confetti, champagne, balloons, 2026, party poppers
 */
function Stars({ count }: { count: number }) {
  const decorations = React.useMemo(() => {
    const items: Array<{
      type: string;
      id: string;
      left: string;
      top?: string;
      size: number;
      delay: number;
      duration: number;
      drift?: number;
      color?: string;
      shape?: string;
    }> = [];
    
    // Reduced counts (50% reduction)
    const fireworkCount = Math.ceil(count * 0.1);
    const confettiCount = Math.ceil(count * 0.15);
    const champagneCount = Math.ceil(count * 0.03);
    const balloonCount = Math.ceil(count * 0.08);
    const numberCount = Math.ceil(count * 0.03);
    const popperCount = Math.ceil(count * 0.05);
    const sparklerCount = Math.ceil(count * 0.08);
    
    const fireworkColors = ['#FFD700', '#FF1493', '#00CED1', '#FF69B4', '#32CD32', '#FF6347'];
    const confettiShapes = ['circle', 'star', 'heart'];
    const confettiColors = ['#FFD700', '#C0C0C0', '#FF69B4', '#00CED1', '#FF6347'];
    const balloonColors = ['#FFD700', '#C0C0C0', '#FF69B4', '#00CED1'];

    // Generate smart positions for each decoration type
    const fireworkPositions = generateSmartPositions(fireworkCount, {
      minSpacing: 180,
      edgePadding: 10,
      centerExclusion: { width: 50, height: 35 },
      sizeMultiplier: 1.2,
      gridCellSize: 200,
    });
    const confettiPositions = generateSmartPositions(confettiCount, {
      minSpacing: 70,
      edgePadding: 5,
      centerExclusion: { width: 30, height: 20 },
      sizeMultiplier: 0.3,
      gridCellSize: 100,
    });
    const champagnePositions = generateSmartPositions(champagneCount, {
      minSpacing: 160,
      edgePadding: 10,
      centerExclusion: { width: 48, height: 35 },
      sizeMultiplier: 0.8,
      gridCellSize: 185,
    });
    const balloonPositions = generateSmartPositions(balloonCount, {
      minSpacing: 140,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 165,
    });
    const numberPositions = generateSmartPositions(numberCount, {
      minSpacing: 170,
      edgePadding: 10,
      centerExclusion: { width: 50, height: 35 },
      sizeMultiplier: 1,
      gridCellSize: 190,
    });
    const popperPositions = generateSmartPositions(popperCount, {
      minSpacing: 150,
      edgePadding: 10,
      centerExclusion: { width: 45, height: 32 },
      sizeMultiplier: 0.9,
      gridCellSize: 175,
    });
    const sparklerPositions = generateSmartPositions(sparklerCount, {
      minSpacing: 135,
      edgePadding: 8,
      centerExclusion: { width: 42, height: 30 },
      sizeMultiplier: 0.7,
      gridCellSize: 160,
    });

    // Firework explosions - reduced size (40-80px instead of 60-160px)
    fireworkPositions.forEach((pos, i) => {
      // Keep fireworks in upper area
      const topValue = parseFloat(pos.top?.replace('%', '') || '50');
      const adjustedTop = topValue > 60 ? `${Math.random() * 60}%` : pos.top;
      
      items.push({
        type: 'firework',
        id: `nyfw-${i}`,
        left: pos.left,
        top: adjustedTop,
        size: 40 + Math.random() * 40,
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 2,
        color: fireworkColors[Math.floor(Math.random() * fireworkColors.length)],
      });
    });

    // Confetti - reduced size (6-12px instead of 8-20px)
    confettiPositions.forEach((pos, i) => {
      items.push({
        type: 'confetti',
        id: `confetti-${i}`,
        left: pos.left,
        size: 6 + Math.random() * 6,
        delay: Math.random() * 3,
        duration: 5 + Math.random() * 5,
        drift: -40 + Math.random() * 80,
        shape: confettiShapes[Math.floor(Math.random() * confettiShapes.length)],
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      });
    });

    // Champagne bottles - reduced size (28-45px instead of 40-70px)
    champagnePositions.forEach((pos, i) => {
      items.push({
        type: 'champagne',
        id: `champ-${i}`,
        left: pos.left,
        top: pos.top,
        size: 28 + Math.random() * 17,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 2,
      });
    });

    // Balloons - reduced size (22-35px instead of 30-55px)
    balloonPositions.forEach((pos, i) => {
      items.push({
        type: 'balloon',
        id: `balloon-${i}`,
        left: pos.left,
        size: 22 + Math.random() * 13,
        delay: Math.random() * 6,
        duration: 15 + Math.random() * 10,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
      });
    });

    // 2026 numbers - reduced size (35-55px instead of 50-90px)
    numberPositions.forEach((pos, i) => {
      items.push({
        type: 'number',
        id: `year-${i}`,
        left: pos.left,
        top: pos.top,
        size: 35 + Math.random() * 20,
        delay: Math.random() * 3,
        duration: 4 + Math.random() * 3,
      });
    });

    // Party poppers - reduced size (35-55px instead of 50-90px)
    popperPositions.forEach((pos, i) => {
      items.push({
        type: 'popper',
        id: `popper-${i}`,
        left: pos.left,
        top: pos.top,
        size: 35 + Math.random() * 20,
        delay: Math.random() * 4,
        duration: 2 + Math.random() * 2,
      });
    });

    // Sparklers - reduced size (28-42px instead of 40-70px)
    sparklerPositions.forEach((pos, i) => {
      items.push({
        type: 'sparkler',
        id: `sparkler-${i}`,
        left: pos.left,
        top: pos.top,
        size: 28 + Math.random() * 14,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
      });
    });

    return items;
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes firework-explode {
          0% { opacity: 0; transform: scale(0); }
          20% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes confetti-fall {
          0% { 
            transform: translateY(-100px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { 
            transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes champagne-pop {
          0%, 80% { opacity: 0; transform: translateY(0) scale(1); }
          85% { opacity: 1; transform: translateY(-20px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
        }
        @keyframes balloon-float {
          0% { 
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { 
            transform: translateY(-100px) rotate(180deg);
            opacity: 0;
          }
        }
        @keyframes number-glitter {
          0%, 100% { opacity: 0.6; transform: scale(0.9) rotate(-5deg); }
          50% { opacity: 1; transform: scale(1.1) rotate(5deg); }
        }
        @keyframes popper-burst {
          0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          30% { opacity: 1; transform: scale(1.2) rotate(45deg); }
          100% { opacity: 0; transform: scale(2) rotate(90deg); }
        }
        @keyframes sparkler-shine {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .newyear-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {decorations.map((item) => {
        if (item.type === 'firework') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `firework-explode ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`nyfw-${item.id}`}>
                    <stop offset="0%" stopColor="#FFF" stopOpacity="1" />
                    <stop offset="50%" stopColor={item.color} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Radiating burst */}
                {Array.from({ length: 20 }, (_, i) => {
                  const angle = (i * 360) / 20;
                  return (
                    <g key={i}>
                      <line
                        x1="50"
                        y1="50"
                        x2={50 + 48 * Math.cos((angle * Math.PI) / 180)}
                        y2={50 + 48 * Math.sin((angle * Math.PI) / 180)}
                        stroke={item.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle
                        cx={50 + 48 * Math.cos((angle * Math.PI) / 180)}
                        cy={50 + 48 * Math.sin((angle * Math.PI) / 180)}
                        r="3"
                        fill={item.color}
                      />
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="45" fill={`url(#nyfw-${item.id})`} />
              </svg>
            </div>
          );
        }

        if (item.type === 'confetti') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `confetti-fall ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
                // @ts-expect-error - CSS custom property
                '--drift': `${item.drift}px`,
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {item.shape === 'circle' && <circle cx="10" cy="10" r="8" fill={item.color} />}
                {item.shape === 'star' && (
                  <path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" fill={item.color} />
                )}
                {item.shape === 'heart' && (
                  <path
                    d="M10 16 Q5 12 5 8 Q5 5 7.5 5 Q10 5 10 8 Q10 5 12.5 5 Q15 5 15 8 Q15 12 10 16"
                    fill={item.color}
                  />
                )}
              </svg>
            </div>
          );
        }

        if (item.type === 'champagne') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `champagne-pop ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`champ-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2D5016" />
                    <stop offset="100%" stopColor="#1A3010" />
                  </linearGradient>
                </defs>
                {/* Bottle */}
                <rect x="8" y="20" width="14" height="25" rx="2" fill={`url(#champ-${item.id})`} />
                <rect x="10" y="15" width="10" height="5" fill="#8B7355" />
                {/* Cork popping */}
                <rect x="12" y="8" width="6" height="7" rx="1" fill="#D2691E" />
                {/* Bubbles */}
                <circle cx="15" cy="5" r="2" fill="#FFD700" opacity="0.7" />
                <circle cx="11" cy="3" r="1.5" fill="#FFD700" opacity="0.6" />
                <circle cx="19" cy="4" r="1.5" fill="#FFD700" opacity="0.6" />
                {/* Label */}
                <rect x="10" y="28" width="10" height="8" fill="#FFD700" opacity="0.8" />
              </svg>
            </div>
          );
        }

        if (item.type === 'balloon') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `balloon-float ${item.duration}s linear infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 30 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`balloon-${item.id}`}>
                    <stop offset="0%" stopColor="#FFF" stopOpacity="0.5" />
                    <stop offset="50%" stopColor={item.color} stopOpacity="0.9" />
                    <stop offset="100%" stopColor={item.color} stopOpacity="1" />
                  </radialGradient>
                </defs>
                {/* Balloon */}
                <ellipse cx="15" cy="15" rx="12" ry="15" fill={`url(#balloon-${item.id})`} />
                {/* Shine */}
                <ellipse cx="11" cy="10" rx="4" ry="6" fill="#FFF" opacity="0.4" />
                {/* Knot */}
                <path d="M15 30 Q13 32 15 34" stroke={item.color} strokeWidth="2" fill="none" />
                {/* String */}
                <line x1="15" y1="34" x2="15" y2="45" stroke="#888" strokeWidth="1" />
              </svg>
            </div>
          );
        }

        if (item.type === 'number') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `number-glitter ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`year-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="50%" stopColor="#FFA500" />
                    <stop offset="100%" stopColor="#FFD700" />
                  </linearGradient>
                  <filter id={`glitter-${item.id}`}>
                    <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <text
                  x="40"
                  y="22"
                  fontSize="20"
                  fontWeight="bold"
                  fill={`url(#year-${item.id})`}
                  textAnchor="middle"
                  filter={`url(#glitter-${item.id})`}
                >
                  2026
                </text>
              </svg>
            </div>
          );
        }

        if (item.type === 'popper') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `popper-burst ${item.duration}s ease-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Streamers */}
                {Array.from({ length: 8 }, (_, i) => {
                  const angle = (i * 360) / 8;
                  const colors = ['#FFD700', '#FF69B4', '#00CED1', '#FF6347'];
                  return (
                    <path
                      key={i}
                      d={`M30 30 Q${30 + 25 * Math.cos((angle * Math.PI) / 180)} ${
                        30 + 25 * Math.sin((angle * Math.PI) / 180)
                      } ${30 + 28 * Math.cos((angle * Math.PI) / 180)} ${
                        30 + 28 * Math.sin((angle * Math.PI) / 180)
                      }`}
                      stroke={colors[i % colors.length]}
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })}
                {/* Center burst */}
                <circle cx="30" cy="30" r="8" fill="#FFD700" opacity="0.8" />
              </svg>
            </div>
          );
        }

        if (item.type === 'sparkler') {
          return (
            <div
              key={item.id}
              className="absolute newyear-decor"
              style={{
                left: item.left,
                top: item.top,
                width: `${item.size}px`,
                height: `${item.size}px`,
                animation: `sparkler-shine ${item.duration}s ease-in-out infinite`,
                animationDelay: `${item.delay}s`,
              }}
            >
              <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id={`sparkler-${item.id}`}>
                    <stop offset="0%" stopColor="#FFF" />
                    <stop offset="50%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FF8C00" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Stick */}
                <line x1="20" y1="15" x2="20" y2="60" stroke="#8B4513" strokeWidth="2" />
                {/* Sparkles */}
                <circle cx="20" cy="12" r="10" fill={`url(#sparkler-${item.id})`} opacity="0.8" />
                {Array.from({ length: 6 }, (_, i) => {
                  const angle = (i * 360) / 6;
                  return (
                    <line
                      key={i}
                      x1="20"
                      y1="12"
                      x2={20 + 8 * Math.cos((angle * Math.PI) / 180)}
                      y2={12 + 8 * Math.sin((angle * Math.PI) / 180)}
                      stroke="#FFD700"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>
            </div>
          );
        }

        return null;
      })}
    </>
  );
}

/**
 * Sparkles (Universal decoration)
 */
function Sparkles({ count }: { count: number }) {
  const sparkles = React.useMemo(() => {
    // Use smart positioning for sparkles
    const positions = generateSmartPositions(count, {
      minSpacing: 80,
      edgePadding: 5,
      centerExclusion: { width: 35, height: 25 },
      sizeMultiplier: 0.3,
      gridCellSize: 120,
    });
    
    return positions.map((pos, i) => ({
      id: i,
      left: pos.left,
      top: pos.top,
      size: 3 + Math.random() * 5, // Reduced from 4-12px to 3-8px
      delay: Math.random() * 2,
      duration: 1 + Math.random() * 1.5,
    }));
  }, [count]);

  return (
    <>
      <style jsx>{`
        @keyframes sparkle-pop {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sparkle-decor { animation: none !important; opacity: 0.5 !important; }
        }
      `}</style>
      {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute rounded-full sparkle-decor"
            style={{
              left: sparkle.left,
              top: sparkle.top,
              width: `${sparkle.size}px`,
              height: `${sparkle.size}px`,
              backgroundColor: "var(--festival-accent, #D4A5FF)",
              boxShadow: "0 0 10px var(--festival-accent, #D4A5FF)",
              animation: `sparkle-pop ${sparkle.duration}s ease-in-out infinite`,
              animationDelay: `${sparkle.delay}s`,
            }}
          />
      ))}
    </>
  );
}
