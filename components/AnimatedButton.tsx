"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Sparkles } from "lucide-react";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends Omit<HTMLMotionProps<"button">, "className" | "children">,
    VariantProps<typeof buttonVariants> {
  showSparkle?: boolean;
  hoverScale?: number;
  tapScale?: number;
  className?: string;
  children?: React.ReactNode;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant,
      size,
      showSparkle = false,
      hoverScale = 1.02,
      tapScale = 0.98,
      children,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <motion.button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        {...props}
      >
        <span className="relative inline-flex items-center gap-2">
          {children}
          {showSparkle && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
                rotate: isHovered ? [0, 10, -10, 0] : 0,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
            >
              <Sparkles className="h-4 w-4 text-pink-300" />
            </motion.span>
          )}
        </span>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
export type { AnimatedButtonProps };
