"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StoryNavigationProps {
  previousStory: Story | null;
  nextStory: Story | null;
  currentStoryId: string;
}

const StoryNavigation = React.forwardRef<HTMLDivElement, StoryNavigationProps>(
  ({ previousStory, nextStory, currentStoryId }, ref) => {
    // Get total story count (optional feature)
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // Smooth scroll to top when navigating
    const handleNavigation = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!mounted) {
      return null;
    }

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full px-4 sm:w-auto sm:px-0"
          role="navigation"
          aria-label="Story navigation"
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-lg rounded-full p-2 shadow-xl border border-[var(--purple-primary)]/20">
            {/* Previous Story Button */}
            {previousStory ? (
              <Link
                href={`/books/${previousStory.id}`}
                onClick={handleNavigation}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)] rounded-full"
                aria-label={`Previous story: ${previousStory.title}`}
                title={previousStory.title}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full",
                    "bg-gradient-to-r from-[var(--purple-primary)] to-[var(--pink-accent)]",
                    "text-white font-medium text-sm sm:text-base",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-[var(--purple-primary)]/50"
                  )}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Previous</span>
                </motion.div>
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full",
                  "bg-gray-300/50 text-gray-400 font-medium text-sm sm:text-base",
                  "opacity-50 cursor-not-allowed"
                )}
                aria-disabled="true"
                aria-label="No previous story"
                title="This is the first story"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Previous</span>
              </div>
            )}

            {/* Back to Books Button */}
            <Link
              href="/books"
              onClick={handleNavigation}
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)] rounded-full"
              aria-label="Back to books list"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full",
                  "bg-white border-2 border-[var(--purple-primary)]",
                  "text-[var(--purple-primary)] font-semibold text-sm sm:text-base",
                  "transition-all duration-300 hover:bg-[var(--purple-primary)] hover:text-white",
                  "hover:shadow-lg hover:shadow-[var(--purple-primary)]/30"
                )}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Back to Books</span>
                <span className="sm:hidden">Books</span>
              </motion.div>
            </Link>

            {/* Next Story Button */}
            {nextStory ? (
              <Link
                href={`/books/${nextStory.id}`}
                onClick={handleNavigation}
                className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-primary)] rounded-full"
                aria-label={`Next story: ${nextStory.title}`}
                title={nextStory.title}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full",
                    "bg-gradient-to-r from-[var(--purple-primary)] to-[var(--pink-accent)]",
                    "text-white font-medium text-sm sm:text-base",
                    "transition-all duration-300 hover:shadow-lg hover:shadow-[var(--purple-primary)]/50"
                  )}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </motion.div>
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full",
                  "bg-gray-300/50 text-gray-400 font-medium text-sm sm:text-base",
                  "opacity-50 cursor-not-allowed"
                )}
                aria-disabled="true"
                aria-label="No next story"
                title="This is the last story"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

StoryNavigation.displayName = "StoryNavigation";

export { StoryNavigation };
export type { StoryNavigationProps };
