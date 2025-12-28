"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatedCard } from "@/components/AnimatedCard";
import { Badge } from "@/components/ui/badge";
import type { Story } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BookCardProps {
  story: Story;
  index?: number;
}

const BookCard = React.forwardRef<HTMLDivElement, BookCardProps>(
  ({ story, index = 0 }, ref) => {
    const staggerDelay = index * 0.1;
    const [imageError, setImageError] = React.useState(false);

    return (
      <AnimatedCard
        ref={ref}
        initialDelay={staggerDelay}
        hoverScale={1.02}
        hoverY={-8}
        className={cn(
          "group overflow-hidden",
          "bg-white/80 backdrop-blur-sm",
          "border-2 border-transparent",
          "bg-gradient-to-br from-white via-white to-purple-50",
          "hover:border-[var(--purple-primary)]",
          "focus-within:ring-2 focus-within:ring-[var(--purple-primary)] focus-within:ring-offset-2"
        )}
      >
        <Link
          href={`/books/${story.id}`}
          className="block focus:outline-none"
          aria-label={`Read ${story.title} by ${story.author}`}
        >
          {/* Book Cover Image */}
          <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-xl bg-gradient-to-br from-purple-100 to-pink-100">
            {!imageError ? (
              <Image
                src={story.coverImage}
                alt={`Cover of ${story.title}`}
                fill
                className={cn(
                  "object-cover",
                  "transition-transform duration-500 ease-out",
                  "group-hover:scale-105"
                )}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 3}
                unoptimized
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUzMyIgZmlsbD0iI0Y3RDhFOSIvPjwvc3ZnPg=="
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200">
                <svg
                  className="w-24 h-24 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 7.5v12zm0 0A2.5 2.5 0 0 0 6.5 22H20a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H6.5a2.5 2.5 0 0 1-2.5-2.5v-8z" />
                  <path d="M6 12h12v2H6z" />
                  <path d="M6 8h12v2H6z" />
                </svg>
              </div>
            )}
            {/* Gradient overlay on hover */}
            <div className={cn(
              "absolute inset-0",
              "bg-gradient-to-t from-[var(--purple-primary)]/20 to-transparent",
              "opacity-0 group-hover:opacity-100",
              "transition-opacity duration-500"
            )} />
          </div>

          {/* Content Section */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3
              className={cn(
                "font-semibold text-lg leading-tight",
                "text-[var(--purple-primary)]",
                "line-clamp-2",
                "group-hover:text-[var(--purple-dark)]",
                "transition-colors duration-300"
              )}
              title={story.title}
            >
              {story.title}
            </h3>

            {/* Description */}
            <p
              className={cn(
                "text-sm text-gray-600 leading-relaxed",
                "line-clamp-3"
              )}
              title={story.description}
            >
              {story.description}
            </p>

            {/* Category Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {story.labels.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    "bg-gradient-to-r from-purple-100 to-pink-100",
                    "text-[var(--purple-dark)]",
                    "border border-[var(--purple-primary)]/20",
                    "hover:from-purple-200 hover:to-pink-200",
                    "transition-all duration-300"
                  )}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      </AnimatedCard>
    );
  }
);

BookCard.displayName = "BookCard";

export { BookCard };
export type { BookCardProps };
