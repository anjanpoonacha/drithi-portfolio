"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DecorativeBorderProps {
  children: React.ReactNode;
  variant?: "soft" | "medium" | "strong";
  showAnimation?: boolean;
  className?: string;
}

export function DecorativeBorder({
  children,
  variant = "medium",
  showAnimation = true,
  className,
}: DecorativeBorderProps) {
  // Glow intensity based on variant
  const getGlowValues = () => {
    const base = variant === "soft" ? 8 : variant === "medium" ? 12 : 16;
    const peak = variant === "soft" ? 12 : variant === "medium" ? 16 : 20;
    return {
      base: `drop-shadow(0 0 ${base}px rgba(255, 105, 180, 0.5))`,
      peak: `drop-shadow(0 0 ${peak}px rgba(155, 89, 182, 0.6))`,
    };
  };

  const glowValues = getGlowValues();

  // Cherry blossom SVG corner decoration
  const CherryBlossomCorner = ({ rotation }: { rotation: number }) => (
    <motion.svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute pointer-events-none"
      style={{
        transform: `rotate(${rotation}deg)`,
        ...(rotation === 0 && { top: 0, left: 0 }),
        ...(rotation === 90 && { top: 0, right: 0 }),
        ...(rotation === 180 && { bottom: 0, right: 0 }),
        ...(rotation === 270 && { bottom: 0, left: 0 }),
      }}
      initial={{
        filter: glowValues.base,
      }}
      animate={
        showAnimation
          ? {
              filter: [glowValues.base, glowValues.peak, glowValues.base],
            }
          : undefined
      }
      transition={{
        duration: 2.5,
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      {/* Branch */}
      <path
        d="M 2 2 Q 15 10, 30 20 Q 40 28, 48 38"
        stroke={`url(#branchGradient-${rotation})`}
        strokeWidth="1.5"
        fill="none"
        opacity="0.8"
      />
      
      {/* Main blossom */}
      <g transform="translate(28, 18)">
        <circle cx="0" cy="0" r="5" fill={`url(#petalGradient1-${rotation})`} opacity="0.9" />
        <circle cx="4" cy="3" r="5" fill={`url(#petalGradient2-${rotation})`} opacity="0.85" />
        <circle cx="-4" cy="3" r="5" fill={`url(#petalGradient1-${rotation})`} opacity="0.85" />
        <circle cx="3" cy="-4" r="5" fill={`url(#petalGradient2-${rotation})`} opacity="0.85" />
        <circle cx="-3" cy="-4" r="5" fill={`url(#petalGradient1-${rotation})`} opacity="0.85" />
        <circle cx="0" cy="0" r="2.5" fill="#FFD700" opacity="0.9" />
      </g>

      {/* Secondary blossom */}
      <g transform="translate(45, 35)">
        <circle cx="0" cy="0" r="4" fill={`url(#petalGradient2-${rotation})`} opacity="0.8" />
        <circle cx="3" cy="2" r="4" fill={`url(#petalGradient1-${rotation})`} opacity="0.75" />
        <circle cx="-3" cy="2" r="4" fill={`url(#petalGradient2-${rotation})`} opacity="0.75" />
        <circle cx="2" cy="-3" r="4" fill={`url(#petalGradient1-${rotation})`} opacity="0.75" />
        <circle cx="-2" cy="-3" r="4" fill={`url(#petalGradient2-${rotation})`} opacity="0.75" />
        <circle cx="0" cy="0" r="2" fill="#FFD700" opacity="0.8" />
      </g>

      {/* Small bud */}
      <g transform="translate(15, 12)">
        <ellipse cx="0" cy="0" rx="2.5" ry="3.5" fill={`url(#budGradient-${rotation})`} opacity="0.7" />
      </g>

      {/* Leaves */}
      <path
        d="M 20 15 Q 18 18, 20 21 Q 22 18, 20 15"
        fill={`url(#leafGradient-${rotation})`}
        opacity="0.6"
      />
      <path
        d="M 38 30 Q 36 33, 38 36 Q 40 33, 38 30"
        fill={`url(#leafGradient-${rotation})`}
        opacity="0.6"
      />

      {/* Gradients - unique IDs per corner to avoid conflicts */}
      <defs>
        <linearGradient id={`petalGradient1-${rotation}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" stopOpacity="1" />
          <stop offset="100%" stopColor="#FF69B4" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`petalGradient2-${rotation}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFC0CB" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFB6C1" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`budGradient-${rotation}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`leafGradient-${rotation}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9B59B6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#8E44AD" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`branchGradient-${rotation}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8E44AD" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#9B59B6" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </motion.svg>
  );

  return (
    <motion.div
      className={cn("relative", className)}
      initial={{
        scale: 1,
      }}
      animate={
        showAnimation
          ? {
              scale: [1, 1.02, 1],
            }
          : undefined
      }
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "loop",
      }}
    >
      {/* Corner decorations */}
      <CherryBlossomCorner rotation={0} />
      <CherryBlossomCorner rotation={90} />
      <CherryBlossomCorner rotation={180} />
      <CherryBlossomCorner rotation={270} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

DecorativeBorder.displayName = "DecorativeBorder";
