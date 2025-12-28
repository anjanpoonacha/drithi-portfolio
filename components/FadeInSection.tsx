"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  threshold?: number;
}

const FadeInSection = React.forwardRef<HTMLDivElement, FadeInSectionProps>(
  (
    {
      children,
      className,
      delay = 0,
      duration = 0.6,
      y = 20,
      threshold = 0.1,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: threshold }}
        transition={{
          duration,
          delay,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    );
  }
);

FadeInSection.displayName = "FadeInSection";

export { FadeInSection };
export type { FadeInSectionProps };
