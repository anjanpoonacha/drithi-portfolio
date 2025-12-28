"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
  initialDelay?: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverScale = 1, hoverY = -6, initialDelay = 0 }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-lg transition-shadow duration-300 ease-out",
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: initialDelay,
          ease: "easeOut",
        }}
        whileHover={{
          y: hoverY,
          scale: hoverScale,
          boxShadow: "0 12px 24px rgba(155, 89, 182, 0.15)",
          transition: { duration: 0.3, ease: "easeOut" },
        }}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };
export type { AnimatedCardProps };
